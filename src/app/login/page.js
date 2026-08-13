import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const initialMode = params?.mode || 'login'; // 'login' | 'register'

  // Obtenemos los usuarios activos de la base de datos
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { role: 'asc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Header Superior Estilo Hapi (Colores Oficiales de la Comparsa) */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🎭</span>
          <div>
            <strong style={{ fontSize: '1.15rem', fontFamily: 'var(--font-playfair)', letterSpacing: '0.5px', display: 'block', color: 'var(--text-primary)' }}>
              CARNAVAL AYACUCHANO
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px' }}>
              CANGALLO SEÑORIAL 2027
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-only">
          <a href="#nosotros" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Nosotros</a>
          <a href="#ensayos" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Ensayos</a>
          <a href="#cancionero" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Cancionero</a>
        </nav>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link 
            href="/login?mode=login" 
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '20px',
              border: '1px solid var(--text-primary)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            Entrar
          </Link>
          <Link 
            href="/login?mode=register" 
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '20px',
              background: 'var(--color-asistencia)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(19, 96, 58, 0.3)'
            }}
          >
            Solicitar Registro
          </Link>
        </div>
      </header>

      {/* Hero Section Estilo Hapi */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 440px', gap: '3rem', alignItems: 'center' }}>
        
        {/* Lado Izquierdo: Presentación Visual de la App */}
        <div>
          <span style={{
            background: 'rgba(19, 96, 58, 0.1)',
            color: 'var(--color-asistencia)',
            border: '1px solid rgba(19, 96, 58, 0.2)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '1.25rem'
          }}>
            ✨ Plataforma Oficial 2027 • Control Digital de Asistencia & Tesorería
          </span>

          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.15', fontFamily: 'var(--font-playfair)', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            El orgullo ayacuchano<br/>
            <span style={{ color: 'var(--color-accent)' }}>organizado en tiempo real.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '520px', lineHeight: '1.6' }}>
            Carnet QR digital para ensayos, control de pagos Yape/Plin, cancionero oficial de la comparsa y reporte de asistencias del Carnaval de Ayacucho.
          </p>

          {/* Fotografía de la comparsa con badge flotante */}
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
            <img 
              src="/images/634041989_1346800734148847_7655715541676484146_n.jpg" 
              alt="Comparsa Cangallo Señorial" 
              style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }} 
            />
            
            {/* Overlay flotante estilo Hapi con colores oficiales */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }}>
              <span style={{ fontSize: '1.8rem' }}>📱</span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Escáner HD & Carnet QR</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-asistencia)', fontWeight: 700 }}>● Sincronizado en tiempo real con Supabase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Login / Registro (Fondo Blanco Cálido de la App) */}
        <div style={{
          background: '#FFFFFF',
          color: 'var(--text-primary)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--glass-border)'
        }}>
          <LoginForm users={users} initialMode={initialMode} />
        </div>

      </main>

    </div>
  );
}
