import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = searchParams.get('dni')?.trim();

    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      return NextResponse.json({ error: 'El DNI debe tener 8 dígitos numéricos' }, { status: 400 });
    }

    // 1. Buscar en Base de Datos Local
    const existingUser = await prisma.user.findUnique({
      where: { dni },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        birthDate: true,
        gender: true,
        district: true
      }
    });

    // 2. Consultar API Externa de Identidad para obtener nombres oficiales completos si faltan
    let externalData = null;
    try {
      const token = process.env.DNI_API_TOKEN || '';
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const apiUrl = token 
        ? `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`
        : `https://api.apis.net.pe/v1/dni?numero=${dni}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const apiRes = await fetch(apiUrl, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const d = await apiRes.json();
        const nombres = d.nombres || d.nombre || '';
        const apellidoPaterno = d.apellidoPaterno || d.apellido_paterno || '';
        const apellidoMaterno = d.apellidoMaterno || d.apellido_materno || '';
        const apellidos = `${apellidoPaterno} ${apellidoMaterno}`.trim();
        const fullName = d.nombre_completo || `${nombres} ${apellidos}`.trim();

        if (nombres || fullName) {
          externalData = {
            nombres: nombres || fullName,
            apellidos: apellidos || '',
            name: fullName,
            birthDate: d.fechaNacimiento || d.fecha_nacimiento || '',
            gender: d.sexo === 'F' ? 'Femenino' : 'Masculino',
            district: d.distrito || ''
          };
        }
      }
    } catch (e) {
      // Ignorar timeout y continuar con base de datos
    }

    // Si ya existe en base de datos local
    if (existingUser) {
      const parts = existingUser.name.split(' ');
      const nombres = externalData?.nombres || (parts.length > 2 ? parts.slice(0, parts.length - 2).join(' ') : parts[0] || existingUser.name);
      const apellidos = externalData?.apellidos || (parts.length > 2 ? parts.slice(parts.length - 2).join(' ') : parts.slice(1).join(' ') || '');
      const birthDate = existingUser.birthDate || externalData?.birthDate || '';
      const gender = existingUser.gender === 'MUJER' ? 'Femenino' : existingUser.gender === 'VARON' ? 'Masculino' : (externalData?.gender || 'Masculino');

      return NextResponse.json({
        success: true,
        source: 'LOCAL_DB',
        name: existingUser.name,
        nombres,
        apellidos,
        birthDate,
        gender,
        district: existingUser.district || externalData?.district || '',
        alreadyRegistered: true,
        status: existingUser.status,
        message: 'Socio registrado en el padrón.'
      });
    }

    // Si es un socio nuevo y la API externa respondió
    if (externalData) {
      return NextResponse.json({
        success: true,
        source: 'RENIEC_API',
        ...externalData,
        alreadyRegistered: false
      });
    }

    // Fallback manual
    return NextResponse.json({
      success: true,
      source: 'MANUAL_FALLBACK',
      nombres: '',
      apellidos: '',
      name: '',
      birthDate: '',
      gender: 'Masculino',
      alreadyRegistered: false
    });

  } catch (error) {
    console.error('Error en consulta DNI:', error);
    return NextResponse.json({
      success: true,
      source: 'MANUAL_FALLBACK',
      nombres: '',
      apellidos: '',
      name: '',
      birthDate: '',
      gender: 'Masculino',
      alreadyRegistered: false
    });
  }
}
