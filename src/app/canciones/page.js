import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './canciones.module.css';

export const dynamic = 'force-dynamic';

export default async function CancionesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  const canciones = await prisma.song.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="gradient-text">Cancionero 🎵</h2>
        <p className={styles.subtitle}>Letras oficiales para ensayos y presentaciones</p>
      </div>

      {user.role === 'ADMIN' && (
        <div style={{marginBottom: '2rem'}}>
          <Link href="/canciones/nueva" className={`btn btn-primary`} style={{textDecoration: 'none', width: '100%'}}>
            + Añadir Nueva Canción
          </Link>
        </div>
      )}

      <div className={styles.list}>
        {canciones.length === 0 && <p className={styles.empty}>Aún no hay canciones agregadas.</p>}
        {canciones.map(cancion => (
          <Link href={`/canciones/${cancion.id}`} key={cancion.id} className={`glass-panel animate-fade-in ${styles.songCard}`}>
            <div className={styles.songIcon}>🎤</div>
            <div className={styles.songInfo}>
              <h3>{cancion.title}</h3>
              <p>Toca para ver la letra</p>
            </div>
            <div className={styles.arrow}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
