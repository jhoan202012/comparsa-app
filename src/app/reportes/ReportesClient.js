'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ReportesClient({ members = [], events = [], attendances = [], fees = [], payments = [] }) {
  // 3 Slides independientes: 'asistencia' | 'vestuario' | 'aportes'
  const [activeSlide, setActiveSlide] = useState('asistencia');
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

  // 2. Métricas de Pedidos de Vestuario
  const vestuarioOrders = payments.filter(p => p.itemsDetail || p.fee?.category === 'VESTUARIO' || p.fee?.category === 'ACCESORIOS');
  const totalPrendasPedidas = vestuarioOrders.length;
  const prendasPorValidar = vestuarioOrders.filter(p => p.status === 'VALIDATING').length;
  const prendasAprobadas = vestuarioOrders.filter(p => p.status === 'PAID' || p.status === 'APPROVED').length;

  // 3. Métricas de Tesorería & Aportes
  const approvedPayments = payments.filter(p => p.status === 'PAID' || p.status === 'APPROVED');
  const totalRecaudadoAprobado = approvedPayments.reduce((sum, p) => sum + (p.totalAmount || (p.fee?.amount || 50)), 0);
  const sociosAlDia = members.filter(m => approvedPayments.some(p => p.userId === m.id)).length;

  const filteredMembers = members.filter(m => 
    m.name ? m.name.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-asistencia)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
          ← Volver al Inicio
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
          Centro de Reportería & Balances 📊
        </h2>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* NAVEGACIÓN ENTRE LOS 3 SLIDES DE REPORTES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        background: '#FFFFFF',
        padding: '0.35rem',
        borderRadius: '16px',
        marginBottom: '1.75rem',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <button
          type="button"
          onClick={() => setActiveSlide('asistencia')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSlide === 'asistencia' ? 'var(--color-asistencia)' : 'transparent',
            color: activeSlide === 'asistencia' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <span>👥</span> Slide 1: Asistencia
        </button>

        <button
          type="button"
          onClick={() => setActiveSlide('vestuario')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSlide === 'vestuario' ? '#3B82F6' : 'transparent',
            color: activeSlide === 'vestuario' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <span>🛍️</span> Slide 2: Vestuario
        </button>

        <button
          type="button"
          onClick={() => setActiveSlide('aportes')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSlide === 'aportes' ? 'var(--color-aportes)' : 'transparent',
            color: activeSlide === 'aportes' ? '#161B14' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <span>💰</span> Slide 3: Aportes
        </button>
      </div>

      {/* Buscador de Integrantes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre del integrante..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: '#FFFFFF',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {/* SLIDE 1: REPORTE DE ASISTENCIAS A ENSAYOS */}
      {activeSlide === 'asistencia' && (
        <div className="animate-fade-in">
          
          {/* Métricas de Asistencia */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{totalMembers}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Integrantes Totales</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6', display: 'block' }}>{avgAttendancePct}%</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>% Participación Promedio</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{totalEvents}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ensayos Realizados</span>
            </div>
          </div>

          {/* Botón de Exportación en Excel */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderLeft: '4px solid var(--color-asistencia)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
                  📊 REPORTE CONSOLIDADO DE ASISTENCIAS DE ENSAYOS
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Genera una hoja de cálculo completa con asistencias, faltas y tardanzas por socio.
                </span>
              </div>

              <a 
                href="/api/reportes/asistencia/export" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-green"
                style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                📥 Descargar Excel de Asistencias (.xlsx)
              </a>
            </div>
          </div>

          {/* Tabla de Asistencias por Integrante */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
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
                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
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
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: '#D97706' }}>
                        {lCount}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: pct >= 75 ? '#D1FAE5' : '#FEE2E2',
                          color: pct >= 75 ? '#065F46' : '#991B1B'
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
        </div>
      )}

      {/* SLIDE 2: REPORTE DE PEDIDOS DE VESTUARIO & PRENDAS */}
      {activeSlide === 'vestuario' && (
        <div className="animate-fade-in">
          
          {/* Métricas de Vestuario */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6', display: 'block' }}>{totalPrendasPedidas}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Solicitudes de Ropa</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-aportes)', display: 'block' }}>{prendasPorValidar}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pendientes de Revisión</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{prendasAprobadas}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Aprobadas para Entrega</span>
            </div>
          </div>

          {/* Botón de Exportación de Vestuario */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
                  🛍️ CONFECCIÓN & ENTREGA DE VESTUARIO DE COMPARSA
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Reporte listo con el conteo exacto de prendas solicitadas por talla para enviar al taller de confección.
                </span>
              </div>

              <a 
                href="/api/reportes/pagos/export" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-blue"
                style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.88rem', background: '#2563EB', color: 'white' }}
              >
                📥 Exportar Pedidos de Vestuario (.xlsx)
              </a>
            </div>
          </div>

          {/* Tabla de Pedidos de Vestuario */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Integrante</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Detalle de Prendas & Tallas</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'right' }}>Monto (S/)</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Estado Entrega</th>
                </tr>
              </thead>
              <tbody>
                {payments.filter(p => {
                  if (!searchTerm) return true;
                  const userName = p.user?.name || '';
                  return userName.toLowerCase().includes(searchTerm.toLowerCase());
                }).map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.user?.name || 'Socio'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>📞 {p.user?.phone || 'Sin tel'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#1E293B' }}>
                      {p.itemsDetail || (p.fee ? p.fee.title : 'Pedido de Ropa')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-asistencia)' }}>
                      S/ {(p.totalAmount || (p.fee ? p.fee.amount : 0)).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: p.status === 'DELIVERED' ? '#EFF6FF' : p.status === 'PAID' || p.status === 'APPROVED' ? '#D1FAE5' : '#FEF3C7',
                        color: p.status === 'DELIVERED' ? '#1D4ED8' : p.status === 'PAID' || p.status === 'APPROVED' ? '#065F46' : '#92400E'
                      }}>
                        {p.status === 'DELIVERED' ? '📦 ENTREGADO' : p.status === 'PAID' || p.status === 'APPROVED' ? '🟢 PENDIENTE RECOJO' : '🟡 POR VALIDAR'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLIDE 3: REPORTE DE APORTES & BALANCES DE TESORERÍA */}
      {activeSlide === 'aportes' && (
        <div className="animate-fade-in">
          
          {/* Métricas de Tesorería */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-aportes)', display: 'block' }}>S/ {totalRecaudadoAprobado.toFixed(2)}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Recaudado Aprobado</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-asistencia)', display: 'block' }}>{sociosAlDia}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Socios al Día</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626', display: 'block' }}>{totalMembers - sociosAlDia}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Socios Pendientes</span>
            </div>
          </div>

          {/* Botón de Exportación de Tesorería */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderLeft: '4px solid var(--color-aportes)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
                  💰 BALANCE CONSOLIDADO DE TESORERÍA PARA LA ASAMBLEA
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Genera el reporte financiero completo de ingresos y cuotas recaudadas para la directiva.
                </span>
              </div>

              <a 
                href="/api/reportes/pagos/export" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.88rem', background: 'var(--color-aportes)', color: '#161B14' }}
              >
                📥 Exportar Balance de Tesorería (.xlsx)
              </a>
            </div>
          </div>

          {/* Tabla de Aportes & Cuotas */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>Socio</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)' }}>DNI / Teléfono</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'right' }}>Monto Aportado</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Estado Financiero</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.filter(m => m.role === 'MEMBER').map(m => {
                  const userPayments = payments.filter(p => p.userId === m.id);
                  const isPaid = userPayments.some(p => p.status === 'PAID' || p.status === 'APPROVED');
                  const userTotalAmount = userPayments.reduce((sum, p) => sum + (p.totalAmount || 50), 0);

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{m.name}</strong>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                        🪪 {m.dni || 'Sin DNI'} • 📞 {m.phone || 'Sin tel'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-asistencia)' }}>
                        S/ {userTotalAmount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isPaid ? '#D1FAE5' : '#FEE2E2',
                          color: isPaid ? '#065F46' : '#991B1B'
                        }}>
                          {isPaid ? '🟢 AL DÍA' : '🔴 DEUDOR / PENDIENTE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
