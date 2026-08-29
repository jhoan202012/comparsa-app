import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      dni,
      phone,
      email,
      memberType,
      role,
      status,
      birthDate,
      gender,
      department,
      province,
      district,
      address,
      affiliationYear,
      talents,
      musicalInstrument,
      clothingSize,
      hasRelatives,
      relativesDetail,
      notes,
      pin
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de socio requerido' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    let userRole = role;
    if (memberType === 'MUSICO') userRole = 'MUSICIAN';
    if (memberType === 'DIRECTIVO') userRole = 'ADMIN';
    if (memberType === 'SOCIO' && userRole !== 'ADMIN') userRole = 'MEMBER';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        dni: dni ? dni.trim() : null,
        phone: phone ? phone.trim() : null,
        email: email && email.trim() !== '' ? email.trim() : null,
        memberType: memberType || 'SOCIO',
        role: userRole || 'MEMBER',
        status: status || 'ACTIVE',
        birthDate: birthDate || null,
        gender: gender || null,
        department: department || 'Ayacucho',
        province: province || 'Cangallo',
        district: district ? district.trim() : null,
        address: address ? address.trim() : null,
        affiliationYear: affiliationYear ? parseInt(affiliationYear, 10) : 2027,
        talents: Array.isArray(talents) ? talents.join(', ') : (talents || null),
        musicalInstrument: musicalInstrument ? musicalInstrument.trim() : null,
        clothingSize: clothingSize || 'L',
        hasRelatives: Boolean(hasRelatives),
        relativesDetail: relativesDetail ? relativesDetail.trim() : null,
        notes: notes ? notes.trim() : null,
        ...(pin && pin.length === 4 ? { pin } : {})
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Datos del socio actualizados exitosamente en el Padrón.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar datos en el padrón:', error);
    return NextResponse.json({
      error: `Error al guardar cambios: ${error.message || 'Error interno'}`
    }, { status: 500 });
  }
}
