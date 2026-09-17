import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, is_public } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'portfolio';

    // If is_public is 1, toggle off is_public for user's other portfolios
    if (is_public === 1) {
      await turso.execute({
        sql: 'UPDATE portfolios SET is_public = 0 WHERE user_id = ?',
        args: [userId],
      });
    }

    await turso.execute({
      sql: 'INSERT INTO portfolios (id, user_id, title, slug, description, is_public) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, userId, title, slug, description || '', is_public ? 1 : 0],
    });

    return NextResponse.json({ id, title, slug, description, is_public: is_public ? 1 : 0 }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating portfolio:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
