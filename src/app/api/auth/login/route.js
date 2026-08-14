import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { loginInput, pin } = await request.json();

    const cleanInput = loginInput ? loginInput.trim() : '';
    const cleanPin = pin ? pin.trim() : '';

    if (!cleanInput) {
      return NextResponse.json({ error: 'Ingresa tu DNI, Celular o Correo' }, { status: 400 });
    }

    if (!cleanPin) {
      return NextResponse.json({ error: 'Ingresa tu PIN o Contraseña' }, { status: 400 });
    }

    // Buscar usuario en la base de datos por DNI, Teléfono o Email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { dni: cleanInput },
          { phone: cleanInput },
          { email: cleanInput }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'No se encontró ningún integrante con ese DNI, celular o correo. Si eres nuevo, solicita tu registro.'
      }, { status: 404 });
    }

    if (user.status === 'PENDING') {
      return NextResponse.json({
        error: 'Tu solicitud de inscripción aún está pendiente de aprobación por la Junta Directiva.'
      }, { status: 403 });
    }

    if (user.status === 'REJECTED') {
      return NextResponse.json({
        error: 'Tu cuenta ha sido deshabilitada por la directiva.'
      }, { status: 403 });
    }

    // Verificar contraseña / PIN
    const expectedPin = user.pin || '1234';
    if (cleanPin !== expectedPin) {
      return NextResponse.json({
        error: 'Contraseña o PIN incorrecto. Verifica e intenta nuevamente.'
      }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const cookieStore = await cookies();
    cookieStore.set('auth_user_id', user.id, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return NextResponse.json({ error: 'Error del servidor al iniciar sesión' }, { status: 500 });
  }
}
