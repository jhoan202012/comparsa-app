'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import BottomNav from '@/components/BottomNav';
import { IconInbox, IconCheckCircle } from '@/components/Icons';

export default function BuzonClient({ currentUser, initialFeedbacks = [] }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  // Estado del Formulario para Integrantes / Músicos
  const [type, setType] = useState('SUGERENCIA');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Estado para la vista de Admin
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [filterType, setFilterType] = useState('TODOS');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          isAnonymous,
          userName: currentUser?.name || 'Socio Registrado',
          userRole: currentUser?.role || 'MEMBER'
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage('');
      } else {
        alert('Hubo un error al enviar tu mensaje. Por favor reintenta.');
      }
    } catch (err) {
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterType === 'TODOS') return true;
    return f.type === filterType;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F0EA', paddingBottom: '90px' }}>
      
      {/* Header Superior Limpio con Branding */}
      <header className="dash-header" style={{ maxWidth: '1140px', margin: '0 auto 1.5rem', padding: '1rem 1.5rem' }}>
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
            <img src="/images/Logo_1.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <span className="dash-logo-title">BUZÓN DIRECTIVO</span>
            <span className="dash-logo-year">CANGALLO SEÑORIAL 2027</span>
          </div>
        </div>

        <div className="dash-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--color-asistencia)', fontWeight: 700, textDecoration: 'none' }}>
            ← Volver al Inicio
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* VISTA 1: INTEGRANTES Y MÚSICOS (FORMULARIO DE ENVÍO) */}
        {!isAdmin && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            border: '1.5px solid #CBD5E1',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: '14px', background: '#FEF3C7', color: '#B45309', display: 'flex' }}>
                <IconInbox size={28} color="#B45309" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair)', margin: 0, color: 'var(--text-primary)' }}>
                  Buzón de Sugerencias & Reclamos
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Tu opinión nos ayuda a construir la mejor comparsa de Ayacucho.
                </p>
              </div>
            </div>

            {submitted ? (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #10B981',
                color: '#065F46',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
                  <IconCheckCircle size={36} color="#10B981" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-playfair)' }}>
                  ¡Mensaje Enviado a la Directiva!
                </h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  Gracias por tu aporte. La junta directiva revisará tu {type.toLowerCase()} en la próxima asamblea.
                </p>

                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn"
                  style={{
                    marginTop: '1.25rem',
                    background: 'var(--color-asistencia)',
                    color: '#FFF',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ✍️ Enviar otra sugerencia o reclamo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Selector de Tipo */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Tipo de Mensaje:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                    {[
                      { id: 'SUGERENCIA', label: '💡 Sugerencia', color: '#B45309', bg: '#FEF3C7' },
                      { id: 'RECLAMO', label: '⚠️ Reclamo', color: '#B91C1C', bg: '#FEE2E2' },
                      { id: 'CONSULTA', label: '❓ Consulta', color: '#1D4ED8', bg: '#DBEAFE' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '12px',
                          border: type === item.id ? `2px solid ${item.color}` : '1.5px solid #CBD5E1',
                          background: type === item.id ? item.bg : '#FFF',
                          color: type === item.id ? item.color : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área de Texto */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Escribe tu mensaje con total claridad:
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ej. Sugiero programar los ensayos del domingo a las 4:00 PM o revisar las tallas M de las camisas..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Opción de Anónimo u Oficial */}
                <div style={{
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                      Privacidad del Envío:
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {isAnonymous ? '🔒 El mensaje se enviará como Socio Anónimo' : `👤 Identificado como ${currentUser?.name}`}
                    </span>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-asistencia)' }}>
                    <input 
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-asistencia)' }}
                    />
                    Enviar como Anónimo
                  </label>
                </div>

                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'var(--color-asistencia)',
                    color: '#FFF',
                    padding: '0.9rem',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(19, 96, 58, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? '⏳ Enviando...' : '🚀 Enviar Mensaje a la Directiva'}
                </button>

              </form>
            )}

          </div>
        )}

        {/* VISTA 2: ADMINISTRADOR / DIRECTIVA (PANEL DE LECTURA) */}
        {isAdmin && (
          <div>
            
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.75rem',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-playfair)', margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                    📥 Buzón Directivo Recibido
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Sugerencias, reclamos y consultas enviadas por los integrantes de Cangallo Señorial.
                  </p>
                </div>

                <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.4rem 0.85rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {feedbacks.length} Mensaje(s)
                </span>
              </div>

              {/* Filtros para Admin */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                {['TODOS', 'SUGERENCIA', 'RECLAMO', 'CONSULTA'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: filterType === t ? '1.5px solid var(--color-asistencia)' : '1px solid #CBD5E1',
                      background: filterType === t ? 'var(--color-asistencia)' : '#FFF',
                      color: filterType === t ? '#FFF' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {t === 'TODOS' ? '🌐 Todos' : t === 'SUGERENCIA' ? '💡 Sugerencias' : t === 'RECLAMO' ? '⚠️ Reclamos' : '❓ Consultas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed de Mensajes Recibidos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredFeedbacks.length === 0 ? (
                <div style={{ background: '#FFF', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid #CBD5E1' }}>
                  No se han registrado mensajes en esta categoría.
                </div>
              ) : (
                filteredFeedbacks.map(f => {
                  const isSug = f.type === 'SUGERENCIA';
                  const isRec = f.type === 'RECLAMO';
                  return (
                    <div 
                      key={f.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        padding: '1.25rem',
                        border: '1.5px solid #CBD5E1',
                        borderLeft: `5px solid ${isSug ? '#B45309' : isRec ? '#B91C1C' : '#1D4ED8'}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '8px',
                            background: isSug ? '#FEF3C7' : isRec ? '#FEE2E2' : '#DBEAFE',
                            color: isSug ? '#B45309' : isRec ? '#B91C1C' : '#1D4ED8',
                            marginRight: '0.5rem'
                          }}>
                            {isSug ? '💡 Sugerencia' : isRec ? '⚠️ Reclamo' : '❓ Consulta'}
                          </span>

                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {f.isAnonymous ? '🔒 Socio Anónimo' : `👤 ${f.userName}`}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            ({f.userRole === 'MUSICIAN' ? '🎷 Músico' : '💃 Integrante'})
                          </span>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(f.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        "{f.message}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </main>

      <BottomNav currentUser={currentUser} />
    </div>
  );
}
