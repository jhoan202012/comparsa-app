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
      select: { id: true, name: true, role: true, status: true }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        source: 'LOCAL_DB',
        name: existingUser.name,
        alreadyRegistered: true,
        status: existingUser.status,
        message: 'Este DNI ya se encuentra empadronado en la comparsa.'
      });
    }

    // 2. NIVEL 2: Consulta a Servicio de Identidad con Timeout Seguro (1.5 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    let resolvedName = null;

    try {
      // Intentar consulta a servicio público/proveedor con timeout defensivo
      // Nota: Si tienes un token propio, se puede configurar en process.env.DNI_API_TOKEN
      const token = process.env.DNI_API_TOKEN || '';
      
      const headers = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Proveedor primario (apis.net.pe o similar)
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
        if (data.nombres || data.nombre) {
          const nombres = data.nombres || data.nombre || '';
          const apellidoPaterno = data.apellidoPaterno || data.apellido_paterno || '';
          const apellidoMaterno = data.apellidoMaterno || data.apellido_materno || '';
          resolvedName = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim();
        } else if (data.nombre_completo) {
          resolvedName = data.nombre_completo.trim();
        }
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.log('Aviso: Consulta externa DNI demoró o no respondió, activando fallback manual elegante.');
    }

    if (resolvedName) {
      return NextResponse.json({
        success: true,
        source: 'RENIEC_API',
        name: resolvedName,
        alreadyRegistered: false
      });
    }

    // 3. NIVEL 3 / 4: Degradación Elegante (Permitir ingreso manual sin bloquear)
    return NextResponse.json({
      success: true,
      source: 'MANUAL_FALLBACK',
      name: '',
      alreadyRegistered: false,
      message: 'Ingresa tus nombres completos para completar el empadronamiento.'
    });

  } catch (error) {
    console.error('Error general en consulta de DNI:', error);
    return NextResponse.json({
      success: true,
      source: 'MANUAL_FALLBACK',
      name: '',
      alreadyRegistered: false
    });
  }
}
