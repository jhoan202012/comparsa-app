import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      dni,
      name,
      birthDate,
      gender,
      avatarUrl,
      phone,
      email,
      department = 'Ayacucho',
      province = 'Cangallo',
      district,
      address,
      hasRelatives = false,
      relativesDetail,
      memberType = 'SOCIO',
      affiliationYear,
      talents,
      musicalInstrument,
      artCategory,
      artDetail,
      clothingSize,
      pin = '1234',
      notes
    } = body;

    const cleanDni = dni ? dni.trim() : '';
    const cleanName = name ? name.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanEmail = email && email.trim() !== '' ? email.trim() : null;

    if (!cleanDni || cleanDni.length !== 8 || !/^\d+$/.test(cleanDni)) {
      return NextResponse.json({ error: 'El DNI debe contener exactamente 8 dígitos numéricos.' }, { status: 400 });
    }

    if (!cleanName) {
      return NextResponse.json({ error: 'El nombre completo es obligatorio.' }, { status: 400 });
    }

    if (!cleanPhone) {
      return NextResponse.json({ error: 'El número de celular/WhatsApp es obligatorio.' }, { status: 400 });
    }

    // Role mapping based on memberType
    let userRole = 'MEMBER';
    if (memberType === 'MUSICO') userRole = 'MUSICIAN';
    if (memberType === 'DIRECTIVO' || memberType === 'ADMIN') userRole = 'ADMIN';

    // Check if user already exists with this DNI
    const existingUser = await prisma.user.findUnique({
      where: { dni: cleanDni }
    });

    let savedUser;

    if (existingUser) {
      // Actualizar datos del socio existente (Actualización de Padrón 2027)
      savedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          role: userRole,
          status: 'ACTIVE',
          pin: pin && pin.length === 4 ? pin : existingUser.pin || '1234',
          avatarUrl: avatarUrl || existingUser.avatarUrl,
          birthDate: birthDate || existingUser.birthDate,
          gender: gender || existingUser.gender,
          department: department || existingUser.department,
          province: province || existingUser.province,
          district: district || existingUser.district,
          address: address || existingUser.address,
          hasRelatives: Boolean(hasRelatives),
          relativesDetail: relativesDetail || null,
          memberType: memberType || existingUser.memberType,
          affiliationYear: affiliationYear ? parseInt(affiliationYear, 10) : existingUser.affiliationYear,
          talents: Array.isArray(talents) ? talents.join(', ') : talents || existingUser.talents,
          musicalInstrument: musicalInstrument || null,
          artCategory: artCategory || null,
          artDetail: artDetail || null,
          clothingSize: clothingSize || existingUser.clothingSize,
          notes: notes || existingUser.notes
        }
      });
    } else {
      // Crear nuevo socio en el Padrón Oficial
      const qr_code_hash = crypto.randomBytes(16).toString('hex');
      const year = affiliationYear ? parseInt(affiliationYear, 10) : new Date().getFullYear();

      savedUser = await prisma.user.create({
        data: {
          dni: cleanDni,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          role: userRole,
          status: 'ACTIVE',
          pin: pin && pin.length === 4 ? pin : '1234',
          avatarUrl: avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
          qr_code_hash,
          birthDate: birthDate || null,
          gender: gender || 'UNISEX',
          department: department || 'Ayacucho',
          province: province || 'Cangallo',
          district: district || null,
          address: address || null,
          hasRelatives: Boolean(hasRelatives),
          relativesDetail: relativesDetail || null,
          memberType: memberType || 'SOCIO',
          affiliationYear: year,
          talents: Array.isArray(talents) ? talents.join(', ') : talents || null,
          musicalInstrument: musicalInstrument || null,
          artCategory: artCategory || null,
          artDetail: artDetail || null,
          clothingSize: clothingSize || null,
          notes: notes || null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '¡Empadronamiento completado con éxito!',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        dni: savedUser.dni,
        phone: savedUser.phone,
        role: savedUser.role,
        memberType: savedUser.memberType,
        avatarUrl: savedUser.avatarUrl,
        qr_code_hash: savedUser.qr_code_hash,
        clothingSize: savedUser.clothingSize,
        district: savedUser.district,
        talents: savedUser.talents,
        affiliationYear: savedUser.affiliationYear
      }
    });

  } catch (error) {
    console.error('Error en API de Empadronamiento:', error);
    return NextResponse.json({
      error: `Error al procesar empadronamiento: ${error.message || 'Error interno'}`
    }, { status: 500 });
  }
}
