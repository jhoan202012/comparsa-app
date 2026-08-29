import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dni: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        memberType: true,
        birthDate: true,
        gender: true,
        department: true,
        province: true,
        district: true,
        address: true,
        hasRelatives: true,
        relativesDetail: true,
        affiliationYear: true,
        talents: true,
        musicalInstrument: true,
        artCategory: true,
        artDetail: true,
        clothingSize: true,
        notes: true,
        createdAt: true
      }
    });

    // Construir CSV compatible con Microsoft Excel (UTF-8 con BOM)
    const headers = [
      'DNI',
      'NOMBRES Y APELLIDOS',
      'CELULAR / WHATSAPP',
      'CORREO',
      'TIPO DE SOCIO',
      'ROL SISTEMA',
      'ESTADO',
      'FECHA DE NACIMIENTO',
      'GÉNERO',
      'DEPARTAMENTO',
      'PROVINCIA',
      'DISTRITO',
      'DIRECCIÓN',
      'AÑO DE AFILIACIÓN',
      'FAMILIARES EN COMPARSA',
      'DETALLE DE FAMILIARES',
      'DISCIPLINAS / TALENTOS',
      'CATEGORÍA ARTÍSTICA',
      'INSTRUMENTO MUSICAL',
      'DETALLE ARTÍSTICO',
      'TALLA DE VESTUARIO',
      'FECHA DE REGISTRO'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = users.map(u => [
      escapeCsv(u.dni || ''),
      escapeCsv(u.name || ''),
      escapeCsv(u.phone || ''),
      escapeCsv(u.email || ''),
      escapeCsv(u.memberType || 'SOCIO'),
      escapeCsv(u.role || 'MEMBER'),
      escapeCsv(u.status || 'ACTIVE'),
      escapeCsv(u.birthDate || ''),
      escapeCsv(u.gender || ''),
      escapeCsv(u.department || 'Ayacucho'),
      escapeCsv(u.province || 'Cangallo'),
      escapeCsv(u.district || ''),
      escapeCsv(u.address || ''),
      escapeCsv(u.affiliationYear || ''),
      escapeCsv(u.hasRelatives ? 'SÍ' : 'NO'),
      escapeCsv(u.relativesDetail || ''),
      escapeCsv(u.talents || ''),
      escapeCsv(u.artCategory || ''),
      escapeCsv(u.musicalInstrument || ''),
      escapeCsv(u.artDetail || ''),
      escapeCsv(u.clothingSize || ''),
      escapeCsv(new Date(u.createdAt).toLocaleString('es-PE'))
    ].join(','));

    // UTF-8 BOM (\uFEFF) para que Excel en Windows abra las tildes y caracteres peruanos sin problemas
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const fileName = `Padron_General_Cangallo_Senorial_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error) {
    console.error('Error al exportar padrón general:', error);
    return NextResponse.json({ error: 'Error al generar reporte de padrón' }, { status: 500 });
  }
}
