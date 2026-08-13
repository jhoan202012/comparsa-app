import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const { name, dni, phone, email, role = 'MEMBER', pin = '1234', avatarUrl } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'El nombre completo es requerido' }, { status: 400 });
    }

    // Generar un hash único de 32 caracteres para el carnet QR
    const qr_code_hash = crypto.randomBytes(16).toString('hex');

    const newUser = await prisma.user.create({
      data: {
        name,
        dni: dni || null,
        phone: phone || null,
        email: email || null,
        role,
        pin: pin || '1234',
        avatarUrl: avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
        qr_code_hash
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error al crear usuario. Verifica que el DNI, teléfono o correo no estén duplicados.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const { id, name, dni, phone, email, role, pin, avatarUrl } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'ID y Nombre son requeridos' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        dni: dni || null,
        phone: phone || null,
        email: email || null,
        role,
        ...(pin && { pin }),
        ...(avatarUrl && { avatarUrl })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar datos del integrante' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID del integrante requerido' }, { status: 400 });
    }

    // No permitir eliminar al propio administrador activo
    if (userId === adminId) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
    }

    // Eliminar registros asociados en orden (asistencias y pagos)
    await prisma.attendance.deleteMany({ where: { userId } });
    await prisma.paymentRecord.deleteMany({ where: { userId } });

    // Eliminar el usuario
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar integrante' }, { status: 500 });
  }
}
