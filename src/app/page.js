import { cookies } from 'next/headers';
import { prisma, getDbUser } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';
import LoginPage from './login/page';
import { IconUsers, IconShirt, IconWallet, IconMusic, IconMask, IconQrCode, IconInbox } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  let user = null;
  if (userId) {
    user = await getDbUser(userId);
  }

  // Si no está autenticado o la sesión expiró, renderizar la pantalla de Login directamente sin redirecciones HTTP
  if (!userId || !user) {
    return <LoginPage searchParams={Promise.resolve({})} />;
  }

  let unreadFeedbackCount = 0;
  let myPayments = [];
  let myAttendances = [];
  let nextEvent = null;
  let totalEventsCount = 1;
  let totalMembersCount = 1;
  let todayAttendancesCount = 0;
  let globalParticipationPct = 0;
  let userPresentCount = 0;
  let userAttendancePct = 0;
  let countValidating = 0;

  try {
    unreadFeedbackCount = user.role === 'ADMIN' 
      ? await prisma.feedback.count({ where: { status: 'PENDIENTE' } }).catch(() => 0)
      : 0;

    myPayments = user.role === 'MEMBER'
      ? await prisma.paymentRecord.findMany({
          where: { userId: user.id },
          include: { fee: true },
          orderBy: { createdAt: 'desc' },
          take: 2
        }).catch(() => [])
      : [];

    myAttendances = await prisma.attendance.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { timestamp: 'desc' },
      take: 2
    }).catch(() => []);

    nextEvent = await prisma.event.findFirst({
      orderBy: { date: 'desc' }
    }).catch(() => null);

    totalEventsCount = (await prisma.event.count().catch(() => 1)) || 1;
    totalMembersCount = (await prisma.user.count({ where: { role: { in: ['MEMBER', 'MUSICIAN'] } } }).catch(() => 1)) || 1;
    
    todayAttendancesCount = nextEvent ? await prisma.attendance.count({
      where: { eventId: nextEvent.id, status: { in: ['PRESENT', 'LATE'] } }
    }).catch(() => 0) : 0;
    
    globalParticipationPct = Math.round((todayAttendancesCount / totalMembersCount) * 100);

    userPresentCount = await prisma.attendance.count({
      where: { userId: user.id, status: { in: ['PRESENT', 'LATE'] } }
    }).catch(() => 0);
    
    userAttendancePct = Math.min(100, Math.round((userPresentCount / totalEventsCount) * 100));

    countValidating = user.role === 'ADMIN' ? await prisma.paymentRecord.count({ where: { status: 'VALIDATING' } }).catch(() => 0) : 0;
  } catch (err) {
    console.error('Error al cargar datos en Home:', err);
  }

  // Extraer el primer nombre del usuario
  const firstName = user.name ? user.name.split(' ')[0] : 'Socio';

  // Avatar del usuario o imagen por defecto de la comparsa
  const userAvatar = user.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg';
  const heroImage = '/images/cangallo_1.jpg';
  const officialLogo = '/images/Logo_1.jpg';

  return (
    <div className="dash-container">
      
      {/* Header superior con logo oficial e info de usuario */}
      <header className="dash-header">
        <div className="dash-logo">
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #D99B00',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            flexShrink: 0,
            background: '#FFF'
          }}>
            <img src={officialLogo} alt="Logo Cangallo Señorial" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <span className="dash-logo-title">CANGALLO SEÑORIAL</span>
            <span className="dash-logo-year">CARNAVAL AYACUCHANO 2027</span>
          </div>
        </div>
        
        <div className="dash-header-actions">
          <Link href="/perfil" title="Editar Mi Perfil" style={{ textDecoration: 'none' }}>
            <div className="dash-user-badge" style={{ overflow: 'hidden', padding: 0, cursor: 'pointer' }}>
              <img src={userAvatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Grid Principal: Hero a la izquierda, 3 tarjetas a la derecha */}
      <div className="dash-top-grid">
        
        {/* Lado Izquierdo: Tarjeta Hero */}
        <div className="dash-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="dash-hero-welcome">¡Hola, {firstName}! 👋</p>
              <h1 className="dash-hero-title">Carnaval<br/>Ayacuchano<br/>2027</h1>
              <p className="dash-hero-subtitle">Sigamos haciendo historia, juntos.</p>
            </div>

            <Link href="/perfil" title="Cambiar mi foto de perfil" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--color-asistencia)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                flexShrink: 0,
                cursor: 'pointer'
              }}>
                <img src={userAvatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </Link>
          </div>
          
          <div className="dash-hero-img-wrapper">
            <img src={heroImage} alt="Danzantes Carnaval Ayacuchano" className="dash-hero-img" />
          </div>
        </div>

        {/* Lado Derecho: 3 Tarjetas Operativas */}
        <div className="dash-modules-grid">
          
          {/* TARJETA 1: ASISTENCIA */}
          <div className="dash-card dash-card-green">
            <div className="dash-card-header">
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUsers size={20} color="#065F46" />
              </div>
              <h2>ASISTENCIA & PADRÓN</h2>
            </div>
            
            {user.role === 'ADMIN' ? (
              <>
                <div>
                  <div className="dash-card-stat">{todayAttendancesCount}</div>
                  <p className="dash-card-subtext">presentes hoy en ensayo</p>
                </div>

                <div className="dash-progress-wrap">
                  <div className="dash-progress-text">
                    <span>Participación General</span>
                    <span>{globalParticipationPct}%</span>
                  </div>
                  <div className="dash-progress-bar">
                    <div className="dash-progress-fill-green" style={{ width: `${globalParticipationPct}%` }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href="/escaner" className="dash-pill-btn dash-btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <IconQrCode size={18} color="#FFF" />
                    Escanear Asistencia (QR)
                  </Link>
                  <Link href="/integrantes" style={{ fontSize: '0.8rem', color: 'var(--color-asistencia)', textDecoration: 'underline', fontWeight: 600, textAlign: 'center' }}>
                    Administrar Integrantes
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="dash-card-stat">{userPresentCount}</div>
                  <p className="dash-card-subtext">ensayo(s) asistidos</p>
                </div>

                <div className="dash-progress-wrap">
                  <div className="dash-progress-text">
                    <span>Mi Asistencia</span>
                    <span>{userAttendancePct}%</span>
                  </div>
                  <div className="dash-progress-bar">
                    <div className="dash-progress-fill-green" style={{ width: `${userAttendancePct}%` }}></div>
                  </div>
                </div>

                <Link href="/qr" className="dash-pill-btn dash-btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <IconQrCode size={18} color="#FFF" />
                  Mostrar mi Código QR
                </Link>
              </>
            )}
          </div>

          {/* TARJETA 2: APORTES & TIENDA DE VESTUARIO */}
          {user.role !== 'MUSICIAN' && (
            <div className="dash-card dash-card-gold">
              <div className="dash-card-header">
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconShirt size={20} color="#B45309" />
                </div>
                <h2>APORTES & VESTUARIO</h2>
              </div>

              {user.role === 'ADMIN' ? (
                <>
                  <div>
                    <div className="dash-card-stat">{countValidating}</div>
                    <p className="dash-card-subtext">pedido(s) o pago(s) por revisar</p>
                  </div>
                  <div className="dash-progress-wrap">
                    <div className="dash-progress-text">
                      <span>Recaudado</span>
                      <span>81%</span>
                    </div>
                    <div className="dash-progress-bar">
                      <div className="dash-progress-fill-gold" style={{ width: '81%' }}></div>
                    </div>
                  </div>
                  <Link href="/pagos" className="dash-pill-btn dash-btn-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <IconWallet size={18} color="#FFF" />
                    Validar Aportes & Pedidos
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <div className="dash-card-stat">TIENDA</div>
                    <p className="dash-card-subtext">Ropa, Vestuario & Aportes</p>
                  </div>
                  <div className="dash-progress-wrap">
                    <div className="dash-progress-text">
                      <span>Catálogo Disponible</span>
                      <span>Varones & Mujeres</span>
                    </div>
                    <div className="dash-progress-bar">
                      <div className="dash-progress-fill-gold" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <Link href="/pagos" className="dash-pill-btn dash-btn-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <IconShirt size={18} color="#FFF" />
                    Adquirir Vestuario & Pagar
                  </Link>
                </>
              )}
            </div>
          )}

          {/* TARJETA 3: CANCIONERO */}
          <div className="dash-card dash-card-blue">
            <div className="dash-card-header">
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMusic size={20} color="#1E40AF" />
              </div>
              <h2>CANCIONERO</h2>
            </div>

            <div>
              <div className="dash-card-stat">18</div>
              <p className="dash-card-subtext">canciones para el 2027</p>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Nuestro cancionero oficial con letras de ensayos.
            </p>

            <Link href="/canciones" className="dash-pill-btn dash-btn-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <IconMusic size={18} color="#FFF" />
              Ver Canciones
            </Link>
          </div>

          {/* TARJETA 4: BUZÓN DIRECTIVO */}
          <div className="dash-card" style={{ borderTop: '4px solid #B45309' }}>
            <div className="dash-card-header">
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconInbox size={20} color="#B45309" />
              </div>
              <h2>BUZÓN DIRECTIVO</h2>
            </div>

            {user.role === 'ADMIN' ? (
              <>
                <div>
                  <div className="dash-card-stat">{unreadFeedbackCount}</div>
                  <p className="dash-card-subtext">mensaje(s) o sugerencia(s) en buzón</p>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Revisa sugerencias, reclamos y observaciones enviadas por los socios.
                </p>
                <Link href="/buzon" className="dash-pill-btn" style={{ background: '#B45309', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <IconInbox size={18} color="#FFF" />
                  Leer Sugerencias Recibidas
                </Link>
              </>
            ) : (
              <>
                <div>
                  <div className="dash-card-stat">100%</div>
                  <p className="dash-card-subtext">Canal confidencial directivo</p>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Envía tus opiniones, reclamos o sugerencias a la junta directiva (Oficial o Anónimo).
                </p>
                <Link href="/buzon" className="dash-pill-btn" style={{ background: '#B45309', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <IconInbox size={18} color="#FFF" />
                  Enviar Sugerencia / Reclamo
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Grid Inferior: Actividad & Próxima Actividad */}
      <div className="dash-bottom-grid">
        
        {/* Actividad */}
        <div className="dash-info-card">
          <h3>{user.role === 'ADMIN' ? 'Actividad reciente (General)' : 'Mi actividad reciente'}</h3>
          <ul className="dash-activity-list">
            
            {user.role === 'ADMIN' && (
              <>
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">
                    <IconUsers size={16} color="var(--text-primary)" />
                  </div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">María Quispe registró su asistencia</span>
                    <time className="dash-activity-time">Hoy 6:02 p.m.</time>
                  </div>
                </li>
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">
                    <IconWallet size={16} color="var(--text-primary)" />
                  </div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">Juan Pérez realizó un aporte de S/ 50</span>
                    <time className="dash-activity-time">Hoy 5:58 p.m.</time>
                  </div>
                </li>
              </>
            )}

            {user.role === 'MEMBER' && (
              <>
                {myPayments.length > 0 ? (
                  myPayments.map(p => (
                    <li key={p.id} className="dash-activity-item">
                      <div className="dash-activity-icon">
                        <IconShirt size={16} color="var(--text-primary)" />
                      </div>
                      <div className="dash-activity-content">
                        <span className="dash-activity-text">
                          {p.itemsDetail || (p.fee ? p.fee.title : 'Pedido de Vestuario')} ({p.status === 'PAID' ? 'Aprobado' : p.status === 'VALIDATING' ? 'En revisión' : 'Pendiente'})
                        </span>
                        <time className="dash-activity-time">
                          {new Date(p.updatedAt || p.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </time>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="dash-activity-item">
                    <div className="dash-activity-icon">
                      <IconShirt size={16} color="var(--text-primary)" />
                    </div>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">Sin pedidos recientes</span>
                      <time className="dash-activity-time">Hoy</time>
                    </div>
                  </li>
                )}
              </>
            )}

          </ul>
        </div>

        {/* Próxima Actividad */}
        <div className="dash-info-card">
          <h3>Próxima actividad</h3>
          {nextEvent ? (
            <div className="dash-event-box">
              <div className="dash-event-date-badge">
                <span className="dash-event-day">
                  {new Date(nextEvent.date).getDate().toString().padStart(2, '0')}
                </span>
                <span className="dash-event-month">
                  {new Date(nextEvent.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                </span>
              </div>
              <div className="dash-event-info">
                <strong>{nextEvent.title}</strong>
                <p>
                  {new Date(nextEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {nextEvent.location}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No hay eventos próximos agendados.</p>
          )}
          
          <Link href="/calendario" className="dash-outline-btn">
            Ver Calendario Completo
          </Link>
        </div>

      </div>

    </div>
  );
}
