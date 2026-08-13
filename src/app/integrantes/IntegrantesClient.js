'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function IntegrantesClient({ initialMembers = [], currentUser }) {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [avatarUrl, setAvatarUrl] = useState('/images/634076865_1346800880815499_5762101862002171797_n.jpg');

  const openCreateModal = () => {
    setEditingUserId(null);
    setName('');
    setPhone('');
    setEmail('');
    setRole('MEMBER');
    setAvatarUrl('/images/634076865_1346800880815499_5762101862002171797_n.jpg');
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingUserId(member.id);
    setName(member.name || '');
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setRole(member.role || 'MEMBER');
    setAvatarUrl(member.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg');
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = Boolean(editingUserId);
      const res = await fetch('/api/usuarios', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUserId,
          name,
          phone,
          email,
          role,
          avatarUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isEditing) {
          setMembers(prev => prev.map(m => m.id === editingUserId ? data.user : m));
        } else {
          setMembers(prev => [...prev, data.user]);
        }
        setShowModal(false);
      } else {
        alert(data.error || 'Error al guardar el integrante');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (userId, action) => {
    setApprovalLoading(userId);
    try {
      const res = await fetch('/api/usuarios/aprobar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (action === 'APPROVE') {
          setMembers(prev => prev.map(m => m.id === userId ? { ...m, status: 'ACTIVE' } : m));
        } else {
          setMembers(prev => prev.filter(m => m.id !== userId));
        }
      } else {
        alert(data.error || 'Error al procesar la aprobación');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de eliminar a "${userName}" de la comparsa? Se borrarán sus asistencias y pagos.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/usuarios?id=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(prev => prev.filter(m => m.id !== userId));
      } else {
        alert(data.error || 'Error al eliminar integrante');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al eliminar');
    }
  };

  const getRoleLabel = (r) => {
    if (r === 'MUSICIAN') return 'Músico de Banda';
    if (r === 'ADMIN') return 'Tesorero / Directiva';
    return 'Socio Activo';
  };

  const pendingMembers = members.filter(m => m.status === 'PENDING');
  const activeMembers = members.filter(m => m.status !== 'PENDING');

  const filteredMembers = activeMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.phone && m.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalMembers = activeMembers.length;
  const countMembers = activeMembers.filter(m => m.role === 'MEMBER').length;
  const countMusicians = activeMembers.filter(m => m.role === 'MUSICIAN').length;
  const countAdmins = activeMembers.filter(m => m.role === 'ADMIN').length;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
          Padrón de Integrantes 👥
        </h2>
        <button 
          onClick={openCreateModal} 
          className="btn btn-green"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          + Nuevo Integrante
        </button>
      </div>

      {/* SECCIÓN DE SOLICITUDES PENDIENTES DE APROBACIÓN POR LA DIRECTIVA */}
      {pendingMembers.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          borderLeft: '4px solid #D97706',
          background: 'rgba(245, 158, 11, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <strong style={{ color: '#D97706', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🔔 SOLICITUDES DE INGRESO PENDIENTES DE AUTORIZACIÓN ({pendingMembers.length})
            </strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingMembers.map(pm => (
              <div key={pm.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'white',
                border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>{pm.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    📞 {pm.phone || 'Sin celular'} • {getRoleLabel(pm.role)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleApproveAction(pm.id, 'APPROVE')}
                    disabled={approvalLoading === pm.id}
                    className="btn btn-green"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    ✓ Autorizar Ingreso
                  </button>

                  <button
                    onClick={() => handleApproveAction(pm.id, 'REJECT')}
                    disabled={approvalLoading === pm.id}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ✕ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>{totalMembers}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Habilitados</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight 700, display: 'block', color: 'var(--color-asistencia)' }}>{countMembers}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Socios</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight 700, display: 'block', color: 'var(--color-aportes)' }}>{countMusicians}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Músicos</span>
        </div>
        <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight 700, display: 'block', color: 'var(--color-accent)' }}>{countAdmins}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Directiva</span>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <input 
          type="text"
          placeholder="🔍 Buscar por nombre o celular..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            marginBottom: '0.85rem',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'MEMBER', label: 'Socios Activos' },
            { id: 'MUSICIAN', label: 'Músicos' },
            { id: 'ADMIN', label: 'Directiva' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: roleFilter === f.id ? 'var(--color-asistencia)' : '#E0E0E0',
                color: roleFilter === f.id ? 'white' : '#555'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Integrantes Activos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredMembers.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No se encontraron integrantes habilitados.</p>
          </div>
        )}

        {filteredMembers.map(m => (
          <div key={m.id} className="glass-panel animate-fade-in" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'var(--bg-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img 
                src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                alt={m.name} 
                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                  {m.name}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: m.role === 'ADMIN' ? 'var(--color-accent)' : m.role === 'MUSICIAN' ? 'var(--color-aportes)' : 'var(--color-asistencia)',
                    color: m.role === 'MUSICIAN' ? '#161B14' : 'white'
                  }}>
                    {getRoleLabel(m.role)}
                  </span>
                  {m.phone && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📞 {m.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {m.phone && (
                <a
                  href={`https://wa.me/51${m.phone}?text=${encodeURIComponent(`¡Hola ${m.name}! La Directiva ha habilitado tu acceso a la Comparsa. Ingresa a la app para ver tu Carnet QR aquí: https://comparsa-app.vercel.app/api/auth/quicklogin?userId=${m.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: 'white',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  📲 QR
                </a>
              )}

              <button
                onClick={() => openEditModal(m)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563EB',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✏️
              </button>

              {m.id !== currentUser.id && (
                <button
                  onClick={() => handleDeleteUser(m.id, m.name)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-accent)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Integrante */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', background: 'var(--bg-primary)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              {editingUserId ? '✏️ Editar Datos de Integrante' : '+ Registrar Nuevo Integrante'}
            </h3>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Nombre Completo:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. María Quispe Mendoza" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Celular / WhatsApp (Sin prefijo +51):
                </label>
                <input 
                  type="tel" 
                  placeholder="Ej. 987654321" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Rol en la Comparsa:
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', background: 'white', color: '#111' }}
                >
                  <option value="MEMBER">Socio Activo (Bailarín)</option>
                  <option value="MUSICIAN">Músico de Banda (Exonerado)</option>
                  <option value="ADMIN">Tesorero / Directiva</option>
                </select>
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
                  {loading ? 'Guardando...' : editingUserId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
