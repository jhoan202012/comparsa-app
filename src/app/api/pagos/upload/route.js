import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const { recordId } = await request.json();
  
  // En producción aquí se guardaría la foto en S3 o Cloudinary.
  // Por ahora, solo actualizamos el estado en la base de datos a "VALIDATING" (En Revisión).
  await prisma.paymentRecord.update({
    where: { id: recordId },
    data: { status: 'VALIDATING' }
  });

  return NextResponse.json({ success: true });
}
