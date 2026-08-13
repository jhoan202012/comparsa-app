import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BuzónClient from './BuzónClient';

export const dynamic = 'force-dynamic';

export default async function BuzonPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect('/login');
  }

  let feedbacks = [];
  if (user.role === 'ADMIN') {
    try {
      feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      feedbacks = [];
    }
  }

  return (
    <BuzónClient currentUser={user} initialFeedbacks={feedbacks} />
  );
}
