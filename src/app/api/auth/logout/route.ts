import { destroyUserSession } from '@/lib/auth';

export async function POST() {
  try {
    await destroyUserSession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
