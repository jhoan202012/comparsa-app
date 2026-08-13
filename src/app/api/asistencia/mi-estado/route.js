import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let activeEvent = null;
    if (eventId) {
      activeEvent = await prisma.event.findUnique({ where: { id: eventId } });
    } else {
      activeEvent = await prisma.event.findFirst({ orderBy: { date: 'desc' } });
    }

    if (!activeEvent) {
      return NextResponse.json({ myAttendance: null, eventTitle: null });
    }

    const myAttendance = await prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: activeEvent.id
        }
      }
    });

    return NextResponse.json({ 
      myAttendance, 
      eventTitle: activeEvent.title 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al consultar estado' }, { status: 500 });
  }
}
