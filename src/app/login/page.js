import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const initialMode = params?.mode || 'login';

  const fallbackUsers = [
    {
      id: 'd16daa56-6856-46f7-b3cc-82e75f412f88',
      name: 'Admin Tesorero',
      dni: '99999999',
      phone: '999999999',
      role: 'ADMIN',
      status: 'ACTIVE',
      pin: '1234',
      avatarUrl: '/images/637900571_1346802750815312_4641331560730932914_n.jpg',
      qr_code_hash: 'admin-qr-hash-permanent-001'
    },
    {
      id: 'dda2d513-87c3-4933-b81e-4e1e641ba89c',
      name: 'Juan Perez',
      dni: '98888888',
      phone: '988888888',
      role: 'MEMBER',
      status: 'ACTIVE',
      pin: '1234',
      avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
      qr_code_hash: 'juan-perez-qr-hash-permanent-002'
    },
    {
      id: '7806cb12-fb9c-4888-9ab6-c34e0028cc6c',
      name: 'Carlos Trompeta',
      dni: '97777777',
      phone: '977777777',
      role: 'MUSICIAN',
      status: 'ACTIVE',
      pin: '1234',
      avatarUrl: '/images/634378036_1346802200815367_7429235445478519296_n.jpg',
      qr_code_hash: 'carlos-musico-qr-hash-permanent-003'
    }
  ];

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

  if (!users || users.length === 0) {
    users = fallbackUsers;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Header Superior Limpio */}
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

      {/* Hero Section */}
      <main style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        padding: '2.5rem 1.5rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'stretch'
      }}>
        
        {/* Lado Izquierdo */}
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
              Gestiona asistencias presenciales por código QR, solicitudes de vestuario confeccionado por tallas (S, M, L, XL), control de entregas y el balance de tesorería de nuestra comparsa.
            </p>
          </div>

          <div style={{ 
            marginTop: '0.5rem',
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '1.5px solid #CBD5E1', 
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
            position: 'relative',
            flex: 1,
            minHeight: '260px',
            display: 'flex'
          }}>
            <img 
              src="/images/cangallo_4.jpg" 
              alt="Danzantes Cangallo Señorial" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '260px' }} 
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
              padding: '1.25rem 1.5rem',
              color: '#FFF'
            }}>
              <strong style={{ fontSize: '0.95rem', display: 'block', fontFamily: 'var(--font-playfair)' }}>
                Comparsa Cangallo Señorial
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#FDE047', fontWeight: 600 }}>
                Patrimonio & Tradición del Carnaval de Ayacucho
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
          <LoginForm initialUsers={users} initialMode={initialMode} />
        </div>

      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--glass-border)',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        © 2027 Comparsa Cangallo Señorial • Ayacucho, Perú. Todos los derechos reservados.
      </footer>

    </div>
  );
}
