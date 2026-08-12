import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { recordId } = await request.json();
  const cookieStore = await cookies();
  const adminId = cookieStore.get('auth_user_id')?.value;
  
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Revertir el estado a PENDIENTE en caso de error humano
  await prisma.paymentRecord.update({
    where: { id: recordId },
    data: { 
      status: 'PENDING',
      validatorId: null
    }
  });

  return NextResponse.json({ success: true });
}
