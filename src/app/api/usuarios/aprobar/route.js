import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

    const { userId, action } = await request.json(); // action: 'APPROVE' | 'REJECT'

    if (!userId || !action) {
      return NextResponse.json({ error: 'ID y Acción requeridos' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' }
      });
      return NextResponse.json({ success: true, user: updated });
    } else if (action === 'REJECT') {
      await prisma.user.delete({
        where: { id: userId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error al procesar aprobación:', error);
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}
