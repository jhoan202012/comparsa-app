import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { recordId } = await request.json();
  const cookieStore = await cookies();
  const adminId = cookieStore.get('auth_user_id')?.value;
  
  // El administrador aprueba el pago
  await prisma.paymentRecord.update({
    where: { id: recordId },
    data: { 
      status: 'PAID',
      validatorId: adminId
    }
  });

  return NextResponse.json({ success: true });
}
