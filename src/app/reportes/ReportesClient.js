'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ReportesClient({ members, events, attendances, fees, payments }) {
  const [activeTab, setActiveTab] = useState('asistencia'); // 'asistencia' | 'pagos'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Métricas de Asistencia
  const totalEvents = events.length || 1;
  const totalMembers = members.length;
  
  let totalAttendancesCount = 0;
  members.forEach(m => {
    const userAtts = attendances.filter(a => a.userId === m.id && (a.status === 'PRESENT' || a.status === 'LATE'));
    totalAttendancesCount += userAtts.length;
  });
  
  const avgAttendancePct = Math.round((totalAttendancesCount / (totalMembers * totalEvents)) * 100) || 0;

  // 2. Métricas de Tesorería
  const approvedPayments = payments.filter(p => p.status === 'PAID' || p.status === 'APPROVED');
  const totalRecaudado = approvedPayments.reduce((sum, p) => sum + (p.fee?.amount || 50), 0);
  const sociosAlDia = members.filter(m => {
    const userPaid = approvedPayments.some(p => p.userId === m.id);
    return userPaid;
  }).length;

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
          Reportes y Métricas 📊
        </h2>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Tarjetas de Métricas Generales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{totalMembers}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Integrantes Totales</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6', display: 'block' }}>{avgAttendancePct}%</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Asistencia Promedio</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-aportes)', display: 'block' }}>S/ {totalRecaudado.toFixed(2)}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Recaudado</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{sociosAlDia}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Socios al Día en Cuotas</span>
        </div>

      </div>

      {/* Botones Principales de Exportación a Excel */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-asistencia)' }}>
        <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          📥 DESCARGAR REPORTES EN EXCEL (.XLSX)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Haz clic en cualquier botón para generar y descargar el reporte consolidado listo para la directiva:
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href="/api/reportes/asistencia/export" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-green"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.65rem 1.25rem' }}
          >
            📊 Exportar Asistencias en Excel
          </a>

          <a 
            href="/api/reportes/pagos/export" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.65rem 1.25rem', background: 'var(--color-aportes)', color: '#161B14' }}
          >
            💰 Exportar Cuotas y Tesorería en Excel
          </a>
        </div>
      </div>

      {/* Pestañas de Vista Previa */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('asistencia')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'asistencia' ? 'var(--color-asistencia)' : 'var(--bg-primary)',
            color: activeTab === 'asistencia' ? 'white' : 'var(--text-secondary)'
          }}
        >
          📋 Padrón de Asistencias
        </button>

        <button
          onClick={() => setActiveTab('pagos')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'pagos' ? 'var(--color-aportes)' : 'var(--bg-primary)',
            color: activeTab === 'pagos' ? '#161B14' : 'var(--text-secondary)'
          }}
        >
          💳 Padrón de Cuotas
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar integrante por nombre..." 
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
            outline: 'none'
          }}
        />
      </div>

      {/* TABLA 1: ASISTENCIAS */}
      {activeTab === 'asistencia' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Integrante</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Rol</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Presentes</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Tardanzas</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>% Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const userAtts = attendances.filter(a => a.userId === m.id);
                const pCount = userAtts.filter(a => a.status === 'PRESENT').length;
                const lCount = userAtts.filter(a => a.status === 'LATE').length;
                const pct = Math.round(((pCount + lCount) / totalEvents) * 100);

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img 
                          src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                          alt={m.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <strong style={{ color: 'var(--text-primary)' }}>{m.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {m.role === 'MUSICIAN' ? 'Músico' : 'Socio'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-asistencia)' }}>
                      {pCount}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-aportes)' }}>
                      {lCount}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: pct >= 75 ? 'rgba(19, 96, 58, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: pct >= 75 ? 'var(--color-asistencia)' : 'red'
                      }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLA 2: CUOTAS */}
      {activeTab === 'pagos' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Socio</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Cuota Febrero</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.filter(m => m.role === 'MEMBER').map(m => {
                const userPayment = payments.find(p => p.userId === m.id);
                const isPaid = userPayment?.status === 'PAID' || userPayment?.status === 'APPROVED';
                const isValidating = userPayment?.status === 'VALIDATING';

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img 
                          src={m.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                          alt={m.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <strong style={{ color: 'var(--text-primary)' }}>{m.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      S/ 50.00
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isPaid ? 'var(--color-asistencia)' : isValidating ? 'var(--color-aportes)' : 'rgba(239, 68, 68, 0.15)',
                        color: isPaid ? 'white' : isValidating ? '#161B14' : 'red'
                      }}>
                        {isPaid ? '✓ APROBADO' : isValidating ? '⏱ EN REVISIÓN' : '❌ PENDIENTE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
