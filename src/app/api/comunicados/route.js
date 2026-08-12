import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET: Obtener comunicados recientes
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: {
          select: { name: true, role: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error al obtener comunicados:', error);
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}

// POST: Publicar nuevo comunicado oficial (Solo Administrador)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo los administradores pueden publicar comunicados' }, { status: 403 });
    }

    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category: category || 'GENERAL',
        authorId: user.id
      },
      include: {
        author: {
          select: { name: true, role: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error al crear comunicado:', error);
    return NextResponse.json({ error: 'Error al publicar comunicado' }, { status: 500 });
  }
}
