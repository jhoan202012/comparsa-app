import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma, getDbUser } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../canciones.module.css';

export const dynamic = 'force-dynamic';

export default async function CancionDetallePage({ params }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await getDbUser(userId);
  if (!user) redirect('/login');

  const { id } = await params;
  
  let cancion = null;
  try {
    cancion = await prisma.song.findUnique({
      where: { id }
    });
  } catch (e) {
    console.error('Error buscando cancion:', e);
  }

  if (!cancion) redirect('/canciones');

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
        <Link href="/canciones" className={styles.backBtn}>← Canciones</Link>
        <h2 style={{ fontSize: '1.25rem', margin: 0, flex: 1, textAlign: 'center', color: 'var(--text-primary)' }}>
          {cancion.title}
        </h2>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.lyricsCard}`} style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '20px' }}>
        <pre className={styles.lyrics} style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.98rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
          {cancion.lyrics}
        </pre>
      </div>
    </div>
  );
}
