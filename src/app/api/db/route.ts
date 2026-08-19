import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase, ensureUserProfileAndPortfolio, queryAuthDb } from '@/lib/turso';

export async function GET() {
  try {
    await initDatabase();

    // Auto-provision profile ONLY for students if they don't have one yet
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const u = session.user as any;
        if (u.role === 'student') {
          await ensureUserProfileAndPortfolio(String(u.id), String(u.name || u.email || 'User'));
        }
      }
    } catch (provErr) {
      console.error('Profile auto-provision error (non-fatal):', provErr);
    }

    // Execute central Auth DB query and all Portfolio DB queries in parallel for optimal speed
    const [
      userRows,
      profilesRes,
      portfoliosRes,
      projectsRes,
      educationRes,
      experiencesRes,
      messagesRes,
    ] = await Promise.all([
      queryAuthDb(`
        SELECT 
          users.id, 
          users.email, 
          users.nim, 
          users.name, 
          roles.name AS role_name
        FROM users
        LEFT JOIN user_roles ON user_roles.user_id = users.id
        LEFT JOIN roles ON roles.id = user_roles.role_id
        GROUP BY users.id
        ORDER BY users.name ASC
      `),
      turso.execute('SELECT * FROM profiles'),
      turso.execute('SELECT * FROM portfolios'),
      turso.execute('SELECT * FROM projects'),
      turso.execute('SELECT * FROM education'),
      turso.execute('SELECT * FROM experiences'),
      turso.execute('SELECT * FROM recruiter_messages'),
    ]);

    const users = userRows.map((row: any) => {
      const email = String(row.email || '');
      const name = String(row.name || '');
      const nameSlug = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      const emailSlug = email.split('@')[0] || 'user';
      const roleNameStr = String(row.role_name || row.role_id || '').toLowerCase().trim();
      const nimStr = String(row.nim || '').trim().toUpperCase();
      const isLecturerNim = /^D\d+/i.test(nimStr);
      const role: 'student' | 'lecturer' = (roleNameStr === 'lecturer' || roleNameStr === 'dosen' || roleNameStr === '3' || isLecturerNim) ? 'lecturer' : 'student';
      return {
        id: String(row.id),
        email,
        nim: String(row.nim || ''),
        name,
        role,
        username: nameSlug || emailSlug,
      };
    });

    // Parse JSON columns in profiles
    const profiles: Record<string, any> = {};
    profilesRes.rows.forEach((row: any) => {
      profiles[row.user_id] = {
        ...row,
        show_avatar: Boolean(row.show_avatar),
        skills: typeof row.skills === 'string' ? JSON.parse(row.skills || '[]') : row.skills,
        skill_descriptions: typeof row.skill_descriptions === 'string' ? JSON.parse(row.skill_descriptions || '{}') : row.skill_descriptions,
        typing_words: typeof row.typing_words === 'string' ? JSON.parse(row.typing_words || '[]') : row.typing_words,
        sections: typeof row.sections === 'string' ? JSON.parse(row.sections || '{}') : row.sections,
      };
    });

    // Parse JSON columns in projects
    const projects = projectsRes.rows.map((row: any) => ({
      ...row,
      technologies: typeof row.technologies === 'string' ? JSON.parse(row.technologies || '[]') : row.technologies,
      links: typeof row.links === 'string' ? JSON.parse(row.links || '[]') : row.links,
      images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (Array.isArray(row.images) ? row.images : []),
    }));

    // Parse JSON columns in portfolios
    const portfolios = portfoliosRes.rows.map((row: any) => ({
      ...row,
      theme_config: typeof row.theme_config === 'string' ? JSON.parse(row.theme_config || '{}') : (row.theme_config || null),
    }));

    return NextResponse.json({
      users,
      profiles,
      portfolios,
      projects,
      education: educationRes.rows,
      experiences: experiencesRes.rows,
      messages: messagesRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching DB state from Turso:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
