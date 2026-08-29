'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PadronClient({ members: initialMembers = [] }) {
  const [membersList, setMembersList] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [talentFilter, setTalentFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Estado para el Modal de Edición
  const [editingMember, setEditingMember] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Estadísticas del Padrón
  const stats = useMemo(() => {
    const total = membersList.length;
    const danzantes = membersList.filter(m => (m.memberType === 'SOCIO' || m.role === 'MEMBER') && m.memberType !== 'MUSICO' && m.memberType !== 'DIRECTIVO').length;
    const musicos = membersList.filter(m => m.memberType === 'MUSICO' || m.role === 'MUSICIAN').length;
    const directivos = membersList.filter(m => m.memberType === 'DIRECTIVO' || m.role === 'ADMIN').length;
    
    const tallas = {};
    membersList.forEach(m => {
      if (m.clothingSize) {
        tallas[m.clothingSize] = (tallas[m.clothingSize] || 0) + 1;
      }
    });

    return { total, danzantes, musicos, directivos, tallas };
  }, [membersList]);

  // Lista única de distritos para el filtro
  const districts = useMemo(() => {
    const set = new Set();
    membersList.forEach(m => {
      if (m.district) set.add(m.district.trim());
    });
    return Array.from(set);
  }, [membersList]);

  // Filtrado de integrantes
  const filteredMembers = useMemo(() => {
    return membersList.filter(m => {
      const matchSearch = search === '' ||
        (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
        (m.dni && m.dni.includes(search)) ||
        (m.phone && m.phone.includes(search)) ||
        (m.district && m.district.toLowerCase().includes(search.toLowerCase())) ||
        (m.musicalInstrument && m.musicalInstrument.toLowerCase().includes(search.toLowerCase())) ||
        (m.talents && m.talents.toLowerCase().includes(search.toLowerCase()));

      const matchRole = roleFilter === 'ALL' ||
        (roleFilter === 'SOCIO' && (m.memberType === 'SOCIO' || (!m.memberType && m.role === 'MEMBER'))) ||
        (roleFilter === 'MUSICO' && (m.memberType === 'MUSICO' || m.role === 'MUSICIAN')) ||
        (roleFilter === 'DIRECTIVO' && (m.memberType === 'DIRECTIVO' || m.role === 'ADMIN'));

      const matchTalent = talentFilter === 'ALL' || (m.talents && m.talents.includes(talentFilter));
      const matchDistrict = districtFilter === 'ALL' || m.district === districtFilter;

      return matchSearch && matchRole && matchTalent && matchDistrict;
    });
  }, [membersList, search, roleFilter, talentFilter, districtFilter]);

  const copyPublicLink = () => {
    const url = `${window.location.origin}/empadronamiento`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (m) => {
    setEditingMember({
      id: m.id,
      name: m.name || '',
      dni: m.dni || '',
      phone: m.phone || '',
      email: m.email || '',
      memberType: m.memberType || (m.role === 'MUSICIAN' ? 'MUSICO' : m.role === 'ADMIN' ? 'DIRECTIVO' : 'SOCIO'),
      role: m.role || 'MEMBER',
      status: m.status || 'ACTIVE',
      birthDate: m.birthDate || '',
      gender: m.gender || 'VARON',
      department: m.department || 'Ayacucho',
      province: m.province || 'Cangallo',
      district: m.district || '',
      address: m.address || '',
      affiliationYear: m.affiliationYear || 2027,
      talents: m.talents || 'Danza',
      musicalInstrument: m.musicalInstrument || '',
      clothingSize: m.clothingSize || 'L',
      hasRelatives: Boolean(m.hasRelatives),
      relativesDetail: m.relativesDetail || '',
      notes: m.notes || ''
    });
  };

  // Guardar Cambios del Socio
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaveLoading(true);

    try {
      const res = await fetch('/api/padron/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Actualizar lista local de inmediato
        setMembersList(prev => prev.map(item => item.id === editingMember.id ? { ...item, ...data.user } : item));
        setToastMsg(`✅ Datos de ${editingMember.name} actualizados correctamente.`);
        setEditingMember(null);
        setTimeout(() => setToastMsg(null), 3500);
      } else {
        alert(data.error || 'Error al guardar los cambios');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar cambios.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0E472A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1.5px solid #D99B00',
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 99999
        }}>
          {toastMsg}
        </div>
      )}

      {/* Cabecera & Acciones Principales */}
      <div style={{
        background: 'linear-gradient(135deg, #002F18 0%, #0E472A 65%, #1A3624 100%)',
        color: '#FFFFFF',
        padding: '1.75rem 2rem',
        borderRadius: '22px',
        borderBottom: '4px solid #D99B00',
        marginBottom: '1.5rem',
        boxShadow: '0 12px 32px rgba(14, 71, 42, 0.16)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(217, 155, 0, 0.22)',
              border: '1px solid #FCD34D',
              color: '#FCD34D',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              padding: '3px 12px',
              borderRadius: '9999px',
              marginBottom: '0.4rem'
            }}>
              Base de Datos Oficial • Carnaval 2027
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#FFFFFF', letterSpacing: '0.5px' }}>
              PADRÓN GENERAL DE SOCIOS ACTIVOS
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#E5E7EB', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
              Censo institucional de identidad, talentos, vestuario y procedencia — Cangallo Señorial
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={copyPublicLink}
              style={{
                background: copied ? '#059669' : '#FEF3C7',
                color: copied ? '#FFFFFF' : '#92400E',
                border: '1.5px solid #F59E0B',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? '✓ ¡Enlace Copiado!' : '🔗 Copiar Link de Empadronamiento'}
            </button>

            <a
              href="/api/reportes/padron/export"
              download
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '0.75rem 1.35rem',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              📥 Descargar Backup en Excel (.xlsx)
            </a>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderTop: '4px solid #0E472A', borderRadius: '18px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0E472A' }}>{stats.total}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Empadronados</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderTop: '4px solid #D99B00', borderRadius: '18px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#D99B00' }}>{stats.danzantes}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💃 Danzantes / Bailarines</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderTop: '4px solid #2563EB', borderRadius: '18px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#2563EB' }}>{stats.musicos}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎺 Músicos de Banda</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderTop: '4px solid #B71C1C', borderRadius: '18px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#B71C1C' }}>{stats.directivos}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👑 Directiva & Delegados</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: '18px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
          
          {/* Buscador de Texto */}
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, DNI, celular o talento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1.5px solid #D1D5DB',
                fontSize: '0.92rem',
                background: '#FAF7F2',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtro por Rol */}
          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none', fontWeight: 600 }}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="SOCIO">💃 Danzantes</option>
              <option value="MUSICO">🎺 Músicos</option>
              <option value="DIRECTIVO">👑 Directivos</option>
            </select>
          </div>

          {/* Filtro por Talento */}
          <div>
            <select
              value={talentFilter}
              onChange={e => setTalentFilter(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none', fontWeight: 600 }}
            >
              <option value="ALL">Todos los Talentos</option>
              <option value="Danza">💃 Danza</option>
              <option value="Música">🎺 Música / Instrumentos</option>
              <option value="Canto">🎤 Canto</option>
              <option value="Creación">✍️ Creación / Letras</option>
              <option value="Arte">📸 Fotografía / Arte</option>
            </select>
          </div>

          {/* Filtro por Distrito */}
          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none', fontWeight: 600 }}
            >
              <option value="ALL">Todos los Distritos</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.85rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Mostrando <strong>{filteredMembers.length}</strong> de <strong>{membersList.length}</strong> integrantes registrados</span>
          {(search || roleFilter !== 'ALL' || talentFilter !== 'ALL' || districtFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setRoleFilter('ALL'); setTalentFilter('ALL'); setDistrictFilter('ALL'); }}
              style={{ background: 'none', border: 'none', color: '#B71C1C', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}
            >
              Limpiar Filtros ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabla del Padrón */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#0E472A', color: '#FFFFFF', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                <th style={{ padding: '14px 18px' }}>Socio / Identidad</th>
                <th style={{ padding: '14px 16px' }}>DNI & Código</th>
                <th style={{ padding: '14px 16px' }}>Contacto WhatsApp</th>
                <th style={{ padding: '14px 16px' }}>Rol / Membresía</th>
                <th style={{ padding: '14px 16px' }}>Talentos & Arte</th>
                <th style={{ padding: '14px 16px' }}>Talla</th>
                <th style={{ padding: '14px 16px' }}>Procedencia</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.95rem' }}>
                    No se encontraron socios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F3F4F6', background: idx % 2 === 0 ? '#FFFFFF' : '#FAF7F2' }}>
                    
                    {/* Foto y Nombre */}
                    <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'}
                        alt={m.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0E472A' }}
                      />
                      <div>
                        <strong style={{ color: '#1E1B18', display: 'block', fontSize: '0.95rem' }}>{m.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                          Afiliado: {m.affiliationYear || '2027'} &bull; {m.gender === 'MUJER' ? 'Mujer' : 'Varón'}
                        </span>
                      </div>
                    </td>

                    {/* DNI & Código Continuo de Socio */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0E472A', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                        {m.dni || '—'}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        color: '#92400E',
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 900,
                        marginTop: '3px',
                        letterSpacing: '0.5px'
                      }}>
                        CÓD: {m.affiliationYear || '2027'}{m.dni || ''}
                      </span>
                    </td>

                    {/* WhatsApp */}
                    <td style={{ padding: '14px 16px' }}>
                      {m.phone ? (
                        <a
                          href={`https://wa.me/51${m.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#059669', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          📱 {m.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>—</span>
                      )}
                    </td>

                    {/* Rol */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#DBEAFE' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#FEE2E2' : '#D1FAE5',
                        color: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#1E40AF' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#991B1B' : '#065F46'
                      }}>
                        {m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '🎺 Músico' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '👑 Directiva' : '💃 Danzante'}
                      </span>
                    </td>

                    {/* Talentos */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#1E1B18', fontWeight: 700 }}>
                        {m.talents || 'Danza'}
                      </div>
                      {m.musicalInstrument && (
                        <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 800, display: 'block' }}>
                          Instrumento: {m.musicalInstrument}
                        </span>
                      )}
                    </td>

                    {/* Talla */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '8px', background: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '0.85rem' }}>
                        {m.clothingSize || 'L'}
                      </span>
                    </td>

                    {/* Procedencia */}
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#4B5563' }}>
                      {m.district ? `${m.district} (${m.department || 'Ayacucho'})` : m.department || 'Ayacucho'}
                    </td>

                    {/* Botones de Acción (Editar y Carnet) */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          style={{
                            background: '#0E472A',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ✏️ Modificar
                        </button>
                        <button
                          onClick={() => setSelectedMember(m)}
                          style={{
                            background: '#FAF7F2',
                            border: '1px solid #D99B00',
                            color: '#92400E',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          🪪 Carnet
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODAL DE MODIFICACIÓN / EDICIÓN ==================== */}
      {editingMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '22px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid #0E472A'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #FAF7F2', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0E472A', margin: 0 }}>
                  ✏️ Modificar Datos del Socio
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Corrige cualquier error tipográfico o actualiza su información oficial.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Nombre Completo */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                    Nombres y Apellidos:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.92rem', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                {/* DNI y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      DNI (8 dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={editingMember.dni}
                      onChange={e => setEditingMember({ ...editingMember, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.92rem', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Celular / WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={editingMember.phone}
                      onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.92rem', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Rol y Talla */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Rol / Membresía:
                    </label>
                    <select
                      value={editingMember.memberType}
                      onChange={e => setEditingMember({ ...editingMember, memberType: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', fontWeight: 700, background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="SOCIO">💃 Danzante</option>
                      <option value="MUSICO">🎺 Músico</option>
                      <option value="DIRECTIVO">👑 Directivo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Talla de Vestuario:
                    </label>
                    <select
                      value={editingMember.clothingSize}
                      onChange={e => setEditingMember({ ...editingMember, clothingSize: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', fontWeight: 700, background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                {/* Año de Ingreso y Sexo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Año de Afiliación:
                    </label>
                    <select
                      value={editingMember.affiliationYear}
                      onChange={e => setEditingMember({ ...editingMember, affiliationYear: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', fontWeight: 700, background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="2027">2027</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2020">2020</option>
                      <option value="2015">2015</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Género:
                    </label>
                    <select
                      value={editingMember.gender}
                      onChange={e => setEditingMember({ ...editingMember, gender: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', fontWeight: 700, background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="VARON">Varón</option>
                      <option value="MUJER">Mujer</option>
                    </select>
                  </div>
                </div>

                {/* Distrito y Dirección */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Distrito:
                    </label>
                    <input
                      type="text"
                      value={editingMember.district}
                      onChange={e => setEditingMember({ ...editingMember, district: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                      Dirección / Ref:
                    </label>
                    <input
                      type="text"
                      value={editingMember.address}
                      onChange={e => setEditingMember({ ...editingMember, address: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Disciplinas / Talentos e Instrumento */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                    Talentos & Disciplinas:
                  </label>
                  <input
                    type="text"
                    value={editingMember.talents}
                    onChange={e => setEditingMember({ ...editingMember, talents: e.target.value })}
                    placeholder="Ej. Danza, Música, Canto"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                {editingMember.memberType === 'MUSICO' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '3px' }}>
                      🎺 Instrumento Musical:
                    </label>
                    <input
                      type="text"
                      value={editingMember.musicalInstrument}
                      onChange={e => setEditingMember({ ...editingMember, musicalInstrument: e.target.value })}
                      placeholder="Ej. Mandolina, Quena, Trompeta"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #F59E0B', fontSize: '0.88rem', background: '#FEF3C7', outline: 'none' }}
                    />
                  </div>
                )}

                {/* Familiares */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '3px' }}>
                    Familiares en Comparsa (Opcional):
                  </label>
                  <input
                    type="text"
                    value={editingMember.relativesDetail}
                    onChange={e => setEditingMember({ ...editingMember, relativesDetail: e.target.value, hasRelatives: Boolean(e.target.value) })}
                    placeholder="Ej. Hermano de Carlos Taboada"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  style={{ flex: 1, padding: '0.85rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  style={{
                    flex: 2,
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #0E472A 0%, #13603A 100%)',
                    color: '#FFFFFF',
                    border: '1px solid #D99B00',
                    borderRadius: '12px',
                    fontWeight: 900,
                    cursor: saveLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(14, 71, 42, 0.3)'
                  }}
                >
                  {saveLoading ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE VISTA DE CARNET ==================== */}
      {selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '400px',
            width: '100%',
            padding: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 900
              }}
            >
              ✕
            </button>

            {/* Carnet de Lujo en Modal */}
            <div style={{
              background: 'linear-gradient(135deg, #002F18 0%, #0E472A 65%, #1C1917 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              border: '2.5px solid #D99B00',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '1.8px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 800, marginBottom: '0.35rem' }}>
                CARNET DIGITAL OFICIAL • 2027
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: 1.15, marginBottom: '0.85rem' }}>
                CANGALLO SEÑORIAL
              </div>

              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FCD34D', margin: '0 auto 0.75rem auto', background: '#FFFFFF' }}>
                <img src={selectedMember.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                {selectedMember.name}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(217, 155, 0, 0.25)',
                border: '1px solid #FCD34D',
                color: '#FCD34D',
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '1px',
                padding: '2px 10px',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }}>
                CÓDIGO: {selectedMember.affiliationYear || '2027'}{selectedMember.dni}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#E5E7EB', fontWeight: 600, marginBottom: '0.85rem' }}>
                DNI: {selectedMember.dni} &bull; Talla: {selectedMember.clothingSize || 'L'}
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '14px', display: 'inline-block', marginBottom: '0.75rem' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedMember.qr_code_hash}`}
                  alt="QR"
                  style={{ width: '130px', height: '130px', display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#A7F3D0', fontWeight: 700 }}>
                {selectedMember.memberType === 'MUSICO' ? '🎺 Músico de Banda' : selectedMember.memberType === 'DIRECTIVO' ? '👑 Comité Directivo' : '💃 Socio Danzante'} &bull; Cangallo Señorial
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                background: '#0E472A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
