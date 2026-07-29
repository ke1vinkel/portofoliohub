import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase, ensureUserProfileAndPortfolio, queryAuthDb } from '@/lib/turso';

export async function GET() {
  try {
    await initDatabase();

    // Auto-provision profile for the logged in user if they don't have one yet
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const u = session.user as any;
        await ensureUserProfileAndPortfolio(String(u.id), String(u.name || u.email || 'User'));
      }
    } catch (provErr) {
      console.error('Profile auto-provision error (non-fatal):', provErr);
    }

    // 1. Users from Central Auth DB via direct HTTP fetch
    const userRows = await queryAuthDb('SELECT id, email, nim, name, role_id FROM users');
    const users = userRows.map((row: any) => {
      const email = String(row.email || '');
      const name = String(row.name || '');
      const nameSlug = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      const emailSlug = email.split('@')[0] || 'user';
      const roleIdStr = String(row.role_id || '').toLowerCase().trim();
      const nimStr = String(row.nim || '').trim().toUpperCase();
      const isLecturerNim = /^D\d+/i.test(nimStr);
      const role: 'student' | 'lecturer' = (roleIdStr === '3' || roleIdStr === 'lecturer' || roleIdStr === 'dosen' || isLecturerNim) ? 'lecturer' : 'student';
      return {
        id: String(row.id),
        email,
        nim: String(row.nim || ''),
        name,
        role,
        username: nameSlug || emailSlug,
      };
    });

    // 2. Portfolio App tables (Portfolios App DB)
    const profilesRes = await turso.execute('SELECT * FROM profiles');
    const portfoliosRes = await turso.execute('SELECT * FROM portfolios');
    const projectsRes = await turso.execute('SELECT * FROM projects');
    const educationRes = await turso.execute('SELECT * FROM education');
    const experiencesRes = await turso.execute('SELECT * FROM experiences');
    const messagesRes = await turso.execute('SELECT * FROM recruiter_messages');

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
    }));

    return NextResponse.json({
      users,
      profiles,
      portfolios: portfoliosRes.rows,
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
