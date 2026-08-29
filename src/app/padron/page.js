import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PadronClient from './PadronClient';

export const metadata = {
  title: 'Padrón General de Socios Activos 2027 • Cangallo Señorial',
  description: 'Panel de control, censo de integrantes y descarga de backups en Excel para la Directiva.',
};

export default async function PadronPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  // Si no está autenticado como administrador, redirigir al portal de empadronamiento
  if (!userId) {
    redirect('/empadronamiento');
  }

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!admin || admin.role !== 'ADMIN') {
    redirect('/empadronamiento');
  }

  const members = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      dni: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      memberType: true,
      birthDate: true,
      gender: true,
      department: true,
      province: true,
      district: true,
      address: true,
      hasRelatives: true,
      relativesDetail: true,
      affiliationYear: true,
      talents: true,
      musicalInstrument: true,
      artCategory: true,
      artDetail: true,
      clothingSize: true,
      notes: true,
      avatarUrl: true,
      qr_code_hash: true,
      createdAt: true
    }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 3rem 1rem' }}>
      <PadronClient members={members} />
    </div>
  );
}
