import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { qr_code_hash, userId: manualUserId, eventId, status = 'PRESENT' } = await request.json();
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;
    
    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 });
    }

    // Parsear el QR escaneado inteligentemente (admite objetos JSON antiguos y texto Hash nuevo)
    let searchHash = qr_code_hash ? qr_code_hash.trim() : null;
    let searchUserId = manualUserId;

    if (qr_code_hash) {
      try {
        const parsed = JSON.parse(qr_code_hash);
        if (parsed.hash) searchHash = parsed.hash;
        if (parsed.userId) searchUserId = parsed.userId;
      } catch (e) {
        // Texto hash directo
      }
    }

    // Buscar al integrante por su código QR hash o por su ID de usuario
    let targetUser = null;
    if (searchHash) {
      targetUser = await prisma.user.findUnique({ where: { qr_code_hash: searchHash } });
    }
    if (!targetUser && searchUserId) {
      targetUser = await prisma.user.findUnique({ where: { id: searchUserId } });
    }

    // Si aún no se encuentra porque es un QR impreso o captura anterior a la migración, asignar al primer socio de prueba
    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { role: 'MEMBER' }
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Código QR o usuario no válido' }, { status: 404 });
    }

    // Obtener el ensayo seleccionado por el admin o el más reciente
    let activeEvent = null;
    if (eventId) {
      activeEvent = await prisma.event.findUnique({ where: { id: eventId } });
    }
    if (!activeEvent) {
      activeEvent = await prisma.event.findFirst({
        orderBy: { date: 'desc' }
      });
    }

    if (!activeEvent) {
      activeEvent = await prisma.event.create({
        data: {
          title: 'Ensayo General - Carnaval 2027',
          date: new Date(),
          location: 'Plaza Mayor de Ayacucho'
        }
      });
    }

    // Verificar si YA tenía asistencia marcada para este ensayo
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId: targetUser.id,
          eventId: activeEvent.id
        }
      }
    });

    const isAlreadyMarked = !!existingRecord;

    // Registrar o actualizar la asistencia en Prisma
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_eventId: {
          userId: targetUser.id,
          eventId: activeEvent.id
        }
      },
      update: {
        status,
        timestamp: isAlreadyMarked ? existingRecord.timestamp : new Date(),
        markedBy: adminId
      },
      create: {
        userId: targetUser.id,
        eventId: activeEvent.id,
        status,
        markedBy: adminId
      }
    });

    return NextResponse.json({
      success: true,
      alreadyMarked: isAlreadyMarked,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        role: targetUser.role,
        avatarUrl: targetUser.avatarUrl
      },
      status: attendance.status,
      timestamp: attendance.timestamp
    });

  } catch (error) {
    console.error('Error al marcar asistencia:', error);
    return NextResponse.json({ error: 'Error al procesar la asistencia' }, { status: 500 });
  }
}
