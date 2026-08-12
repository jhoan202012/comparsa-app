import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CalendarClient from './CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  // Obtener lista completa de integrantes para calcular métricas de padrón
  const allMembers = await prisma.user.findMany({
    where: {
      role: { in: ['MEMBER', 'MUSICIAN'] }
    },
    select: { id: true, name: true, avatarUrl: true, role: true },
    orderBy: { name: 'asc' }
  });

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      attendances: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, role: true }
          }
        }
      }
    }
  });

  return (
    <CalendarClient 
      events={events} 
      currentUser={user} 
      allMembers={allMembers}
    />
  );
}
