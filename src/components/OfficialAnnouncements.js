'use client';
import { useState } from 'react';

export default function OfficialAnnouncements({ initialAnnouncements = [], userRole }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAnnouncements(prev => [data.announcement, ...prev]);
        setShowModal(false);
        setTitle('');
        setContent('');
      } else {
        alert(data.error || 'Error al publicar comunicado');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'URGENTE':
        return { label: '🚨 URGENTE', bg: 'var(--color-accent)', color: 'white' };
      case 'VESTUARIO':
        return { label: '👗 VESTUARIO', bg: 'var(--color-aportes)', color: '#161B14' };
      case 'ENSAYO':
        return { label: '💃 ENSAYO', bg: 'var(--color-asistencia)', color: 'white' };
      default:
        return { label: '📢 COMUNICADO', bg: '#3B82F6', color: 'white' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
      
      {/* Header del tablero de avisos */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>📣</span>
          <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
            Avisos y Comunicados Oficiales
          </h3>
        </div>

        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-green"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            + Publicar Anuncio
          </button>
        )}
      </div>

      {/* Lista de Comunicados */}
      {announcements.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
          No hay comunicados urgentes publicados hoy.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {announcements.map(ann => {
            const badge = getCategoryBadge(ann.category);
            const dateStr = new Date(ann.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            const timeStr = new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={ann.id} style={{
                background: 'var(--bg-primary)',
                padding: '1rem',
                borderRadius: '14px',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    background: badge.bg,
                    color: badge.color
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    📅 {dateStr}, {timeStr}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  {ann.title}
                </h4>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>

                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <img 
                    src={ann.author?.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                    alt={ann.author?.name || 'Directiva'} 
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>Publicado por <strong>{ann.author?.name || 'Directiva'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para que la Directiva publique avisos */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
              Publicar Comunicado Oficial 📣
            </h3>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Título del Anuncio</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Traje oficial para el Pasacalle"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Categoría / Prioridad</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="GENERAL">📢 Comunicado General</option>
                  <option value="URGENTE">🚨 Urgente / Importante</option>
                  <option value="VESTUARIO">👗 Vestuario / Traje</option>
                  <option value="ENSAYO">💃 Convocatoria a Ensayo</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Detalle / Mensaje</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Escribe aquí las indicaciones para los integrantes de la comparsa..."
                  value={content} 
                  onChange={e => setContent(e.target.value)}
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
                  {loading ? 'Publicando...' : 'Publicar Anuncio'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
