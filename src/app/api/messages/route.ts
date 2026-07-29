import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { student_id, name, email, message } = body;

    if (!student_id || !name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await turso.execute({
      sql: `INSERT INTO recruiter_messages (id, student_id, name, email, message) VALUES (?, ?, ?, ?, ?)`,
      args: [id, student_id, name, email, message],
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating recruiter message:', err);
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
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM recruiter_messages WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting recruiter message:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
