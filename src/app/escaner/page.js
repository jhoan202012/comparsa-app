import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QRScannerClient from './QRScannerClient';

export const dynamic = 'force-dynamic';

export default async function EscanerPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Solo administradores pueden acceder al módulo de escáner
  if (!user || user.role !== 'ADMIN') redirect('/');

  // Obtener todos los integrantes (socios y músicos) excluyendo admins
  const members = await prisma.user.findMany({
    where: {
      role: { in: ['MEMBER', 'MUSICIAN'] }
    },
    orderBy: { name: 'asc' }
  });

  // Obtener la lista de todos los eventos agendados
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' }
  });

  const activeEvent = events[0] || null;

  let activeAttendances = {};
  if (activeEvent) {
    const records = await prisma.attendance.findMany({
      where: {
        eventId: activeEvent.id,
        user: {
          role: { in: ['MEMBER', 'MUSICIAN'] }
        }
      }
    });
    records.forEach(r => {
      activeAttendances[r.userId] = r.status;
    });
  }

  return (
    <QRScannerClient 
      members={members} 
      events={events}
      initialActiveEvent={activeEvent}
      activeAttendances={activeAttendances} 
    />
  );
}
