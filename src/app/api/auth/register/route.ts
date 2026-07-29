import { NextResponse } from 'next/server';

export async function POST(_req: Request) {
  return NextResponse.json(
    { error: 'Registration is managed via Central Auth. Contact your administrator.' },
    { status: 403 }
  );
}
