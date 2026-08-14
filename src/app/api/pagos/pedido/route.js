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

    const { itemsDetail, totalAmount, proofUrl, feeId = null } = await request.json();

    if (!itemsDetail || !totalAmount || !proofUrl) {
      return NextResponse.json({ error: 'Debes seleccionar al menos un producto y adjuntar tu captura de Yape/Plin' }, { status: 400 });
    }

    const numericTotal = parseFloat(totalAmount);
    if (isNaN(numericTotal) || numericTotal <= 0) {
      return NextResponse.json({ error: 'El monto total no es válido' }, { status: 400 });
    }

    // Crear el registro del pedido con estado VALIDATING (Pendiente de revisión del Tesorero)
    const newRecord = await prisma.paymentRecord.create({
      data: {
        userId,
        feeId: feeId || null,
        itemsDetail: itemsDetail.trim(),
        amount: numericTotal,
        receiptUrl: proofUrl,
        status: 'VALIDATING'
      },
      include: {
        user: true,
        fee: true
      }
    });

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error) {
    console.error('Error al registrar pedido y voucher:', error);
    return NextResponse.json({ error: `No se pudo procesar el pedido: ${error.message || 'Error de datos'}` }, { status: 500 });
  }
}
