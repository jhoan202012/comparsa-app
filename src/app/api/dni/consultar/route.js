import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🛡️ CONTROL ANTIFRAUDE & RATE LIMITING (Control de intentos por IP)
// Almacena en memoria los intentos por IP para evitar que gente "viva" use la plataforma para raspar datos
const ipRequestCounts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // Ventana de 1 minuto
  const maxRequests = 6; // Máximo 6 consultas de DNI por minuto por celular/IP

  const record = ipRequestCounts.get(ip);

  if (!record) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

// Función para inferir género por nombres peruanos
function inferGenderFromName(firstName) {
  if (!firstName) return 'Masculino';
  const name = firstName.trim().toUpperCase().split(' ')[0];

  const femaleNames = [
    'DEISY', 'DEYSI', 'MARIA', 'ROSA', 'ANA', 'CARMEN', 'LIZ', 'LIZBETH', 'GLADYS', 'LUCIA',
    'FLOR', 'ROCIO', 'YULISSA', 'DIANA', 'KAREN', 'MILAGROS', 'ESTEFANY', 'VANESSA', 'PATRICIA',
    'ANDREA', 'GABRIELA', 'FIORELLA', 'SANDRA', 'EVELYN', 'YESSICA', 'JESSICA', 'SONIA', 'SUSANA',
    'ELIZABETH', 'KATHERINE', 'CYNTHIA', 'CINTHIA', 'MIRIAN', 'MIRIAM', 'SHEILA', 'PILAR', 'MARITZA',
    'ISABEL', 'BEATRIZ', 'RAQUEL', 'RUTH', 'JANET', 'YANET', 'EDITH', 'JUDITH', 'MAGALY', 'NANCY'
  ];

  if (femaleNames.includes(name)) return 'Femenino';
  if (name.endsWith('A') && !['JOSHUA', 'LUCA', 'SASHA'].includes(name)) return 'Femenino';
  return 'Masculino';
}

export async function GET(request) {
  try {
    // Obtener IP del cliente para aplicar el límite de seguridad
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0] : realIp) || '127.0.0.1';

    // 🛡️ 1. CANDADO DE SEGURIDAD: Verificar Límite de Velocidad (Anti-Scraping)
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Has realizado demasiadas consultas de DNI. Por seguridad, espera ${rateLimit.waitSeconds} segundos para continuar.`
      }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const dni = searchParams.get('dni')?.trim();

    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      return NextResponse.json({ error: 'El DNI debe tener 8 dígitos numéricos' }, { status: 400 });
    }

    // 2. Buscar en Base de Datos Local
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

    // 3. Consultar API Externa de Identidad (Token protegido en servidor)
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

        let rawSexo = (d.sexo || d.genero || '').toUpperCase();
        let sexo = rawSexo === 'F' || rawSexo === 'FEMENINO' || rawSexo === 'MUJER' 
          ? 'Femenino' 
          : rawSexo === 'M' || rawSexo === 'MASCULINO' || rawSexo === 'VARON'
          ? 'Masculino'
          : inferGenderFromName(nombres);

        if (nombres || fullName) {
          externalData = {
            nombres: nombres || fullName,
            apellidos: apellidos || '',
            name: fullName,
            birthDate: d.fechaNacimiento || d.fecha_nacimiento || '',
            gender: sexo,
            district: d.distrito || ''
          };
        }
      }
    } catch (e) {
      // Continuar con base de datos o fallback
    }

    // Si ya existe en base de datos local
    if (existingUser) {
      const parts = existingUser.name.split(' ');
      const nombres = externalData?.nombres || (parts.length > 2 ? parts.slice(0, parts.length - 2).join(' ') : parts[0] || existingUser.name);
      const apellidos = externalData?.apellidos || (parts.length > 2 ? parts.slice(parts.length - 2).join(' ') : parts.slice(1).join(' ') || '');
      const birthDate = existingUser.birthDate || externalData?.birthDate || '';
      const gender = existingUser.gender === 'MUJER' 
        ? 'Femenino' 
        : existingUser.gender === 'VARON' 
        ? 'Masculino' 
        : (externalData?.gender || inferGenderFromName(nombres));

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

    // Si es un socio nuevo
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
