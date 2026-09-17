import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ user: null });
    }
    return Response.json({ user });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return Response.json({ user: null });
  }
}
