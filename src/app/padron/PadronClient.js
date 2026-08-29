'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PadronClient({ members = [] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [talentFilter, setTalentFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Estadísticas del Padrón
  const stats = useMemo(() => {
    const total = members.length;
    const danzantes = members.filter(m => (m.memberType === 'SOCIO' || m.role === 'MEMBER') && m.memberType !== 'MUSICO' && m.memberType !== 'DIRECTIVO').length;
    const musicos = members.filter(m => m.memberType === 'MUSICO' || m.role === 'MUSICIAN').length;
    const directivos = members.filter(m => m.memberType === 'DIRECTIVO' || m.role === 'ADMIN').length;
    
    // Conteo de tallas
    const tallas = {};
    members.forEach(m => {
      if (m.clothingSize) {
        tallas[m.clothingSize] = (tallas[m.clothingSize] || 0) + 1;
      }
    });

    return { total, danzantes, musicos, directivos, tallas };
  }, [members]);

  // Lista única de distritos para el filtro
  const districts = useMemo(() => {
    const set = new Set();
    members.forEach(m => {
      if (m.district) set.add(m.district.trim());
    });
    return Array.from(set);
  }, [members]);

  // Filtrado de integrantes
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
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
  }, [members, search, roleFilter, talentFilter, districtFilter]);

  const copyPublicLink = () => {
    const url = `${window.location.origin}/empadronamiento`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      
      {/* Cabecera & Acciones Principales */}
      <div style={{ background: 'linear-gradient(135deg, #0E472A 0%, #13603A 60%, #1C1917 100%)', color: '#FFFFFF', padding: '1.5rem 1.75rem', borderRadius: '18px', borderBottom: '3.5px solid #D99B00', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(19, 96, 58, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(217, 155, 0, 0.25)', border: '1px solid #FCD34D', color: '#FCD34D', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', padding: '2.5px 9px', borderRadius: '12px', marginBottom: '0.35rem' }}>
              Base de Datos Oficial • Carnaval 2027
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
              PADRÓN GENERAL DE SOCIOS ACTIVOS
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#E5E7EB', margin: '0.2rem 0 0 0' }}>
              Censo digital de identidad, talentos, vestuario y procedencia — Cangallo Señorial
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={copyPublicLink}
              style={{
                background: copied ? '#059669' : '#FEF3C7',
                color: copied ? '#FFFFFF' : '#92400E',
                border: 'none',
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {copied ? '✓ ¡Enlace Copiado!' : '🔗 Copiar Link de Empadronamiento'}
            </button>

            <a
              href="/api/reportes/padron/export"
              download
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '0.65rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              📥 Descargar Backup en Excel (.xlsx)
            </a>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3.5px solid #13603A', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#13603A' }}>{stats.total}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Empadronados</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3.5px solid #D99B00', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D99B00' }}>{stats.danzantes}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>💃 Danzantes / Bailarines</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3.5px solid #2563EB', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563EB' }}>{stats.musicos}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>🎺 Músicos de Banda</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3.5px solid #B71C1C', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B71C1C' }}>{stats.directivos}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>👑 Directiva & Delegados</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
          
          {/* Buscador de Texto */}
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, DNI, celular, distrito o talento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.9rem',
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none' }}
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none' }}
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none' }}
            >
              <option value="ALL">Todos los Distritos</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Mostrando <strong>{filteredMembers.length}</strong> de <strong>{members.length}</strong> integrantes registrados</span>
          {(search || roleFilter !== 'ALL' || talentFilter !== 'ALL' || districtFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setRoleFilter('ALL'); setTalentFilter('ALL'); setDistrictFilter('ALL'); }}
              style={{ background: 'none', border: 'none', color: '#B71C1C', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Limpiar Filtros ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabla del Padrón */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#0E472A', color: '#FFFFFF', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>Socio / Identidad</th>
                <th style={{ padding: '12px 14px' }}>DNI</th>
                <th style={{ padding: '12px 14px' }}>Contacto WhatsApp</th>
                <th style={{ padding: '12px 14px' }}>Rol / Membresía</th>
                <th style={{ padding: '12px 14px' }}>Talentos & Arte</th>
                <th style={{ padding: '12px 14px' }}>Talla</th>
                <th style={{ padding: '12px 14px' }}>Procedencia</th>
                <th style={{ padding: '12px 14px' }}>Familiares</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>
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
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #13603A' }}
                      />
                      <div>
                        <strong style={{ color: '#111827', display: 'block', fontSize: '0.92rem' }}>{m.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          Afiliado: {m.affiliationYear || '2027'} &bull; {m.gender === 'MUJER' ? 'Mujer' : 'Varón'}
                        </span>
                      </div>
                    </td>

                    {/* DNI & Código de Socio */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#13603A', fontSize: '0.92rem', letterSpacing: '0.5px' }}>
                        {m.dni || '—'}
                      </div>
                      <span style={{ display: 'inline-block', fontSize: '0.75rem', color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 7px', borderRadius: '6px', fontWeight: 800, marginTop: '2px' }}>
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
                          style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          📱 {m.phone}
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
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#DBEAFE' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#FEE2E2' : '#D1FAE5',
                        color: m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '#1E40AF' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '#991B1B' : '#065F46'
                      }}>
                        {m.memberType === 'MUSICO' || m.role === 'MUSICIAN' ? '🎺 Músico' : m.memberType === 'DIRECTIVO' || m.role === 'ADMIN' ? '👑 Directiva' : '💃 Danzante'}
                      </span>
                    </td>

                    {/* Talentos */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#111827', fontWeight: 600 }}>
                        {m.talents || 'Danza'}
                      </div>
                      {m.musicalInstrument && (
                        <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700, display: 'block' }}>
                          Instrumento: {m.musicalInstrument}
                        </span>
                      )}
                    </td>

                    {/* Talla */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.8rem' }}>
                        {m.clothingSize || 'L'}
                      </span>
                    </td>

                    {/* Procedencia */}
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#4B5563' }}>
                      {m.district ? `${m.district} (${m.department || 'Ayacucho'})` : m.department || 'Ayacucho'}
                    </td>

                    {/* Familiares */}
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem' }}>
                      {m.hasRelatives ? (
                        <span title={m.relativesDetail || 'Tiene familiares'} style={{ color: '#13603A', fontWeight: 700 }}>
                          👨‍👩‍👧‍👦 {m.relativesDetail ? m.relativesDetail.slice(0, 22) + '...' : 'Sí'}
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>No</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
