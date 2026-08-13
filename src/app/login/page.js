import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';
import Link from 'next/link';
import { IconMask } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const initialMode = params?.mode || 'login';

  let users = [];
  try {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: null }
        ]
      },
      orderBy: { role: 'asc' }
    });
  } catch (e) {
    try {
      users = await prisma.user.findMany({
        orderBy: { role: 'asc' }
      });
    } catch (err) {
      users = [];
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Header Superior Limpio (Sin botones innecesarios en la esquina) */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '1.5rem 2rem',
        maxWidth: '1140px',
        margin: '0 auto',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #D99B00', background: '#FFF', flexShrink: 0 }}>
            <img src="/images/Logo_1.jpg" alt="Logo Cangallo Señorial" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', letterSpacing: '0.5px', display: 'block', color: 'var(--text-primary)' }}>
              CANGALLO SEÑORIAL
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px' }}>
              CARNAVAL AYACUCHANO 2027
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section con alineación perfecta de base */}
      <main style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        padding: '2.5rem 1.5rem', 
        display: 'grid', 
        gridTemplateColumns: '1fr 420px', 
        gap: '2.5rem', 
        alignItems: 'stretch' 
      }}>
        
        {/* Lado Izquierdo: Presentación Cultural & Señorial */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <span style={{
                background: 'rgba(19, 96, 58, 0.08)',
                color: 'var(--color-asistencia)',
                border: '1px solid rgba(19, 96, 58, 0.18)',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-block'
              }}>
                ✨ Plataforma Oficial 2027 • Control Digital & Tesorería
              </span>

              <Link href="/manual" style={{
                background: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FCD34D',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                📖 Ver Guía Interactiva de Uso
              </Link>
            </div>

            <h1 style={{ fontSize: '2.4rem', lineHeight: '1.18', fontFamily: 'var(--font-playfair)', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              El orgullo ayacuchano<br/>
              <span style={{ color: 'var(--color-accent)' }}>organizado en tiempo real.</span>
            </h1>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', maxWidth: '520px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Cangallo Señorial más cerca de ti.</strong> Vive la pasión, elegancia y tradición de nuestra comparsa con la plataforma oficial del Carnaval Ayacuchano 2027.
            </p>
          </div>

          {/* Fotografía ubicada inmediatamente debajo del texto y extendida exactamente a la misma línea de base */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #CBD5E1', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginTop: '0.5rem', flex: 1, minHeight: '270px' }}>
            <img 
              src="/images/cangallo_4.jpg" 
              alt="Comparsa Cangallo Señorial Danzantes" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
            
            {/* Overlay flotante limpio */}
            <div style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '0.65rem 1rem',
              borderRadius: '14px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)'
            }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #D99B00', flexShrink: 0 }}>
                <img src="/images/Logo_1.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Plataforma Oficial</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-asistencia)', fontWeight: 700 }}>Cangallo Señorial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Login / Registro */}
        <div style={{
          background: '#FFFFFF',
          color: 'var(--text-primary)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'center'
        }}>
          <LoginForm users={users} initialMode={initialMode} />
        </div>

      </main>

    </div>
  );
}
