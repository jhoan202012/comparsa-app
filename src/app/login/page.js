import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';
import styles from './login.module.css';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Obtenemos los usuarios reales de la base de datos para el "Login Simulado"
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' }
  });

  return (
    <div className={styles.container}>
      <div className={`glass-panel animate-fade-in ${styles.loginCard}`}>
        <h1 className="title-main" style={{fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center'}}>
          Carnaval<br/>Ayacuchano
        </h1>
        <p style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font-playfair)'}}>Selecciona un perfil de prueba para ingresar a la plataforma</p>
        
        <LoginForm users={users} />
      </div>
    </div>
  );
}
