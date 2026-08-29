'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PadronClient({ members = [] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [talentFilter, setTalentFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Estadísticas del Padrón
  const stats = useMemo(() => {
    const total = members.length;
    const danzantes = members.filter(m => (m.memberType === 'SOCIO' || m.role === 'MEMBER') && m.memberType !== 'MUSICO' && m.memberType !== 'DIRECTIVO').length;
    const musicos = members.filter(m => m.memberType === 'MUSICO' || m.role === 'MUSICIAN').length;
    const directivos = members.filter(m => m.memberType === 'DIRECTIVO' || m.role === 'ADMIN').length;
    
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
      
      {/* Cabecera & Acciones Principales (Google Stitch Andean Luxury Banner) */}
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

      {/* Tarjetas KPI de Resumen (Google Stitch Minimalist Elevation) */}
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
                outline: 'none',
                transition: 'border 0.2s ease'
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
          <span>Mostrando <strong>{filteredMembers.length}</strong> de <strong>{members.length}</strong> integrantes registrados</span>
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

      {/* Tabla del Padrón (Estilo Ledger Google Stitch) */}
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
                <th style={{ padding: '14px 16px' }}>Acción</th>
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

                    {/* Acción / Ver Carnet */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setSelectedMember(m)}
                        style={{
                          background: '#FAF7F2',
                          border: '1px solid #D99B00',
                          color: '#92400E',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        🪪 Carnet
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Vista Previa del Carnet Digital Oficial de cada Socio */}
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
              <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: '1.15', marginBottom: '0.85rem' }}>
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
