import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { recordId } = await request.json();
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;
    
    if (!adminId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    // Revertir el estado a VALIDATING en caso de error humano
    const updated = await prisma.paymentRecord.update({
      where: { id: recordId },
      data: { 
        status: 'VALIDATING',
        validatedById: null,
        validatedAt: null
      }
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error('Error al revertir pago:', error);
    return NextResponse.json({ error: 'Error al revertir estado del pago' }, { status: 500 });
  }
}
