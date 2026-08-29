import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = searchParams.get('dni')?.trim();

    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      return NextResponse.json({ error: 'El DNI debe tener 8 dígitos numéricos' }, { status: 400 });
    }

    // 1. NIVEL 1: Buscar en Base de Datos Local (0ms / S/ 0.00)
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

    if (existingUser) {
      // Separar nombres y apellidos si es posible
      const parts = existingUser.name.split(' ');
      const nombres = parts.length > 2 ? parts.slice(0, parts.length - 2).join(' ') : parts[0] || '';
      const apellidos = parts.length > 2 ? parts.slice(parts.length - 2).join(' ') : parts.slice(1).join(' ') || '';

      return NextResponse.json({
        success: true,
        source: 'LOCAL_DB',
        name: existingUser.name,
        nombres: nombres || existingUser.name,
        apellidos: apellidos || '',
        birthDate: existingUser.birthDate || '',
        gender: existingUser.gender === 'MUJER' ? 'Femenino' : 'Masculino',
        district: existingUser.district || '',
        alreadyRegistered: true,
        status: existingUser.status,
        message: 'Este DNI ya se encuentra registrado en la base de datos de Cangallo Señorial.'
      });
    }

    // 2. NIVEL 2: Consulta a Servicio de Identidad con Timeout Seguro (1.8 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    let parsedData = null;

    try {
      const token = process.env.DNI_API_TOKEN || '';
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = token 
        ? `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`
        : `https://api.apis.net.pe/v1/dni?numero=${dni}`;

      const apiRes = await fetch(apiUrl, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        
        let nombres = data.nombres || data.nombre || '';
        let apellidoPaterno = data.apellidoPaterno || data.apellido_paterno || '';
        let apellidoMaterno = data.apellidoMaterno || data.apellido_materno || '';
        let apellidos = `${apellidoPaterno} ${apellidoMaterno}`.trim();
        
        let fullName = data.nombre_completo || `${nombres} ${apellidos}`.trim();
        let fechaNac = data.fechaNacimiento || data.fecha_nacimiento || data.nacimiento || '';
        
        // Formatear género
        let rawSexo = (data.sexo || data.genero || '').toUpperCase();
        let sexo = rawSexo === 'F' || rawSexo === 'FEMENINO' || rawSexo === 'MUJER' ? 'Femenino' : 'Masculino';

        if (nombres || fullName) {
          parsedData = {
            nombres: nombres || fullName,
            apellidos: apellidos || '',
            name: fullName,
            birthDate: fechaNac,
            gender: sexo,
            district: data.distrito || data.ubigeo_distrito || ''
          };
        }
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.log('Aviso: Consulta externa DNI demoró o no respondió, activando fallback manual elegante.');
    }

    if (parsedData) {
      return NextResponse.json({
        success: true,
        source: 'RENIEC_API',
        ...parsedData,
        alreadyRegistered: false
      });
    }

    // 3. NIVEL 3 / 4: Degradación Elegante
    return NextResponse.json({
      success: true,
      source: 'MANUAL_FALLBACK',
      nombres: '',
      apellidos: '',
      name: '',
      birthDate: '',
      gender: 'Masculino',
      alreadyRegistered: false,
      message: 'Digita tus nombres y apellidos para completar el empadronamiento.'
    });

  } catch (error) {
    console.error('Error general en consulta de DNI:', error);
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
