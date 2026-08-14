import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { recordId, action = 'APPROVE' } = await request.json(); // action = 'APPROVE' | 'REJECT' | 'DELIVER' | 'UNDELIVER'
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    if (!recordId) {
      return NextResponse.json({ error: 'ID de registro requerido' }, { status: 400 });
    }
    
    let targetStatus = 'PAID';
    let deliveryStatus = undefined;

    if (action === 'APPROVE') {
      targetStatus = 'PAID';
    } else if (action === 'REJECT') {
      targetStatus = 'REJECTED';
    } else if (action === 'DELIVER') {
      targetStatus = 'DELIVERED';
      deliveryStatus = 'ENTREGADO';
    } else if (action === 'UNDELIVER') {
      targetStatus = 'PAID';
      deliveryStatus = 'PENDIENTE';
    }

    const updateData = {
      status: targetStatus,
      validatedById: adminId,
      validatedAt: new Date()
    };

    if (deliveryStatus) {
      updateData.deliveryStatus = deliveryStatus;
    }

    const updated = await prisma.paymentRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        user: true,
        fee: true
      }
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error('Error al procesar validación de pago:', error);
    return NextResponse.json({ error: `Error al procesar validación de pago: ${error.message || 'Error del servidor'}` }, { status: 500 });
  }
}
