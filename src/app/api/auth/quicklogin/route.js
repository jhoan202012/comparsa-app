import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Extraer el host real de la solicitud del cliente (ej. 10.101.4.219:3000)
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';

  if (userId) {
    const cookieStore = await cookies();
    cookieStore.set('auth_user_id', userId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });
  }

  // Redirección HTTP nativa manteniendo la IP exacta del celular
  return NextResponse.redirect(`${proto}://${host}/`);
}
