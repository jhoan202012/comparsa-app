'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';
import { 
  IconHome, 
  IconChecklist, 
  IconWallet, 
  IconMusic, 
  IconCalendar, 
  IconUsers, 
  IconChartBar, 
  IconCamera,
  IconInbox 
} from '@/components/Icons';

export default function BottomNav({ userRole }) {
  const pathname = usePathname();

  // No mostrar la barra de navegación en login, empadronamiento o si no hay usuario logueado
  if (pathname === '/login' || pathname === '/empadronamiento' || !userRole) return null;

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <span className={styles.icon}>
          <IconHome size={20} color={pathname === '/' ? 'var(--color-asistencia)' : '#6B7280'} />
        </span>
        <span className={styles.label}>Inicio</span>
      </Link>
      
      {/* Músicos no ven pagos. Admins ven validación */}
      {userRole === 'ADMIN' ? (
        <Link href="/pagos" className={`${styles.navItem} ${pathname === '/pagos' ? styles.active : ''}`}>
          <span className={styles.icon}>
            <IconChecklist size={20} color={pathname === '/pagos' ? 'var(--color-asistencia)' : '#6B7280'} />
          </span>
          <span className={styles.label}>Validar</span>
        </Link>
      ) : userRole === 'MEMBER' ? (
        <Link href="/pagos" className={`${styles.navItem} ${pathname === '/pagos' ? styles.active : ''}`}>
          <span className={styles.icon}>
            <IconWallet size={20} color={pathname === '/pagos' ? 'var(--color-asistencia)' : '#6B7280'} />
          </span>
          <span className={styles.label}>Mis Pagos</span>
        </Link>
      ) : null}

      <Link href="/canciones" className={`${styles.navItem} ${pathname === '/canciones' ? styles.active : ''}`}>
        <span className={styles.icon}>
          <IconMusic size={20} color={pathname === '/canciones' ? 'var(--color-asistencia)' : '#6B7280'} />
        </span>
        <span className={styles.label}>Canciones</span>
      </Link>

      <Link href="/calendario" className={`${styles.navItem} ${pathname === '/calendario' ? styles.active : ''}`}>
        <span className={styles.icon}>
          <IconCalendar size={20} color={pathname === '/calendario' ? 'var(--color-asistencia)' : '#6B7280'} />
        </span>
        <span className={styles.label}>Calendario</span>
      </Link>

      <Link href="/buzon" className={`${styles.navItem} ${pathname === '/buzon' ? styles.active : ''}`}>
        <span className={styles.icon}>
          <IconInbox size={20} color={pathname === '/buzon' ? 'var(--color-asistencia)' : '#6B7280'} />
        </span>
        <span className={styles.label}>Buzón</span>
      </Link>
      
      {/* Los Admins tienen acceso directo al padrón de integrantes, reportes y escáner */}
      {userRole === 'ADMIN' && (
        <>
          <Link href="/integrantes" className={`${styles.navItem} ${pathname === '/integrantes' ? styles.active : ''}`}>
            <span className={styles.icon}>
              <IconUsers size={20} color={pathname === '/integrantes' ? 'var(--color-asistencia)' : '#6B7280'} />
            </span>
            <span className={styles.label}>Padrón</span>
          </Link>
          <Link href="/reportes" className={`${styles.navItem} ${pathname === '/reportes' ? styles.active : ''}`}>
            <span className={styles.icon}>
              <IconChartBar size={20} color={pathname === '/reportes' ? 'var(--color-asistencia)' : '#6B7280'} />
            </span>
            <span className={styles.label}>Reportes</span>
          </Link>
          <Link href="/escaner" className={`${styles.navItem} ${pathname === '/escaner' ? styles.active : ''}`}>
            <span className={styles.icon}>
              <IconCamera size={20} color={pathname === '/escaner' ? 'var(--color-asistencia)' : '#6B7280'} />
            </span>
            <span className={styles.label}>Escáner</span>
          </Link>
        </>
      )}
    </nav>
  );
}
