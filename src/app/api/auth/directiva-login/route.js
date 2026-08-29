import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const cleanUser = username?.trim().toLowerCase();
    const cleanPass = password?.trim();

    // Verificación de credenciales solicitadas por Jhoan:
    // Usuario: administrador
    // Contraseña: Señorial2026*
    const isValidAdmin = (cleanUser === 'administrador' && cleanPass === 'Señorial2026*');

    if (!isValidAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Usuario o contraseña de directiva incorrectos.'
      }, { status: 401 });
    }

    // Buscar o crear usuario administrador en la base de datos
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Directiva Cangallo Señorial',
          phone: '999999999',
          role: 'ADMIN',
          memberType: 'DIRECTIVO',
          pin: '2027',
          dni: '00000000',
          qr_code_hash: 'admin_cangallo_senorial_2027'
        }
      });
    }

    // Establecer la cookie de sesión en el navegador
    const cookieStore = await cookies();
    cookieStore.set('auth_user_id', adminUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 días
    });

    return NextResponse.json({
      success: true,
      message: 'Acceso de directiva autorizado',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Error en directiva-login:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor.'
    }, { status: 500 });
  }
}
