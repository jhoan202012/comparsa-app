import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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
      return NextResponse.json({ error: 'No autorizado. Vuelve a iniciar sesión.' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const body = await request.json();
    const { title, date, location, type = 'ENSAYO', description } = body;

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Título, fecha y lugar son obligatorios' }, { status: 400 });
    }

    // Parsing ultra-defensivo de fecha y hora
    let eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      if (typeof date === 'string' && date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          eventDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }
    if (isNaN(eventDate.getTime())) {
      eventDate = new Date();
    }

    const qrToken = `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const newEvent = await prisma.event.create({
      data: {
        title,
        date: eventDate,
        location,
        type: type || 'ENSAYO',
        description: description || null,
        qr_token: qrToken
      }
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: `Error al crear evento: ${error.message || 'Error interno'}` }, { status: 500 });
  }
}

export async function PUT(request) {
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

    const { id, title, date, location, type, description } = await request.json();

    if (!id || !title || !date || !location) {
      return NextResponse.json({ error: 'ID, Título, fecha y lugar son requeridos' }, { status: 400 });
    }

    let eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      eventDate = new Date();
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        date: eventDate,
        location,
        type: type || 'ENSAYO',
        description: description || null
      }
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 });
  }
}

export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'ID del evento requerido' }, { status: 400 });
    }

    // Eliminar asistencias asociadas al evento primero
    await prisma.attendance.deleteMany({
      where: { eventId }
    });

    // Eliminar el evento
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 });
  }
}
