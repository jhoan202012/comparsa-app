import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import IntegrantesClient from './IntegrantesClient';

export const dynamic = 'force-dynamic';

export default async function IntegrantesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser || currentUser.role !== 'ADMIN') redirect('/');

  const members = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <IntegrantesClient 
      initialMembers={members}
      currentUser={currentUser}
    />
  );
}
