import { z } from 'zod';
import {
  clearLoginAttempts,
  createUserSession,
  getLoginLock,
  getPasswordHash,
  recordFailedLogin,
  safeLegacyPasswordCompare,
  savePasswordHash,
  verifyPassword,
} from '@/lib/auth';
import { queryAuthDb, ensureUserProfileAndPortfolio } from '@/lib/turso';

const loginSchema = z.object({
  username: z.string().trim().toLowerCase(),
  password: z
    .string()
    .min(1)
    .max(72)
    .refine(
      (val) => new TextEncoder().encode(val).length <= 72,
      'Password is too long.'
    ),
});

function rateLimitResponse(lockedUntil: Date) {
  const retryAfter = Math.max(
    1,
    Math.ceil((lockedUntil.getTime() - Date.now()) / 1000)
  );

  return Response.json(
    { error: 'Too many sign-in attempts. Try again in 15 minutes.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(rawBody);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid email or password format.' },
        { status: 400 }
      );
    }

    const { username: cleanEmail, password: cleanPassword } = parsed.data;

    const existingLock = await getLoginLock(cleanEmail);
    if (existingLock) {
      return rateLimitResponse(existingLock);
    }

    // Lookup user in Central Auth DB
    let userRow: any = null;
    try {
      const rows = await queryAuthDb(
        `SELECT 
           users.id, 
           users.email, 
           users.nim, 
           users.name, 
           roles.name AS role_name
         FROM users
         LEFT JOIN user_roles ON user_roles.user_id = users.id
         LEFT JOIN roles ON roles.id = user_roles.role_id
         WHERE LOWER(users.email) = ?
         ORDER BY CASE roles.name WHEN 'lecturer' THEN 0 ELSE 1 END
         LIMIT 1`,
        [cleanEmail]
      );
      if (rows.length > 0) {
        userRow = rows[0];
      }
    } catch (e) {
      console.error('Error querying Central Auth database:', e);
      return Response.json(
        { error: 'Authentication service temporarily unavailable.' },
        { status: 503 }
      );
    }

    let passwordMatches = false;
    let userId = '';

    if (userRow) {
      userId = String(userRow.id);
      const passwordHash = await getPasswordHash(userId);

      if (passwordHash) {
        passwordMatches = await verifyPassword(cleanPassword, passwordHash);
      } else {
        // Legacy check against Central Auth NIM
        const legacyNim = String(userRow.nim || '').trim();
        passwordMatches =
          legacyNim.length > 0 &&
          safeLegacyPasswordCompare(cleanPassword, legacyNim);

        if (passwordMatches) {
          await savePasswordHash(userId, cleanPassword);
        }
      }
    }

    if (!userRow || !passwordMatches) {
      const lockedUntil = await recordFailedLogin(cleanEmail);
      if (lockedUntil) {
        return rateLimitResponse(lockedUntil);
      }

      return Response.json(
        { error: 'Invalid Email or NIM. Please try again.' },
        { status: 401 }
      );
    }

    await clearLoginAttempts(cleanEmail);

    const userName = String(userRow.name || 'User');
    const roleNameStr = String(userRow.role_name || userRow.role_id || '').toLowerCase().trim();
    const nimStr = String(userRow.nim || '').trim().toUpperCase();
    const isLecturerNim = /^D\d+/i.test(nimStr);
    const primaryRole: 'student' | 'lecturer' =
      roleNameStr === 'lecturer' || roleNameStr === 'dosen' || roleNameStr === '3' || isLecturerNim
        ? 'lecturer'
        : 'student';

    // Auto-provision profile & default portfolio in App Data DB for students
    if (primaryRole === 'student') {
      await ensureUserProfileAndPortfolio(userId, userName);
    }

    await createUserSession(userId);

    const nameSlug = userName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const emailSlug = (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');

    const finalUsername = nameSlug || emailSlug || 'user';

    return Response.json({
      ok: true,
      user: {
        id: userId,
        name: userName,
        role: primaryRole,
        username: finalUsername,
        email: cleanEmail,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return Response.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
