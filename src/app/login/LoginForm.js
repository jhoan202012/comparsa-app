'use client';
import styles from './login.module.css';

export default function LoginForm({ users }) {
  return (
    <div className={styles.userList}>
      {users.map(user => (
        <a 
          key={user.id} 
          href={`/api/auth/quicklogin?userId=${user.id}`}
          className={`btn btn-outline ${styles.userBtn}`}
          style={{ textDecoration: 'none', width: '100%', display: 'block', padding: '1.1rem 1.25rem', cursor: 'pointer' }}
        >
          <div className={styles.userInfo}>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>{user.name}</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Rol: {user.role === 'ADMIN' ? 'Tesorero / Directiva' : user.role === 'MUSICIAN' ? 'Músico de Banda' : 'Socio Activo'}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
