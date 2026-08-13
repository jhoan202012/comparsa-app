import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { recordId, proofUrl } = await request.json();

    if (!recordId) {
      return NextResponse.json({ error: 'ID de registro de pago requerido' }, { status: 400 });
    }

    // Verificar que el registro pertenezca al usuario
    const record = await prisma.paymentRecord.findUnique({ where: { id: recordId } });
    if (!record || record.userId !== userId) {
      return NextResponse.json({ error: 'Registro de pago no encontrado o no autorizado' }, { status: 403 });
    }

    // Actualizar registro con la captura del voucher y estado VALIDATING (En revisión)
    const updated = await prisma.paymentRecord.update({
      where: { id: recordId },
      data: {
        proofUrl: proofUrl || record.proofUrl || '/images/634041989_1346800734148847_7655715541676484146_n.jpg',
        status: 'VALIDATING'
      }
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error('Error al subir voucher de pago:', error);
    return NextResponse.json({ error: 'Error al subir voucher de pago' }, { status: 500 });
  }
}
