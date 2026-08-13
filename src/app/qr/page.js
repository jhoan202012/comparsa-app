import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QRClient from './QRClient';

export const dynamic = 'force-dynamic';

export default async function QRPage({ searchParams }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/'); 

  const params = await searchParams;
  const forceShowQR = params?.show === 'true';

  // Buscar el evento agendado más reciente o activo
  const activeEvent = await prisma.event.findFirst({
    orderBy: { date: 'desc' }
  });

  // Verificar si el usuario YA registró asistencia para este evento
  let myAttendance = null;
  if (activeEvent) {
    myAttendance = await prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: activeEvent.id
        }
      }
    });
  }

  return (
    <QRClient 
      initialUser={user}
      initialActiveEvent={activeEvent}
      initialAttendance={myAttendance}
      forceShowQR={forceShowQR}
    />
  );
}
