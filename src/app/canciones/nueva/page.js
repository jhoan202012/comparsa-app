import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../canciones.module.css';
import FormCancion from './FormCancion';

export const dynamic = 'force-dynamic';

export default async function NuevaCancionPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Solo los Admins pueden añadir canciones
  if (!user || user.role !== 'ADMIN') redirect('/canciones');

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
        <Link href="/canciones" className={styles.backBtn}>← Cancelar</Link>
        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Nueva Canción</h2>
      </div>

      <div className={`glass-panel animate-fade-in`}>
        <FormCancion />
      </div>
    </div>
  );
}
