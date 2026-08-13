import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PagosAdmin from './PagosAdmin';
import PagosMiembro from './PagosMiembro';

export const dynamic = 'force-dynamic';

export default async function PagosPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Músicos no deben acceder a esta vista (sus cuotas están exoneradas)
  if (!user || user.role === 'MUSICIAN') redirect('/'); 

  // Catálogo disponible de prendas y cuotas publicado por Tesorería
  const catalogFees = await prisma.paymentFee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  if (user.role === 'ADMIN') {
    // Vista ADMIN: Obtener todos los pedidos y comprobantes registrados
    const allPayments = await prisma.paymentRecord.findMany({
      include: {
        user: true,
        fee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return <PagosAdmin fees={catalogFees} records={allPayments} currentUserId={user.id} />;
  } else {
    // Vista MIEMBRO: Obtener sus propios pedidos realizados
    const myPayments = await prisma.paymentRecord.findMany({
      where: { userId: user.id },
      include: { fee: true },
      orderBy: { createdAt: 'desc' }
    });
    return <PagosMiembro catalog={catalogFees} records={myPayments} currentUser={user} />;
  }
}
