import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get('auth_user_id')?.value;

  // Si intenta acceder a la raíz "/" sin sesión, redirigir a "/empadronamiento" inmediatamente en el Edge
  if (pathname === '/' && !userId) {
    return NextResponse.redirect(new URL('/empadronamiento', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
