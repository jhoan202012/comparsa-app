import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST: Enviar sugerencia o reclamo
export async function POST(req) {
  try {
    const body = await req.json();
    const { type, message, isAnonymous, userName, userRole } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        type: type || 'SUGERENCIA',
        message: message.trim(),
        isAnonymous: Boolean(isAnonymous),
        userName: isAnonymous ? 'Socio Anónimo' : (userName || 'Socio Registrado'),
        userRole: userRole || 'MEMBER',
        status: 'PENDIENTE'
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error al guardar feedback:', error);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}

// GET: Obtener todos los mensajes recibidos (para Admin / Directiva)
export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }
}
