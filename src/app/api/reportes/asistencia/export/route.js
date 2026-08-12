import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 });
    }

    const members = await prisma.user.findMany({
      where: { role: { in: ['MEMBER', 'MUSICIAN'] } },
      orderBy: { name: 'asc' }
    });

    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });

    const attendances = await prisma.attendance.findMany();

    // Estructurar filas para Excel
    const reportData = members.map(m => {
      const userAttendances = attendances.filter(a => a.userId === m.id);
      const presentCount = userAttendances.filter(a => a.status === 'PRESENT').length;
      const lateCount = userAttendances.filter(a => a.status === 'LATE').length;
      const totalEvents = events.length || 1;
      const pct = Math.round(((presentCount + lateCount) / totalEvents) * 100);

      const row = {
        'Nombre del Integrante': m.name,
        'Rol': m.role === 'MUSICIAN' ? 'Músico' : 'Socio',
        'Teléfono': m.phone || 'Sin registrar',
        'Total Presentes': presentCount,
        'Total Tardanzas': lateCount,
        '% Asistencia': `${pct}%`,
      };

      // Agregar estado por cada ensayo individual
      events.forEach(ev => {
        const record = userAttendances.find(a => a.eventId === ev.id);
        const dateStr = new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const colTitle = `${ev.title} (${dateStr})`;
        row[colTitle] = record ? (record.status === 'PRESENT' ? 'Presente' : 'Tarde') : 'Falta / Sin Marca';
      });

      return row;
    });

    // Generar archivo Excel (.xlsx)
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Reporte_Asistencias_Comparsa_${new Date().toISOString().slice(0,10)}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error al generar Excel de asistencia:', error);
    return NextResponse.json({ error: 'Error al exportar reporte' }, { status: 500 });
  }
}
