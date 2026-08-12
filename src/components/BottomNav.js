'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';

export default function BottomNav({ userRole }) {
  const pathname = usePathname();

  // No mostrar la barra de navegación en la pantalla de login o si no hay usuario
  if (pathname === '/login' || !userRole) return null;

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>Inicio</span>
      </Link>
      
      {/* Músicos no ven pagos. Admins ven validación */}
      {userRole === 'ADMIN' ? (
        <Link href="/pagos" className={`${styles.navItem} ${pathname === '/pagos' ? styles.active : ''}`}>
          <span className={styles.icon}>📋</span>
          <span className={styles.label}>Validar</span>
        </Link>
      ) : userRole === 'MEMBER' ? (
        <Link href="/pagos" className={`${styles.navItem} ${pathname === '/pagos' ? styles.active : ''}`}>
          <span className={styles.icon}>💰</span>
          <span className={styles.label}>Mis Pagos</span>
        </Link>
      ) : null}

      <Link href="/canciones" className={`${styles.navItem} ${pathname === '/canciones' ? styles.active : ''}`}>
        <span className={styles.icon}>🎵</span>
        <span className={styles.label}>Canciones</span>
      </Link>

      <Link href="/calendario" className={`${styles.navItem} ${pathname === '/calendario' ? styles.active : ''}`}>
        <span className={styles.icon}>📅</span>
        <span className={styles.label}>Calendario</span>
      </Link>
      
      {/* Los Admins tienen acceso directo al escáner y reportes */}
      {userRole === 'ADMIN' && (
        <>
          <Link href="/reportes" className={`${styles.navItem} ${pathname === '/reportes' ? styles.active : ''}`}>
            <span className={styles.icon}>📊</span>
            <span className={styles.label}>Reportes</span>
          </Link>
          <Link href="/escaner" className={`${styles.navItem} ${pathname === '/escaner' ? styles.active : ''}`}>
            <span className={styles.icon}>📷</span>
            <span className={styles.label}>Escáner</span>
          </Link>
        </>
      )}
    </nav>
  );
}
