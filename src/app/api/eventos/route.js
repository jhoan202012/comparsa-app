import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendances: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, role: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 });
    }

    const { title, date, location, type = 'ENSAYO', description } = await request.json();

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Título, fecha y lugar son requeridos' }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        type,
        description
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
  }
}
