import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma, getDbUser } from '@/lib/prisma';
import Link from 'next/link';
import styles from './canciones.module.css';

export const dynamic = 'force-dynamic';

export default async function CancionesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await getDbUser(userId);
  if (!user) redirect('/login');

  let canciones = [];
  try {
    canciones = await prisma.song.findMany({
      orderBy: { title: 'asc' }
    });
  } catch (e) {
    console.error('Error al cargar canciones:', e);
    canciones = [];
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-asistencia)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
          ← Volver al Inicio
        </Link>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Comparsa Cangallo Señorial</span>
      </div>

      <div className={styles.header}>
        <h2 className="gradient-text">Cancionero Oficial 🎵</h2>
        <p className={styles.subtitle}>Letras oficiales para ensayos y presentaciones de carnaval</p>
      </div>

      {user?.role === 'ADMIN' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/canciones/nueva" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%', borderRadius: '14px', padding: '0.85rem' }}>
            + Añadir Nueva Canción al Catálogo
          </Link>
        </div>
      )}

      <div className={styles.list}>
        {canciones.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🎶</span>
            <p className={styles.empty}>Aún no hay canciones publicadas en el cancionero.</p>
          </div>
        )}

        {canciones.map(cancion => (
          <Link href={`/canciones/${cancion.id}`} key={cancion.id} className={`glass-panel animate-fade-in ${styles.songCard}`}>
            <div className={styles.songIcon}>🎤</div>
            <div className={styles.songInfo}>
              <h3>{cancion.title}</h3>
              <p>Toca para ver la letra completa</p>
            </div>
            <div className={styles.arrow}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
