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
        setMembersList(prev => prev.map(item => item.id === editingMember.id ? { ...item, ...data.user } : item));
        setToastMsg(`Datos de ${editingMember.name} actualizados correctamente.`);
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
    <div style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1F2937',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid #D97706',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 99999
        }}>
          {toastMsg}
        </div>
      )}

      {/* Cabecera Ejecutiva Sobria */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: '6px',
              marginBottom: '0.35rem'
            }}>
              Base de Datos Oficial • Carnaval 2027
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#1F2937' }}>
              Padrón General de Socios Activos
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
              Censo institucional de identidad, vestuario, procedencia y talentos — Cangallo Señorial
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={copyPublicLink}
              style={{
                background: copied ? '#ECFDF5' : '#FFFFFF',
                color: copied ? '#059669' : '#374151',
                border: copied ? '1px solid #10B981' : '1px solid #D1D5DB',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? '✓ Enlace Copiado' : 'Copiar Link de Censo'}
            </button>

            <a
              href="/api/reportes/padron/export"
              download
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              Descargar Excel (.xlsx)
            </a>

            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/empadronamiento';
              }}
              style={{
                background: '#F3F4F6',
                color: '#4B5563',
                border: '1px solid #E5E7EB',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Limpias y Uniformes (Sin saturación de colores) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.1rem', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706' }}>{stats.total}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Empadronados</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.1rem', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F2937' }}>{stats.danzantes}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danzantes</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.1rem', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F2937' }}>{stats.musicos}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Músicos de Banda</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.1rem', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F2937' }}>{stats.directivos}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comité Directivo</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
          
          {/* Buscador de Texto */}
          <div>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, celular o talento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.88rem',
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none', color: '#374151' }}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="SOCIO">Danzantes</option>
              <option value="MUSICO">Músicos</option>
              <option value="DIRECTIVO">Directivos</option>
            </select>
          </div>

          {/* Filtro por Talento */}
          <div>
            <select
              value={talentFilter}
              onChange={e => setTalentFilter(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none', color: '#374151' }}
            >
              <option value="ALL">Todos los Talentos</option>
              <option value="Danza">Danza</option>
              <option value="Música">Música / Instrumentos</option>
              <option value="Canto">Canto</option>
              <option value="Creación">Creación / Letras</option>
              <option value="Arte">Fotografía / Arte</option>
            </select>
          </div>

          {/* Filtro por Distrito */}
          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none', color: '#374151' }}
            >
              <option value="ALL">Todos los Distritos</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Mostrando <strong>{filteredMembers.length}</strong> de <strong>{membersList.length}</strong> integrantes registrados</span>
          {(search || roleFilter !== 'ALL' || talentFilter !== 'ALL' || districtFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setRoleFilter('ALL'); setTalentFilter('ALL'); setDistrictFilter('ALL'); }}
              style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Limpiar Filtros ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabla del Padrón (Estilo Ejecutivo y Limpio) */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', color: '#4B5563', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px' }}>Socio / Identidad</th>
                <th style={{ padding: '12px 14px' }}>DNI & Código</th>
                <th style={{ padding: '12px 14px' }}>WhatsApp</th>
                <th style={{ padding: '12px 14px' }}>Rol</th>
                <th style={{ padding: '12px 14px' }}>Talentos</th>
                <th style={{ padding: '12px 14px' }}>Talla</th>
                <th style={{ padding: '12px 14px' }}>Procedencia</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    No se encontraron socios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F3F4F6', background: idx % 2 === 0 ? '#FFFFFF' : '#FAF7F2' }}>
                    
                    {/* Foto y Nombre */}
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'}
                        alt={m.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }}
                      />
                      <div>
                        <strong style={{ color: '#1F2937', display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {m.affiliationYear || '2027'} &bull; {m.gender === 'MUJER' ? 'Mujer' : 'Varón'}
                        </span>
                      </div>
                    </td>

                    {/* DNI & Código */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.9rem' }}>
                        {m.dni || '—'}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        color: '#92400E',
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        marginTop: '2px'
                      }}>
                        CÓD: {m.affiliationYear || '2027'}{m.dni || ''}
                      </span>
                    </td>

                    {/* WhatsApp */}
                    <td style={{ padding: '12px 14px' }}>
                      {m.phone ? (
                        <a
                          href={`https://wa.me/51${m.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#059669', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          {m.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>—</span>
                      )}
                    </td>

                    {/* Rol */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#EFF6FF' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#FEF2F2' : '#F0FDF4',
                        color: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#1D4ED8' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#B91C1C' : '#15803D',
                        border: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '1px solid #BFDBFE' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '1px solid #FECACA' : '1px solid #BBF7D0'
                      }}>
                        {m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? 'Músico' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? 'Directivo' : 'Danzante'}
                      </span>
                    </td>

                    {/* Talentos */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#374151' }}>
                        {m.talents || 'Danza'}
                      </div>
                      {m.musicalInstrument && (
                        <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600, display: 'block' }}>
                          {m.musicalInstrument}
                        </span>
                      )}
                    </td>

                    {/* Talla */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '4px', background: '#F3F4F6', color: '#374151', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #E5E7EB' }}>
                        {m.clothingSize || 'L'}
                      </span>
                    </td>

                    {/* Procedencia */}
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#4B5563' }}>
                      {m.district ? `${m.district} (${m.department || 'Ayacucho'})` : m.department || 'Ayacucho'}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          style={{
                            background: '#FFFFFF',
                            color: '#374151',
                            border: '1px solid #D1D5DB',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setSelectedMember(m)}
                          style={{
                            background: '#FFFBEB',
                            border: '1px solid #FCD34D',
                            color: '#92400E',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Carnet
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

      {/* ==================== MODAL DE EDICIÓN ==================== */}
      {editingMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  Editar Datos del Socio
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Actualiza o corrige los datos del integrante en el Padrón.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Nombre Completo */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                    Nombres y Apellidos:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                {/* DNI y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      DNI (8 dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={editingMember.dni}
                      onChange={e => setEditingMember({ ...editingMember, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Celular / WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={editingMember.phone}
                      onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Rol y Talla */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Rol / Membresía:
                    </label>
                    <select
                      value={editingMember.memberType}
                      onChange={e => setEditingMember({ ...editingMember, memberType: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 8px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="SOCIO">Danzante</option>
                      <option value="MUSICO">Músico</option>
                      <option value="DIRECTIVO">Directivo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Talla de Vestuario:
                    </label>
                    <select
                      value={editingMember.clothingSize}
                      onChange={e => setEditingMember({ ...editingMember, clothingSize: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 8px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none' }}
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
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Año de Afiliación:
                    </label>
                    <select
                      value={editingMember.affiliationYear}
                      onChange={e => setEditingMember({ ...editingMember, affiliationYear: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 8px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none' }}
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
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Género:
                    </label>
                    <select
                      value={editingMember.gender}
                      onChange={e => setEditingMember({ ...editingMember, gender: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 8px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="VARON">Varón</option>
                      <option value="MUJER">Mujer</option>
                    </select>
                  </div>
                </div>

                {/* Distrito y Dirección */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Distrito:
                    </label>
                    <input
                      type="text"
                      value={editingMember.district}
                      onChange={e => setEditingMember({ ...editingMember, district: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                      Dirección / Ref:
                    </label>
                    <input
                      type="text"
                      value={editingMember.address}
                      onChange={e => setEditingMember({ ...editingMember, address: e.target.value })}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Disciplinas / Talentos */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                    Talentos & Disciplinas:
                  </label>
                  <input
                    type="text"
                    value={editingMember.talents}
                    onChange={e => setEditingMember({ ...editingMember, talents: e.target.value })}
                    placeholder="Ej. Danza, Música, Canto"
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                {editingMember.memberType === 'MUSICO' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B45309', display: 'block', marginBottom: '3px' }}>
                      Instrumento Musical:
                    </label>
                    <input
                      type="text"
                      value={editingMember.musicalInstrument}
                      onChange={e => setEditingMember({ ...editingMember, musicalInstrument: e.target.value })}
                      placeholder="Ej. Mandolina, Quena, Trompeta"
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #FCD34D', background: '#FEF3C7', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                )}

                {/* Familiares */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '3px' }}>
                    Familiares en Comparsa (Opcional):
                  </label>
                  <input
                    type="text"
                    value={editingMember.relativesDetail}
                    onChange={e => setEditingMember({ ...editingMember, relativesDetail: e.target.value, hasRelatives: Boolean(e.target.value) })}
                    placeholder="Ej. Hermano de Carlos Taboada"
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  style={{ flex: 1, height: '44px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  style={{
                    flex: 2,
                    height: '44px',
                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: saveLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
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
            borderRadius: '20px',
            maxWidth: '380px',
            width: '100%',
            padding: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
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
                width: '30px',
                height: '30px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              ✕
            </button>

            {/* Carnet */}
            <div style={{
              background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
              color: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.5rem',
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              border: '2px solid #D97706',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 800, marginBottom: '0.35rem' }}>
                CARNET DIGITAL OFICIAL • 2027
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: '1.15', marginBottom: '0.85rem' }}>
                CANGALLO SEÑORIAL
              </div>

              <div style={{ width: '76px', height: '76px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FCD34D', margin: '0 auto 0.75rem auto', background: '#FFFFFF' }}>
                <img src={selectedMember.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                {selectedMember.name}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(217, 119, 6, 0.25)',
                border: '1px solid #FCD34D',
                color: '#FCD34D',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '1px',
                padding: '2px 10px',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                CÓDIGO: {selectedMember.affiliationYear || '2027'}{selectedMember.dni}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#E5E7EB', marginBottom: '0.85rem' }}>
                DNI: {selectedMember.dni} &bull; Talla: {selectedMember.clothingSize || 'L'}
              </div>

              <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${selectedMember.qr_code_hash}`}
                  alt="QR"
                  style={{ width: '120px', height: '120px', display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#FCD34D', fontWeight: 700 }}>
                {selectedMember.memberType === 'MUSICO' ? 'Músico de Banda' : selectedMember.memberType === 'DIRECTIVO' ? 'Comité Directivo' : 'Socio Danzante'} &bull; Cangallo Señorial
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.7rem',
                background: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
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
