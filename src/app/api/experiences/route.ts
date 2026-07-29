import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolio_id, company, position, location, start_date, end_date, current, description } = body;

    if (!portfolio_id || !company || !position) {
      return NextResponse.json({ error: 'Portfolio ID, Company, and Position are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await turso.execute({
      sql: `INSERT INTO experiences (id, portfolio_id, company, position, location, start_date, end_date, current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, portfolio_id, company, position, location || '', start_date || '', end_date || null, current ? 1 : 0, description || ''],
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating experience:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, company, position, location, start_date, end_date, current, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: `UPDATE experiences SET
        company = COALESCE(?, company),
        position = COALESCE(?, position),
        location = COALESCE(?, location),
        start_date = COALESCE(?, start_date),
        end_date = ?,
        current = COALESCE(?, current),
        description = COALESCE(?, description)
      WHERE id = ?`,
      args: [company, position, location, start_date, end_date !== undefined ? end_date : null, current !== undefined ? (current ? 1 : 0) : null, description, id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating experience:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM experiences WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting experience:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
