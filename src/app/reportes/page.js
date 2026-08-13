import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReportesClient from './ReportesClient';

export const dynamic = 'force-dynamic';

export default async function ReportesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Solo administradores pueden ver y descargar reportes de la comparsa
  if (!user || user.role !== 'ADMIN') redirect('/');

  const members = await prisma.user.findMany({
    where: { role: { in: ['MEMBER', 'MUSICIAN'] } },
    orderBy: { name: 'asc' }
  });

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });

  const attendances = await prisma.attendance.findMany();

  const fees = await prisma.paymentFee.findMany();

  const payments = await prisma.paymentRecord.findMany({
    include: { fee: true, user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ReportesClient 
      members={members}
      events={events}
      attendances={attendances}
      fees={fees}
      payments={payments}
    />
  );
}
