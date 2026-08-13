import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import ManualClient from './ManualClient';

export const dynamic = 'force-dynamic';

export default async function ManualPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } });
  }

  return (
    <ManualClient currentUser={currentUser} />
  );
}
