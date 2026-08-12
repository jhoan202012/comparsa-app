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
      where: { role: 'MEMBER' },
      orderBy: { name: 'asc' }
    });

    const fees = await prisma.paymentFee.findMany({
      orderBy: { dueDate: 'asc' }
    });

    const payments = await prisma.paymentRecord.findMany({
      include: { validatedBy: true }
    });

    // Estructurar filas para Excel
    const reportData = members.map(m => {
      const userPayments = payments.filter(p => p.userId === m.id);
      
      const row = {
        'Nombre del Socio': m.name,
        'Teléfono': m.phone || 'Sin registrar',
        'Correo': m.email || 'Sin registrar',
      };

      let totalAprobado = 0;

      fees.forEach(fee => {
        const record = userPayments.find(p => p.feeId === fee.id);
        const feeTitle = `${fee.title} (S/ ${fee.amount.toFixed(2)})`;
        if (record) {
          if (record.status === 'PAID' || record.status === 'APPROVED') {
            row[feeTitle] = '✅ APROBADO (Pagado)';
            totalAprobado += fee.amount;
          } else if (record.status === 'VALIDATING') {
            row[feeTitle] = '⏱ EN REVISIÓN (Voucher Subido)';
          } else {
            row[feeTitle] = '❌ PENDIENTE DE PAGO';
          }
        } else {
          row[feeTitle] = '❌ PENDIENTE DE PAGO';
        }
      });

      row['Total Aportado'] = `S/ ${totalAprobado.toFixed(2)}`;
      row['Estado General'] = totalAprobado > 0 ? 'AL DÍA' : 'DEUDOR';

      return row;
    });

    // Generar archivo Excel (.xlsx)
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aportes y Cuotas');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Reporte_Cuotas_Comparsa_${new Date().toISOString().slice(0,10)}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error al generar Excel de pagos:', error);
    return NextResponse.json({ error: 'Error al exportar reporte' }, { status: 500 });
  }
}
