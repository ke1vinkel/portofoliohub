import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function PUT(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio, avatar, show_avatar, major, university, location, skills, skill_descriptions,
      github, linkedin, twitter, website, github_type, linkedin_type, twitter_type, website_type,
      typing_words, typing_speed, typing_delete_speed, typing_pause_duration, hero_badge_text,
      custom_domain, cv_url, contact_email, sections
    } = body;

    // Check if profile exists, if not create it
    const profileCheck = await turso.execute({
      sql: 'SELECT user_id FROM profiles WHERE user_id = ?',
      args: [userId],
    });

    if (profileCheck.rows.length === 0) {
      await turso.execute({
        sql: 'INSERT INTO profiles (user_id) VALUES (?)',
        args: [userId],
      });
    }

    await turso.execute({
      sql: `UPDATE profiles SET
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        show_avatar = COALESCE(?, show_avatar),
        major = COALESCE(?, major),
        university = COALESCE(?, university),
        location = COALESCE(?, location),
        skills = COALESCE(?, skills),
        skill_descriptions = COALESCE(?, skill_descriptions),
        github = COALESCE(?, github),
        linkedin = COALESCE(?, linkedin),
        twitter = COALESCE(?, twitter),
        website = COALESCE(?, website),
        github_type = COALESCE(?, github_type),
        linkedin_type = COALESCE(?, linkedin_type),
        twitter_type = COALESCE(?, twitter_type),
        website_type = COALESCE(?, website_type),
        typing_words = COALESCE(?, typing_words),
        typing_speed = COALESCE(?, typing_speed),
        typing_delete_speed = COALESCE(?, typing_delete_speed),
        typing_pause_duration = COALESCE(?, typing_pause_duration),
        hero_badge_text = COALESCE(?, hero_badge_text),
        custom_domain = COALESCE(?, custom_domain),
        cv_url = COALESCE(?, cv_url),
        contact_email = COALESCE(?, contact_email),
        sections = COALESCE(?, sections)
      WHERE user_id = ?`,
      args: [
        bio ?? null,
        avatar ?? null,
        show_avatar !== undefined ? (show_avatar ? 1 : 0) : null,
        major ?? null,
        university ?? null,
        location ?? null,
        skills !== undefined && skills !== null ? JSON.stringify(skills) : null,
        skill_descriptions !== undefined && skill_descriptions !== null ? JSON.stringify(skill_descriptions) : null,
        github ?? null,
        linkedin ?? null,
        twitter ?? null,
        website ?? null,
        github_type ?? null,
        linkedin_type ?? null,
        twitter_type ?? null,
        website_type ?? null,
        typing_words !== undefined && typing_words !== null ? JSON.stringify(typing_words) : null,
        typing_speed ?? null,
        typing_delete_speed ?? null,
        typing_pause_duration ?? null,
        hero_badge_text ?? null,
        custom_domain ?? null,
        cv_url ?? null,
        contact_email ?? null,
        sections !== undefined && sections !== null ? JSON.stringify(sections) : null,
        userId,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
