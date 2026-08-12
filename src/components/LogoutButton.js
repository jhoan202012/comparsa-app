'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} style={{
      background: 'transparent',
      border: '1px solid var(--danger)',
      color: 'var(--danger)',
      padding: '0.3rem 0.8rem',
      borderRadius: '99px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600'
    }}>
      Salir
    </button>
  );
}
