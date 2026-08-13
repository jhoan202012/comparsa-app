import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (userId) {
    const cookieStore = await cookies();
    cookieStore.set('auth_user_id', userId, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });
  }

  return NextResponse.redirect(`${proto}://${host}/`);
}
