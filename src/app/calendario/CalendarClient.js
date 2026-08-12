'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CalendarClient({ events: initialEvents, currentUser, allMembers = [] }) {
  const [events, setEvents] = useState(initialEvents || []);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Form states para nuevo evento (Admin)
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('Plaza Mayor de Ayacucho');
  const [type, setType] = useState('ENSAYO');
  const [description, setDescription] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(null);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullDateTime = `${date}T${time}:00`;
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date: fullDateTime,
          location,
          type,
          description
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(prev => [...prev, { ...data.event, attendances: [] }]);
        setShowModal(false);
        setTitle('');
        setDescription('');
      } else {
        alert(data.error || 'Error al crear evento');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, status, targetUserId = null) => {
    const userIdToMark = targetUserId || currentUser.id;
    setRsvpLoading(`${eventId}-${userIdToMark}`);
    try {
      const res = await fetch('/api/asistencia/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: userIdToMark, status })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEvents(prev => prev.map(ev => {
          if (ev.id !== eventId) return ev;
          const filtered = ev.attendances.filter(a => a.userId !== userIdToMark);
          return {
            ...ev,
            attendances: [...filtered, { userId: userIdToMark, status, user: data.user }]
          };
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
          Calendario de Ensayos 📅
        </h2>
        {currentUser.role === 'ADMIN' ? (
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-green"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            + Crear Evento
          </button>
        ) : (
          <div style={{ width: '60px' }}></div>
        )}
      </div>

      {/* Grid de Eventos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {events.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
              No hay ensayos o presentaciones agendadas en este momento.
            </p>
          </div>
        ) : (
          events.map(ev => {
            const evDate = new Date(ev.date);
            const dayNum = evDate.getDate().toString().padStart(2, '0');
            const monthStr = evDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
            const timeStr = evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const myAttendance = ev.attendances?.find(a => a.userId === currentUser.id);
            const isConfirmed = myAttendance?.status === 'PRESENT';
            const isDeclined = myAttendance?.status === 'ABSENT';
            const isLate = myAttendance?.status === 'LATE';

            // Estadísticas por evento (excluyendo cuentas de Administrador)
            const memberAttendances = ev.attendances?.filter(a => a.user?.role !== 'ADMIN') || [];
            const presentCount = memberAttendances.filter(a => a.status === 'PRESENT').length;
            const lateCount = memberAttendances.filter(a => a.status === 'LATE').length;
            const totalMembersCount = allMembers.length || 1;
            const unmarkedCount = Math.max(0, totalMembersCount - (presentCount + lateCount));
            const attendancePct = Math.min(100, Math.round(((presentCount + lateCount) / totalMembersCount) * 100));

            const isExpanded = expandedEventId === ev.id;

            return (
              <div key={ev.id} className="glass-panel animate-fade-in" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  
                  {/* Badge de Fecha */}
                  <div style={{
                    background: 'var(--color-asistencia)',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    minWidth: '70px',
                    boxShadow: '0 4px 12px rgba(19, 96, 58, 0.2)'
                  }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, display: 'block', lineHeight: 1 }}>{dayNum}</span>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>{monthStr}</span>
                  </div>

                  {/* Detalle del Evento */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '20px',
                        background: ev.type === 'PASACALLE' ? 'var(--color-aportes)' : ev.type === 'REUNION' ? '#3B82F6' : 'var(--color-asistencia)',
                        color: ev.type === 'PASACALLE' ? '#161B14' : 'white'
                      }}>
                        {ev.type || 'ENSAYO'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>⏰ {timeStr}</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {ev.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      📍 {ev.location}
                    </p>

                    {ev.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                        💡 {ev.description}
                      </p>
                    )}

                    {/* Botones de Confirmación Personal */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: currentUser.role === 'ADMIN' ? '0.85rem' : '0' }}>
                      <button
                        onClick={() => handleRSVP(ev.id, 'PRESENT')}
                        disabled={rsvpLoading === `${ev.id}-${currentUser.id}`}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: isConfirmed ? 'var(--color-asistencia)' : '#E0E0E0',
                          color: isConfirmed ? 'white' : '#444'
                        }}
                      >
                        {isConfirmed ? '✓ Asistencia Confirmada' : 'Confirmar Asistencia'}
                      </button>

                      <button
                        onClick={() => handleRSVP(ev.id, 'ABSENT')}
                        disabled={rsvpLoading === `${ev.id}-${currentUser.id}`}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: isDeclined ? 'var(--color-accent)' : '#E0E0E0',
                          color: isDeclined ? 'white' : '#444'
                        }}
                      >
                        {isDeclined ? '✕ No asistiré' : 'No asistiré'}
                      </button>
                    </div>

                    {/* SECCIÓN EXCLUSIVA PARA EL ADMINISTRADOR Y TESORERO */}
                    {currentUser.role === 'ADMIN' && (
                      <>
                        {/* Tarjeta de Estadísticas de Asistencia para este Evento */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.5rem',
                          margin: '0.85rem 0',
                          background: 'var(--bg-primary)',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border)'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{presentCount}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>✓ Presentes</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-aportes)', display: 'block' }}>{lateCount}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>⏱ Tarde</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)', display: 'block' }}>{unmarkedCount}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>❓ Sin Marcar</span>
                          </div>
                        </div>

                        {/* Barra de Porcentaje de Asistencia */}
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <span>Porcentaje de Asistencia</span>
                            <strong>{attendancePct}% ({presentCount + lateCount} de {totalMembersCount})</strong>
                          </div>
                          <div style={{ height: '6px', background: '#E0E0E0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${attendancePct}%`, background: 'var(--color-asistencia)', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                          </div>
                        </div>

                        {/* Botón para Desplegar el Padrón Completo del Evento */}
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--color-accent)',
                            cursor: 'pointer'
                          }}
                        >
                          {isExpanded ? '▲ Ocultar Padrón de Integrantes' : `▼ Ver Padrón Completo de Asistencias (${presentCount + lateCount}/${totalMembersCount})`}
                        </button>
                      </>
                    )}

                    {/* Padrón Desplegable de Integrantes con sus Estados (Exclusivo Administrador) */}
                    {currentUser.role === 'ADMIN' && isExpanded && (
                      <div className="animate-fade-in" style={{
                        marginTop: '0.85rem',
                        padding: '0.85rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                      }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                          Estado de los Integrantes en este Evento:
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {allMembers.map(m => {
                            const attRecord = ev.attendances?.find(a => a.userId === m.id);
                            const status = attRecord?.status;
                            const isP = status === 'PRESENT';
                            const isL = status === 'LATE';

                            return (
                              <div key={m.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '8px',
                                background: 'white'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <img 
                                    src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                                    alt={m.name}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <span>{m.name} ({m.role === 'MUSICIAN' ? 'Músico' : 'Socio'})</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                  {currentUser.role === 'ADMIN' ? (
                                    <>
                                      <button
                                        onClick={() => handleRSVP(ev.id, 'PRESENT', m.id)}
                                        style={{
                                          padding: '0.2rem 0.5rem',
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                          border: 'none',
                                          cursor: 'pointer',
                                          background: isP ? 'var(--color-asistencia)' : '#E0E0E0',
                                          color: isP ? 'white' : '#555'
                                        }}
                                      >
                                        ✓ Presente
                                      </button>
                                      <button
                                        onClick={() => handleRSVP(ev.id, 'LATE', m.id)}
                                        style={{
                                          padding: '0.2rem 0.5rem',
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                          border: 'none',
                                          cursor: 'pointer',
                                          background: isL ? 'var(--color-aportes)' : '#E0E0E0',
                                          color: isL ? '#161B14' : '#555'
                                        }}
                                      >
                                        ⏱ Tarde
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{
                                      fontWeight: 600,
                                      color: isP ? 'var(--color-asistencia)' : isL ? 'var(--color-aportes)' : '#888'
                                    }}>
                                      {isP ? '✓ Presente' : isL ? '⏱ Tarde' : 'Sin registrar'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para Crear Evento (Solo Administrador) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg-primary)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Agendar Nuevo Ensayo o Evento 📅
            </h3>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Título del Evento</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Ensayo General de Pasacalle"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Fecha</label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Hora</label>
                  <input 
                    type="time" 
                    required 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Lugar</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Plaza Mayor de Ayacucho"
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tipo de Evento</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="ENSAYO">Ensayo General</option>
                  <option value="PASACALLE">Pasacalle Oficial</option>
                  <option value="REUNION">Asamblea / Reunión</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Indicaciones / Vestuario</label>
                <textarea 
                  rows={2}
                  placeholder="Ej: Traer serpentina y vestuario blanco"
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#E0E0E0', color: '#333', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-green"
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {loading ? 'Guardando...' : 'Agendar Evento'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
