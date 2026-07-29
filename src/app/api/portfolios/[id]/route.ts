import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, is_public, theme_config } = await req.json();

    if (is_public === 1) {
      await turso.execute({
        sql: 'UPDATE portfolios SET is_public = 0 WHERE user_id = ?',
        args: [userId],
      });
    }

    await turso.execute({
      sql: `UPDATE portfolios SET 
        title = COALESCE(?, title), 
        description = COALESCE(?, description), 
        is_public = COALESCE(?, is_public), 
        theme_config = COALESCE(?, theme_config),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?`,
      args: [
        title, 
        description !== undefined ? description : null, 
        is_public !== undefined ? (is_public ? 1 : 0) : null, 
        theme_config !== undefined ? JSON.stringify(theme_config) : null,
        id, 
        userId
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating portfolio:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await turso.execute({
      sql: 'DELETE FROM portfolios WHERE id = ? AND user_id = ?',
      args: [id, userId],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting portfolio:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
