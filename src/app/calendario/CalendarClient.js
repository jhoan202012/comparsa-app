'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CalendarClient({ events: initialEvents, currentUser, allMembers = [] }) {
  const [events, setEvents] = useState(initialEvents || []);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form states para evento (Crear / Editar)
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('Plaza Mayor de Ayacucho');
  const [type, setType] = useState('ENSAYO');
  const [description, setDescription] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(null);

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle('');
    setDate('');
    setTime('16:00');
    setLocation('Plaza Mayor de Ayacucho');
    setType('ENSAYO');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    setTitle(ev.title || '');
    
    // Formatear fecha y hora para los inputs
    const d = new Date(ev.date);
    const dateStr = d.toISOString().split('T')[0];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    setDate(dateStr);
    setTime(`${hours}:${minutes}`);
    setLocation(ev.location || '');
    setType(ev.type || 'ENSAYO');
    setDescription(ev.description || '');
    setShowModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullDateTime = `${date}T${time}:00`;
      const isEditing = Boolean(editingEventId);
      
      const res = await fetch('/api/eventos', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEventId,
          title,
          date: fullDateTime,
          location,
          type,
          description
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isEditing) {
          setEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...data.event } : ev));
        } else {
          setEvents(prev => [...prev, { ...data.event, attendances: [] }]);
        }
        setShowModal(false);
      } else {
        alert(data.error || 'Error al guardar el evento');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('¿Estás seguro de eliminar este evento/ensayo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/eventos?id=${eventId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(prev => prev.filter(ev => ev.id !== eventId));
      } else {
        alert(data.error || 'Error al eliminar evento');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al eliminar');
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

  const getRoleLabel = (role) => {
    if (role === 'MUSICIAN') return 'Músico de Banda';
    if (role === 'MEMBER') return 'Socio Activo';
    if (role === 'ADMIN') return 'Tesorero / Directiva';
    return 'Integrante';
  };

  const activeMembersOnly = allMembers.filter(m => m.role !== 'ADMIN');

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
            onClick={openCreateModal} 
            className="btn btn-green"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            + Crear Evento
          </button>
        ) : (
          <div style={{ width: '50px' }}></div>
        )}
      </div>

      {/* Lista de Eventos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {events.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No hay ensayos o eventos programados por el momento.</p>
          </div>
        )}

        {events.map(ev => {
          const eventDate = new Date(ev.date);
          const isExpanded = expandedEventId === ev.id;
          const myAttendance = ev.attendances.find(a => a.userId === currentUser.id);

          const memberAttendances = ev.attendances.filter(a => a.user?.role !== 'ADMIN');
          const presentCount = memberAttendances.filter(a => a.status === 'PRESENT').length;
          const lateCount = memberAttendances.filter(a => a.status === 'LATE').length;
          const totalActiveCount = activeMembersOnly.length || 1;
          const percentage = Math.round(((presentCount + lateCount) / totalActiveCount) * 100);

          return (
            <div key={ev.id} className="glass-panel animate-fade-in" style={{ padding: '1.25rem' }}>
              
              {/* Badge de tipo de evento y acciones de administrador */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px',
                  background: ev.type === 'PRESENTACION' ? 'var(--color-accent)' : 'var(--color-asistencia)',
                  color: 'white'
                }}>
                  {ev.type || 'ENSAYO'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    📅 {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>

                  {currentUser.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => openEditModal(ev)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#2563EB',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--color-accent)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Título y Lugar */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--text-primary)', fontFamily: 'var(--font-playfair)' }}>
                {ev.title}
              </h3>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                <span>🕒 {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>📍 {ev.location}</span>
              </div>

              {ev.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{ev.description}"
                </p>
              )}

              {/* Métricas e Historial del Padrón (SOLO VISIBLE PARA ADMINISTRADORES) */}
              {currentUser.role === 'ADMIN' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Asistencia del Padrón: {presentCount} de {totalActiveCount} integrantes ({percentage}%)
                    </span>
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {isExpanded ? '▲ Ocultar Padrón' : '▼ Ver Padrón Completo'}
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div style={{ width: '100%', height: '8px', background: '#E0E0E0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-asistencia)', transition: 'width 0.3s' }}></div>
                  </div>

                  {/* Padrón Desplegable con Controles del Admin */}
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                      {activeMembersOnly.map(member => {
                        const memberAttendance = ev.attendances.find(a => a.userId === member.id);
                        const status = memberAttendance?.status;

                        return (
                          <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img 
                                src={member.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                                alt={member.name} 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{member.name}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({getRoleLabel(member.role)})</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleRSVP(ev.id, 'PRESENT', member.id)}
                                disabled={rsvpLoading === `${ev.id}-${member.id}`}
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '12px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: status === 'PRESENT' ? 'var(--color-asistencia)' : '#E0E0E0',
                                  color: status === 'PRESENT' ? 'white' : '#555'
                                }}
                              >
                                {status === 'PRESENT' ? '✓ Presente' : 'Presente'}
                              </button>

                              <button
                                onClick={() => handleRSVP(ev.id, 'ABSENT', member.id)}
                                disabled={rsvpLoading === `${ev.id}-${member.id}`}
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '12px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: status === 'ABSENT' ? 'var(--color-accent)' : '#E0E0E0',
                                  color: status === 'ABSENT' ? 'white' : '#555'
                                }}
                              >
                                {status === 'ABSENT' ? '✕ Falta' : 'Falta'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* RSVP Individual para el Socio */}
              {currentUser.role !== 'ADMIN' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {myAttendance?.status === 'PRESENT' ? '✅ Confirmaste tu asistencia' : myAttendance?.status === 'ABSENT' ? '❌ Marcaste que no asistirás' : '❓ Confirma tu asistencia al ensayo'}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRSVP(ev.id, 'PRESENT')}
                      disabled={rsvpLoading === `${ev.id}-${currentUser.id}`}
                      className="btn"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        background: myAttendance?.status === 'PRESENT' ? 'var(--color-asistencia)' : 'transparent',
                        border: '1px solid var(--color-asistencia)',
                        color: myAttendance?.status === 'PRESENT' ? 'white' : 'var(--color-asistencia)'
                      }}
                    >
                      ✓ Asistiré
                    </button>

                    <button
                      onClick={() => handleRSVP(ev.id, 'ABSENT')}
                      disabled={rsvpLoading === `${ev.id}-${currentUser.id}`}
                      className="btn"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        background: myAttendance?.status === 'ABSENT' ? 'var(--color-accent)' : 'transparent',
                        border: '1px solid var(--color-accent)',
                        color: myAttendance?.status === 'ABSENT' ? 'white' : 'var(--color-accent)'
                      }}
                    >
                      ✕ No asistiré
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modal de Crear / Editar Evento (Admin) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-primary)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              {editingEventId ? '✏️ Editar Ensayo o Evento' : '+ Crear Nuevo Ensayo / Evento'}
            </h3>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Título del Evento:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Ensayo General de Baile" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Fecha:
                  </label>
                  <input 
                    type="date" 
                    required
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Hora:
                  </label>
                  <input 
                    type="time" 
                    required
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Lugar:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Plaza Mayor de Ayacucho" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tipo de Evento:
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', background: 'white', color: '#111' }}
                >
                  <option value="ENSAYO">Ensayo Regular</option>
                  <option value="PRESENTACION">Presentación Oficial</option>
                  <option value="REUNION">Reunión de Comparsa</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Descripción (Opcional):
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ej. Asistir con vestuario completo de ensayo..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #ccc', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-green"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.95rem' }}
                >
                  {loading ? 'Guardando...' : editingEventId ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
