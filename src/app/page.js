import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import OfficialAnnouncements from '@/components/OfficialAnnouncements';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  // Obtener aportes del usuario si es miembro para mostrar su actividad real personal
  const myPayments = user.role === 'MEMBER'
    ? await prisma.paymentRecord.findMany({
        where: { userId: user.id },
        include: { fee: true },
        orderBy: { createdAt: 'desc' },
        take: 2
      })
    : [];

  // Obtener asistencias reales del usuario registradas en la BD
  const myAttendances = await prisma.attendance.findMany({
    where: { userId: user.id },
    include: { event: true },
    orderBy: { timestamp: 'desc' },
    take: 2
  });

  // Obtener comunicados oficiales para la comparsa
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      author: {
        select: { name: true, role: true, avatarUrl: true }
      }
    }
  });

  // Obtener el evento más reciente o agendado en el calendario
  const nextEvent = await prisma.event.findFirst({
    orderBy: { date: 'desc' }
  });

  // Calcular métricas diferenciadas por rol (Admin vs Integrante)
  const totalEventsCount = (await prisma.event.count()) || 1;
  const totalMembersCount = (await prisma.user.count({ where: { role: { in: ['MEMBER', 'MUSICIAN'] } } })) || 1;
  
  // Asistencias globales de hoy para el Administrador
  const todayAttendancesCount = nextEvent ? await prisma.attendance.count({
    where: { eventId: nextEvent.id, status: { in: ['PRESENT', 'LATE'] } }
  }) : 0;
  const globalParticipationPct = Math.round((todayAttendancesCount / totalMembersCount) * 100);

  // Asistencias personales para Socio / Músico
  const userPresentCount = await prisma.attendance.count({
    where: { userId: user.id, status: { in: ['PRESENT', 'LATE'] } }
  });
  const userAttendancePct = Math.min(100, Math.round((userPresentCount / totalEventsCount) * 100));

  // Extraer el primer nombre del usuario
  const firstName = user.name.split(' ')[0];

  // Avatar del usuario o imagen por defecto de la comparsa
  const userAvatar = user.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg';

  const heroImage = '/images/634041989_1346800734148847_7655715541676484146_n.jpg';

  return (
    <div className="dash-container">
      
      {/* Header superior con logo e info de usuario */}
      <header className="dash-header">
        <div className="dash-logo">
          <span className="dash-logo-icon">🎭</span>
          <div>
            <span className="dash-logo-title">CARNAVAL AYACUCHANO</span>
            <span className="dash-logo-year">2027</span>
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
        
        {/* Lado Izquierdo: Tarjeta Hero con Fotografía del Usuario arriba a la derecha */}
        <div className="dash-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="dash-hero-welcome">¡Hola, {firstName}! 👋</p>
              <h1 className="dash-hero-title">Carnaval<br/>Ayacuchano<br/>2027</h1>
              <p className="dash-hero-subtitle">Sigamos haciendo historia, juntos.</p>
            </div>

            {/* Foto de perfil del usuario activa */}
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

        {/* Lado Derecho: 3 Tarjetas Operativas (Asistencia, Aportes, Cancionero) */}
        <div className="dash-modules-grid">
          
          {/* TARJETA 1: ASISTENCIA */}
          <div className="dash-card dash-card-green">
            <div className="dash-card-header">
              <span className="dash-card-icon">👥</span>
              <h2>ASISTENCIA</h2>
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

                <Link href="/escaner" className="dash-pill-btn dash-btn-green">
                  Escanear Asistencia (QR)
                </Link>
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

                <Link href="/qr" className="dash-pill-btn dash-btn-green">
                  Mostrar mi Código QR
                </Link>
              </>
            )}
          </div>

          {/* TARJETA 2: APORTES */}
          {user.role !== 'MUSICIAN' && (
            <div className="dash-card dash-card-gold">
              <div className="dash-card-header">
                <span className="dash-card-icon">💰</span>
                <h2>APORTES</h2>
              </div>

              {user.role === 'ADMIN' ? (
                <>
                  <div>
                    <div className="dash-card-stat">1</div>
                    <p className="dash-card-subtext">pago pendiente por revisar</p>
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
                  <Link href="/pagos" className="dash-pill-btn dash-btn-gold">
                    Validar Aportes
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <div className="dash-card-stat">S/ 50</div>
                    <p className="dash-card-subtext">cuota de Febrero pendiente</p>
                  </div>
                  <div className="dash-progress-wrap">
                    <div className="dash-progress-text">
                      <span>Mi estado</span>
                      <span>81% de la meta</span>
                    </div>
                    <div className="dash-progress-bar">
                      <div className="dash-progress-fill-gold" style={{ width: '81%' }}></div>
                    </div>
                  </div>
                  <Link href="/pagos" className="dash-pill-btn dash-btn-gold">
                    Ver o Subir Voucher
                  </Link>
                </>
              )}
            </div>
          )}

          {/* TARJETA 3: CANCIONERO */}
          <div className="dash-card dash-card-blue">
            <div className="dash-card-header">
              <span className="dash-card-icon">🎵</span>
              <h2>CANCIONERO</h2>
            </div>

            <div>
              <div className="dash-card-stat">18</div>
              <p className="dash-card-subtext">canciones para el 2027</p>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Nuestro cancionero oficial con letras de ensayos.
            </p>

            <Link href="/canciones" className="dash-pill-btn dash-btn-blue">
              Ver Canciones
            </Link>
          </div>

        </div>
      </div>

      {/* Grid Inferior: Actividad (Global para Admin, Personal para Usuarios) & Próxima Actividad */}
      <div className="dash-bottom-grid">
        
        {/* Actividad */}
        <div className="dash-info-card">
          <h3>{user.role === 'ADMIN' ? 'Actividad reciente (General)' : 'Mi actividad reciente'}</h3>
          <ul className="dash-activity-list">
            
            {/* Si es ADMIN ve los movimientos generales de la comparsa */}
            {user.role === 'ADMIN' && (
              <>
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">👥</div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">María Quispe registró su asistencia</span>
                    <time className="dash-activity-time">Hoy 6:02 p.m.</time>
                  </div>
                </li>
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">💰</div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">Juan Pérez realizó un aporte de S/ 50</span>
                    <time className="dash-activity-time">Hoy 5:58 p.m.</time>
                  </div>
                </li>
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">🎵</div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">Se añadió una nueva canción al cancionero</span>
                    <time className="dash-activity-time">Hoy 5:40 p.m.</time>
                  </div>
                </li>
              </>
            )}

            {/* Si es MEMBER ve sus propios pagos e asistencias reales con fecha y hora */}
            {user.role === 'MEMBER' && (
              <>
                {myPayments.length > 0 ? (
                  myPayments.map(p => (
                    <li key={p.id} className="dash-activity-item">
                      <div className="dash-activity-icon">💰</div>
                      <div className="dash-activity-content">
                        <span className="dash-activity-text">
                          {p.fee?.title || 'Cuota de Febrero'} - S/ {p.fee?.amount ? p.fee.amount.toFixed(2) : '50.00'} ({p.status === 'PAID' || p.status === 'APPROVED' ? 'Aprobado' : p.status === 'VALIDATING' ? 'En revisión' : 'Pendiente'})
                        </span>
                        <time className="dash-activity-time">
                          {new Date(p.updatedAt || p.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(p.updatedAt || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="dash-activity-item">
                    <div className="dash-activity-icon">💰</div>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">Cuota de Febrero (S/ 50) - Pendiente de pago</span>
                      <time className="dash-activity-time">Hoy</time>
                    </div>
                  </li>
                )}

                {myAttendances.length > 0 ? (
                  myAttendances.map(att => (
                    <li key={att.id} className="dash-activity-item">
                      <div className="dash-activity-icon">👥</div>
                      <div className="dash-activity-content">
                        <span className="dash-activity-text">
                          Asistencia en {att.event?.title || 'Ensayo General'} ({att.status === 'PRESENT' ? 'Presente' : 'Tarde'})
                        </span>
                        <time className="dash-activity-time">
                          {new Date(att.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="dash-activity-item">
                    <div className="dash-activity-icon">👥</div>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">Sin registros de asistencia aún</span>
                      <time className="dash-activity-time">Hoy</time>
                    </div>
                  </li>
                )}
              </>
            )}

            {/* Si es MUSICIAN ve sus asistencias reales con fecha y hora */}
            {user.role === 'MUSICIAN' && (
              <>
                {myAttendances.length > 0 ? (
                  myAttendances.map(att => (
                    <li key={att.id} className="dash-activity-item">
                      <div className="dash-activity-icon">👥</div>
                      <div className="dash-activity-content">
                        <span className="dash-activity-text">
                          Asistencia en {att.event?.title || 'Ensayo General'} ({att.status === 'PRESENT' ? 'Presente' : 'Tarde'})
                        </span>
                        <time className="dash-activity-time">
                          {new Date(att.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="dash-activity-item">
                    <div className="dash-activity-icon">👥</div>
                    <div className="dash-activity-content">
                      <span className="dash-activity-text">Sin registros de asistencia aún</span>
                      <time className="dash-activity-time">Hoy</time>
                    </div>
                  </li>
                )}
                <li className="dash-activity-item">
                  <div className="dash-activity-icon">🎵</div>
                  <div className="dash-activity-content">
                    <span className="dash-activity-text">Letras consultadas en el Cancionero</span>
                    <time className="dash-activity-time">Hace 1 hora</time>
                  </div>
                </li>
              </>
            )}

          </ul>
        </div>

        {/* Próxima Actividad (Para todos) */}
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
