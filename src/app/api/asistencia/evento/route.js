import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ attendances: {} });
  }

  // Excluir a los administradores del conteo de asistencias (solo contar Socios y Músicos)
  const records = await prisma.attendance.findMany({
    where: { 
      eventId,
      user: {
        role: { in: ['MEMBER', 'MUSICIAN'] }
      }
    }
  });

  const attendances = {};
  records.forEach(r => {
    attendances[r.userId] = r.status;
  });

  return NextResponse.json({ attendances });
}
