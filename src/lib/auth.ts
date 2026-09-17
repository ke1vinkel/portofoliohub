import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import {
  turso,
  initDatabase,
  ensureUserProfileAndPortfolio,
  queryAuthDb,
} from './turso';

export const SESSION_COOKIE = 'portfolio_session';
export const SESSION_LENGTH_MS = 8 * 60 * 60 * 1000; // 8 hours
export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const PASSWORD_HASH_ROUNDS = 12;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hashLoginIdentifier(identifier: string): string {
  return createHash('sha256').update(identifier.trim().toLowerCase()).digest('hex');
}

export function safeLegacyPasswordCompare(password: string, legacy: string): boolean {
  const passwordDigest = createHash('sha256').update(password.trim()).digest();
  const legacyDigest = createHash('sha256').update(legacy.trim()).digest();

  return timingSafeEqual(passwordDigest, legacyDigest);
}

export async function getPasswordHash(userId: string): Promise<string | null> {
  await initDatabase();

  const result = await turso.execute({
    sql: 'SELECT password_hash FROM app_credentials WHERE user_id = ? LIMIT 1',
    args: [userId],
  });

  return result.rows[0] ? String(result.rows[0].password_hash) : null;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function savePasswordHash(userId: string, password: string): Promise<void> {
  await initDatabase();

  const passwordHash = await hash(password, PASSWORD_HASH_ROUNDS);
  const timestamp = new Date().toISOString();

  await turso.execute({
    sql: `INSERT INTO app_credentials (user_id, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            password_hash = excluded.password_hash,
            updated_at = excluded.updated_at`,
    args: [userId, passwordHash, timestamp, timestamp],
  });
}

export async function getLoginLock(identifier: string): Promise<Date | null> {
  await initDatabase();

  const identifierHash = hashLoginIdentifier(identifier);
  const result = await turso.execute({
    sql: 'SELECT locked_until FROM login_attempts WHERE identifier_hash = ? LIMIT 1',
    args: [identifierHash],
  });

  const lockedUntil = result.rows[0]?.locked_until;
  if (!lockedUntil) return null;

  const lockExpiresAt = new Date(String(lockedUntil));
  if (lockExpiresAt.getTime() > Date.now()) return lockExpiresAt;

  await turso.execute({
    sql: 'DELETE FROM login_attempts WHERE identifier_hash = ?',
    args: [identifierHash],
  });

  return null;
}

export async function recordFailedLogin(identifier: string): Promise<Date | null> {
  await initDatabase();

  const identifierHash = hashLoginIdentifier(identifier);
  const result = await turso.execute({
    sql: 'SELECT failed_attempts, window_started_at, locked_until FROM login_attempts WHERE identifier_hash = ? LIMIT 1',
    args: [identifierHash],
  });

  const row = result.rows[0];
  const now = new Date();
  const previousLock = row?.locked_until ? new Date(String(row.locked_until)) : null;
  const windowStartedAt = row?.window_started_at ? new Date(String(row.window_started_at)) : null;

  const startsNewWindow =
    !windowStartedAt ||
    now.getTime() - windowStartedAt.getTime() >= LOGIN_WINDOW_MS ||
    (previousLock !== null && previousLock.getTime() <= now.getTime());

  const failedAttempts = startsNewWindow ? 1 : Number(row?.failed_attempts ?? 0) + 1;
  const nextWindowStartedAt = startsNewWindow ? now : windowStartedAt;
  const lockedUntil = failedAttempts >= LOGIN_ATTEMPT_LIMIT ? new Date(now.getTime() + LOGIN_WINDOW_MS) : null;

  await turso.execute({
    sql: `INSERT INTO login_attempts (identifier_hash, failed_attempts, window_started_at, locked_until, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(identifier_hash) DO UPDATE SET
            failed_attempts = excluded.failed_attempts,
            window_started_at = excluded.window_started_at,
            locked_until = excluded.locked_until,
            updated_at = excluded.updated_at`,
    args: [
      identifierHash,
      failedAttempts,
      nextWindowStartedAt.toISOString(),
      lockedUntil ? lockedUntil.toISOString() : null,
      now.toISOString(),
    ],
  });

  return lockedUntil;
}

export async function clearLoginAttempts(identifier: string): Promise<void> {
  await initDatabase();

  await turso.execute({
    sql: 'DELETE FROM login_attempts WHERE identifier_hash = ?',
    args: [hashLoginIdentifier(identifier)],
  });
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  username: string;
}

export async function createUserSession(userId: string): Promise<string> {
  await initDatabase();

  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_LENGTH_MS);

  await turso.execute({
    sql: `INSERT INTO app_sessions (token_hash, user_id, expires_at, created_at)
          VALUES (?, ?, ?, ?)`,
    args: [hashToken(token), userId, expiresAt.toISOString(), now.toISOString()],
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  await initDatabase();

  const sessionResult = await turso.execute({
    sql: `SELECT user_id FROM app_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1`,
    args: [hashToken(token), new Date().toISOString()],
  });

  const session = sessionResult.rows[0];
  if (!session) {
    return null;
  }

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
       WHERE users.id = ?
       ORDER BY CASE roles.name WHEN 'lecturer' THEN 0 ELSE 1 END
       LIMIT 1`,
      [String(session.user_id)]
    );

    const userRow = rows[0];
    if (!userRow) {
      return null;
    }

    const userId = String(userRow.id);
    const userName = String(userRow.name || 'User');
    const roleNameStr = String(userRow.role_name || userRow.role_id || '').toLowerCase().trim();
    const nimStr = String(userRow.nim || '').trim().toUpperCase();
    const isLecturerNim = /^D\d+/i.test(nimStr);
    const primaryRole: 'student' | 'lecturer' =
      roleNameStr === 'lecturer' || roleNameStr === 'dosen' || roleNameStr === '3' || isLecturerNim
        ? 'lecturer'
        : 'student';

    const cleanEmail = String(userRow.email || '').toLowerCase().trim();
    const nameSlug = userName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const emailSlug = (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');

    const finalUsername = nameSlug || emailSlug || 'user';

    return {
      id: userId,
      name: userName,
      role: primaryRole,
      username: finalUsername,
      email: cleanEmail,
    };
  } catch (e) {
    console.error('Error querying user for session:', e);
    return null;
  }
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await initDatabase();
    await turso.execute({
      sql: 'DELETE FROM app_sessions WHERE token_hash = ?',
      args: [hashToken(token)],
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export function newUserId(): string {
  return randomUUID();
}
