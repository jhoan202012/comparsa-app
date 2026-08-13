import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, phone, email, role = 'MEMBER' } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'El nombre completo y celular son obligatorios' }, { status: 400 });
    }

    // Verificar si ya existe un integrante con ese número
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        return NextResponse.json({ 
          success: true, 
          pending: true,
          message: 'Tu solicitud ya está registrada y pendiente de aprobación por la directiva.' 
        });
      }
      return NextResponse.json({ 
        error: 'Ya existe un integrante registrado con este número. Ingresa desde el formulario de inicio.' 
      }, { status: 400 });
    }

    // Hash único para su QR
    const qr_code_hash = crypto.randomBytes(16).toString('hex');

    // Crear integrante con status PENDING (Requiere aprobación de la directiva)
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        role: role === 'MUSICIAN' ? 'MUSICIAN' : 'MEMBER',
        status: 'PENDING', // Requiere aprobación
        pin: '1234',
        avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
        qr_code_hash
      }
    });

    return NextResponse.json({ 
      success: true, 
      pending: true,
      user: newUser 
    });
  } catch (error) {
    console.error('Error en solicitud de registro:', error);
    return NextResponse.json({ error: 'Error al enviar la solicitud. Intenta de nuevo.' }, { status: 500 });
  }
}
