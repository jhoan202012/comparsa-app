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

    const { eventId, status } = await request.json(); // status: 'PRESENT' or 'ABSENT'

    if (!eventId || !status) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      },
      update: {
        status,
        timestamp: new Date()
      },
      create: {
        userId,
        eventId,
        status,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    return NextResponse.json({ error: 'Error al procesar respuesta' }, { status: 500 });
  }
}
