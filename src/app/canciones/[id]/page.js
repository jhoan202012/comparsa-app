import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../canciones.module.css';

export const dynamic = 'force-dynamic';

export default async function CancionDetallePage({ params }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  // En Next.js 15, params es una promesa
  const { id } = await params;
  
  const cancion = await prisma.song.findUnique({
    where: { id }
  });

  if (!cancion) redirect('/canciones');

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
        <Link href="/canciones" className={styles.backBtn}>← Volver</Link>
        <h2 style={{ fontSize: '1.25rem', margin: 0, flex: 1, textAlign: 'center', color: 'var(--text-primary)' }}>{cancion.title}</h2>
        <div style={{width: '60px'}}></div>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.lyricsCard}`}>
        <pre className={styles.lyrics}>{cancion.lyrics}</pre>
      </div>
    </div>
  );
}
