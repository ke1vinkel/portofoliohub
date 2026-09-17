import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolio_id, institution, degree, field, start_date, end_date, current, description } = body;

    if (!portfolio_id || !institution || !degree) {
      return NextResponse.json({ error: 'Portfolio ID, Institution, and Degree are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await turso.execute({
      sql: `INSERT INTO education (id, portfolio_id, institution, degree, field, start_date, end_date, current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, portfolio_id, institution, degree, field || '', start_date || '', end_date || null, current ? 1 : 0, description || ''],
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating education:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDatabase();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, institution, degree, field, start_date, end_date, current, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Education ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: `UPDATE education SET
        institution = COALESCE(?, institution),
        degree = COALESCE(?, degree),
        field = COALESCE(?, field),
        start_date = COALESCE(?, start_date),
        end_date = ?,
        current = COALESCE(?, current),
        description = COALESCE(?, description)
      WHERE id = ?`,
      args: [institution, degree, field, start_date, end_date !== undefined ? end_date : null, current !== undefined ? (current ? 1 : 0) : null, description, id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating education:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Education ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM education WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting education:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
