import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, dni, phone, email, role = 'MEMBER' } = await request.json();

    const cleanName = name ? name.trim() : '';
    const cleanDni = dni ? dni.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanEmail = email && email.trim() !== '' ? email.trim() : null;

    if (!cleanName || !cleanDni || !cleanPhone) {
      return NextResponse.json({ error: 'El Nombre, DNI y Celular son obligatorios' }, { status: 400 });
    }

    if (cleanDni.length !== 8 || !/^\d+$/.test(cleanDni)) {
      return NextResponse.json({ error: 'El DNI debe tener exactamente 8 dígitos numéricos' }, { status: 400 });
    }

    // Verificar si ya existe un integrante con ese DNI, celular o email
    const existingDni = await prisma.user.findFirst({
      where: { dni: cleanDni }
    });

    if (existingDni) {
      if (existingDni.status === 'PENDING') {
        return NextResponse.json({ 
          success: true, 
          pending: true,
          message: `Ya existe una solicitud pendiente registrada con el DNI ${cleanDni}. La Directiva la evaluará a la brevedad.` 
        });
      }
      return NextResponse.json({ 
        error: `Ya existe un integrante registrado con el DNI ${cleanDni}. Cada socio solo puede registrarse 1 sola vez.` 
      }, { status: 400 });
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (existingPhone) {
      return NextResponse.json({ 
        error: `El número de celular ${cleanPhone} ya está registrado a nombre de otro integrante.` 
      }, { status: 400 });
    }

    // Hash único para su QR
    const qr_code_hash = crypto.randomBytes(16).toString('hex');

    // Crear integrante con status PENDING (Requiere aprobación de la directiva)
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        dni: cleanDni,
        phone: cleanPhone,
        email: cleanEmail,
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
    console.error('Error detallado en solicitud de registro:', error);
    return NextResponse.json({ 
      error: `Error al procesar registro: ${error.message || 'Verifica los datos'}` 
    }, { status: 500 });
  }
}
