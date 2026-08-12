import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { userId } = await request.json();
  
  const cookieStore = await cookies();
  cookieStore.set('auth_user_id', userId, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: '/',
  });

  return NextResponse.json({ success: true });
}
