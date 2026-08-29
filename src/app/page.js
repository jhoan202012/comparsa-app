import { cookies } from 'next/headers';
import { prisma, getDbUser } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import ClientRedirect from '@/components/ClientRedirect';
import Link from 'next/link';
import { IconUsers, IconShirt, IconWallet, IconMusic, IconMask, IconQrCode, IconInbox } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  // 🛡️ CANDADO DE FASE 1 (CENSO INSTITUCIONAL): 
  // Los visitantes públicos solo ven el Empadronamiento Oficial 2027.
  if (!userId) {
    return <ClientRedirect to="/empadronamiento" />;
  }

  const user = await getDbUser(userId);
  if (!user) {
    return <ClientRedirect to="/empadronamiento" />;
  }

  let unreadFeedbackCount = 0;
  let nextEvent = null;
  let totalEventsCount = 1;
  let totalMembersCount = 1;
  let todayAttendancesCount = 0;
  let globalParticipationPct = 0;
  let userPresentCount = 0;
  let userAttendancePct = 0;
  let countValidating = 0;
  let recentActivities = [];

  // Consultas defensivas protegidas individualmente
  if (user?.role === 'ADMIN') {
    try {
      unreadFeedbackCount = await prisma.feedback.count({ where: { status: 'PENDIENTE' } });
    } catch (e) {
      unreadFeedbackCount = 0;
    }
    try {
      countValidating = await prisma.paymentRecord.count({ where: { status: 'VALIDATING' } });
    } catch (e) {
      countValidating = 0;
    }

    // Actividades recientes generales para el Administrador
    try {
      const [latestAttendances, latestPayments] = await Promise.all([
        prisma.attendance.findMany({
          include: { user: true, event: true },
          orderBy: { timestamp: 'desc' },
          take: 3
        }),
        prisma.paymentRecord.findMany({
          include: { user: true, fee: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      ]);

      const attActs = latestAttendances.map(a => ({
        id: `att-${a.id}`,
        type: 'ATTENDANCE',
        title: `${a.user?.name || 'Socio'} registró su asistencia en ${a.event?.title || 'Ensayo'}`,
        status: a.status === 'PRESENT' ? 'Presente' : 'Tarde',
        date: new Date(a.timestamp)
      }));

      const payActs = latestPayments.map(p => ({
        id: `pay-${p.id}`,
        type: 'PAYMENT',
        title: `${p.user?.name || 'Socio'} - ${p.itemsDetail || (p.fee ? p.fee.title : 'Pago')}`,
        status: p.status === 'PAID' ? 'Aprobado' : p.status === 'VALIDATING' ? 'Por validar' : 'Pendiente',
        date: new Date(p.createdAt)
      }));

      recentActivities = [...attActs, ...payActs]
        .sort((a, b) => b.date - a.date)
        .slice(0, 4);
    } catch (e) {
      console.error('Error fetching admin activities:', e);
      recentActivities = [];
    }
  } else {
    // Actividades recientes personales para el Socio o Músico
    try {
      const [userAtts, userPays] = await Promise.all([
        prisma.attendance.findMany({
          where: { userId: user.id },
          include: { event: true },
          orderBy: { timestamp: 'desc' },
          take: 3
        }),
        prisma.paymentRecord.findMany({
          where: { userId: user.id },
          include: { fee: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      ]);

      const attActs = userAtts.map(a => ({
        id: `att-${a.id}`,
        type: 'ATTENDANCE',
        title: `Asistencia: ${a.event?.title || 'Ensayo Oficial'}`,
        status: a.status === 'PRESENT' ? 'Presente ✅' : 'Tarde ⏰',
        date: new Date(a.timestamp)
      }));

      const payActs = userPays.map(p => ({
        id: `pay-${p.id}`,
        type: 'PAYMENT',
        title: p.itemsDetail || (p.fee ? p.fee.title : 'Comprobante de Pago'),
        status: p.status === 'PAID' ? 'Aprobado 🟢' : p.status === 'VALIDATING' ? 'En revisión 🟡' : 'Pendiente 🔴',
        date: new Date(p.createdAt)
      }));

      recentActivities = [...attActs, ...payActs]
        .sort((a, b) => b.date - a.date)
        .slice(0, 4);
    } catch (e) {
      console.error('Error fetching user activities:', e);
      recentActivities = [];
    }
  }

  try {
    nextEvent = await prisma.event.findFirst({
      orderBy: { date: 'desc' }
    });
  } catch (e) {
    nextEvent = null;
  }

  try {
    totalEventsCount = (await prisma.event.count()) || 1;
  } catch (e) {
    totalEventsCount = 1;
  }

  try {
    totalMembersCount = (await prisma.user.count({ where: { role: { in: ['MEMBER', 'MUSICIAN'] } } })) || 1;
  } catch (e) {
    totalMembersCount = 1;
  }

  if (nextEvent) {
    try {
      todayAttendancesCount = await prisma.attendance.count({
        where: { eventId: nextEvent.id, status: { in: ['PRESENT', 'LATE'] } }
      });
    } catch (e) {
      todayAttendancesCount = 0;
    }
  }

  globalParticipationPct = Math.round((todayAttendancesCount / totalMembersCount) * 100);

  try {
    userPresentCount = await prisma.attendance.count({
      where: { userId: user.id, status: { in: ['PRESENT', 'LATE'] } }
    });
  } catch (e) {
    userPresentCount = 0;
  }

  userAttendancePct = Math.min(100, Math.round((userPresentCount / totalEventsCount) * 100));

  // Extraer el primer nombre del usuario
  const firstName = user?.name ? user.name.split(' ')[0] : 'Socio';

  // Avatar del usuario o imagen por defecto de la comparsa
  const userAvatar = user?.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg';
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
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--color-asistencia)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexShrink: 0,
              background: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={userAvatar} alt={user?.name || 'Usuario'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* 1. HERO BANNER HORIZONTAL EQUILIBRADO */}
      <div className="dash-hero-card">
        <div>
          <p className="dash-hero-welcome">¡Hola, {firstName}! 👋</p>
          <h1 className="dash-hero-title">Carnaval Ayacuchano 2027</h1>
          <p className="dash-hero-subtitle">Sigamos haciendo historia, juntos.</p>
        </div>

        <div className="dash-hero-img-wrapper">
          <img src={heroImage} alt="Danzantes Carnaval Ayacuchano" className="dash-hero-img" />
        </div>
      </div>

      {/* BANNER INSTITUCIONAL: EMPADRONAMIENTO DIGITAL & PADRÓN GENERAL */}
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        border: '1.5px solid #F59E0B',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(217, 155, 0, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#13603A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
            📝
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Campaña Oficial 2027
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#111827', display: 'block' }}>
              Empadronamiento Digital & Padrón General
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>
              Censo de talentos, músicos, vestuario y carnet QR para el Carnaval 2027.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/empadronamiento"
            style={{
              background: '#13603A',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(19, 96, 58, 0.25)'
            }}
          >
            ✍️ Registrarse / Empadronar
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              href="/padron"
              style={{
                background: '#FFFFFF',
                color: '#13603A',
                border: '1.5px solid #13603A',
                textDecoration: 'none',
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📋 Ver Padrón & Backups
            </Link>
          )}
        </div>
      </div>

      {/* 2. MÓDULOS OPERATIVOS EN GRID EQUILIBRADO (2x2) */}
      <div className="dash-modules-grid">
        
        {/* TARJETA 1: ASISTENCIA */}
        <div className="dash-card dash-card-green">
          <div className="dash-card-header">
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconUsers size={20} color="#065F46" />
            </div>
            <h2>ASISTENCIA & PADRÓN</h2>
          </div>
          
          {user?.role === 'ADMIN' ? (
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
        {user?.role !== 'MUSICIAN' && (
          <div className="dash-card dash-card-gold">
            <div className="dash-card-header">
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconShirt size={20} color="#B45309" />
              </div>
              <h2>APORTES & VESTUARIO</h2>
            </div>

            {user?.role === 'ADMIN' ? (
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

          {user?.role === 'ADMIN' ? (
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

      {/* 3. GRID INFERIOR: ACTIVIDAD & PRÓXIMA ACTIVIDAD */}
      <div className="dash-bottom-grid">
        
        {/* Actividad Reciente Integrada (Asistencia + Pagos en Vivo) */}
        <div className="dash-info-card">
          <h3>{user?.role === 'ADMIN' ? 'Actividad reciente (General)' : 'Mi actividad reciente'}</h3>
          <ul className="dash-activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(act => (
                <li key={act.id} className="dash-activity-item">
                  <div className="dash-activity-icon" style={{ background: act.type === 'ATTENDANCE' ? '#D1FAE5' : '#FEF3C7' }}>
                    {act.type === 'ATTENDANCE' ? (
                      <IconUsers size={16} color="#065F46" />
                    ) : (
                      <IconShirt size={16} color="#B45309" />
                    )}
                  </div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">
                      {act.title} <strong style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>({act.status})</strong>
                    </span>
                    <time className="dash-activity-time">
                      {act.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </li>
              ))
            ) : (
              <li className="dash-activity-item">
                <div className="dash-activity-icon">
                  <IconUsers size={16} color="var(--text-primary)" />
                </div>
                <div className="dash-activity-content">
                  <span className="dash-activity-text">Sin actividad reciente registrada</span>
                  <time className="dash-activity-time">Hoy</time>
                </div>
              </li>
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
