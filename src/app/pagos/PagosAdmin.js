'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PagosAdmin({ fees = [], records = [] }) {
  const [paymentRecords, setPaymentRecords] = useState(records);
  const [paymentFees, setPaymentFees] = useState(fees);
  const [filterStatus, setFilterStatus] = useState('VALIDATING'); // 'VALIDATING' | 'PAID' | 'DELIVERED' | 'ALL'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Publicar Nuevo Producto o Aporte
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [modalMode, setModalMode] = useState('VESTUARIO'); // 'VESTUARIO' | 'APORTE'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('60.00');
  const [category, setCategory] = useState('VESTUARIO');
  const [targetGender, setTargetGender] = useState('ALL'); // 'ALL' | 'VARON' | 'MUJER'
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [stock, setStock] = useState('50');
  const [feeLoading, setFeeLoading] = useState(false);

  // Modal Ver Voucher HD
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handleOpenCreateModal = (mode) => {
    setModalMode(mode);
    if (mode === 'VESTUARIO') {
      setTitle('');
      setAmount('60.00');
      setCategory('VESTUARIO');
      setTargetGender('ALL');
      setSizes('S, M, L, XL');
      setStock('50');
    } else {
      setTitle('Cuota Mensual de Ensayo Febrero');
      setAmount('50.00');
      setCategory('CUOTA');
      setTargetGender('ALL');
      setSizes('Única');
      setStock('999');
    }
    setShowFeeModal(true);
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setFeeLoading(true);

    try {
      const res = await fetch('/api/pagos/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          amount, 
          category,
          targetGender,
          gender: targetGender,
          sizes: modalMode === 'VESTUARIO' ? sizes : 'Única',
          availableSizes: modalMode === 'VESTUARIO' ? sizes : 'Única',
          stock: modalMode === 'VESTUARIO' ? stock : 999
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(`¡${modalMode === 'VESTUARIO' ? 'Prenda' : 'Aporte'} "${title}" publicado exitosamente!`);
        window.location.reload();
      } else {
        alert(data.error || 'Error al publicar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setFeeLoading(false);
    }
  };

  const handleDeleteFee = async (feeId, feeTitle) => {
    if (!confirm(`¿Eliminar "${feeTitle}" del catálogo?`)) return;

    try {
      const res = await fetch(`/api/pagos/cuotas?id=${feeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentFees(prev => prev.filter(f => f.id !== feeId));
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleValidationAction = async (recordId, action) => {
    setLoadingId(recordId);
    try {
      const res = await fetch('/api/pagos/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, action })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...data.record } : r));
      } else {
        alert(data.error || 'Error al procesar validación');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoadingId(null);
    }
  };

  const getGenderBadge = (g) => {
    const gender = (g || 'UNISEX').toUpperCase();
    if (gender === 'VARON') return { label: '👨 Varones', bg: '#DBEAFE', color: '#1E40AF' };
    if (gender === 'MUJER') return { label: '👩 Mujeres', bg: '#FCE7F3', color: '#9D174D' };
    return { label: '👫 Unisex', bg: '#E2E8F0', color: '#334155' };
  };

  // Contadores de Estado
  const countValidating = paymentRecords.filter(r => r.status === 'VALIDATING' || r.status === 'PENDING').length;
  const countPaid = paymentRecords.filter(r => r.status === 'PAID' || r.status === 'APPROVED').length;
  const countDelivered = paymentRecords.filter(r => r.status === 'DELIVERED').length;

  // Filtrado por Pestaña de Estado + Buscador
  const filteredRecords = paymentRecords.filter(r => {
    // 1. Filtro por Pestaña
    let matchesTab = true;
    if (filterStatus === 'VALIDATING') matchesTab = (r.status === 'VALIDATING' || r.status === 'PENDING');
    else if (filterStatus === 'PAID') matchesTab = (r.status === 'PAID' || r.status === 'APPROVED');
    else if (filterStatus === 'DELIVERED') matchesTab = (r.status === 'DELIVERED');

    if (!matchesTab) return false;

    // 2. Filtro por Buscador
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const userName = (r.user?.name || '').toLowerCase();
    const userDni = (r.user?.dni || '').toLowerCase();
    const itemDetail = (r.itemsDetail || '').toLowerCase();

    return userName.includes(searchLower) || userDni.includes(searchLower) || itemDetail.includes(searchLower);
  });

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
          Tesorería & Entrega de Vestuario 🛍️
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleOpenCreateModal('VESTUARIO')} 
            className="btn btn-blue"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: '#2563EB', color: 'white' }}
          >
            👗 + Agregar Vestuario
          </button>
          <button 
            onClick={() => handleOpenCreateModal('APORTE')} 
            className="btn btn-gold"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            💰 + Crear Aporte
          </button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA INSTANTÁNEA */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre del socio, DNI o vestuario/aporte..."
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

      {/* Alerta de Pedidos y Vouchers por Validar */}
      {countValidating > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderRadius: '14px',
          border: '1px solid #FDE68A',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>
              🟡 Tienes {countValidating} comprobante(s) o pedido(s) pendiente(s) de revisión
            </strong>
            <p style={{ margin: '0.2rem 0 0', color: '#B45309', fontSize: '0.82rem' }}>
              Revisa los comprobantes adjuntos para aprobar los aportes o autorizar la entrega de vestuario.
            </p>
          </div>
          <button 
            onClick={() => setFilterStatus('VALIDATING')}
            className="btn btn-gold"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            Revisar Ahora ➔
          </button>
        </div>
      )}

      {/* PESTAÑAS DE ESTADO CON CONTADORES DINÁMICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilterStatus('VALIDATING')}
          style={{
            borderRadius: '14px',
            padding: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: filterStatus === 'VALIDATING' ? '2px solid #D97706' : '1px solid var(--glass-border)',
            background: filterStatus === 'VALIDATING' ? '#FEF3C7' : '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: '#D97706' }}>{countValidating}</span>
          <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700 }}>Por Validar</span>
        </button>

        <button
          onClick={() => setFilterStatus('PAID')}
          style={{
            borderRadius: '14px',
            padding: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: filterStatus === 'PAID' ? '2px solid #059669' : '1px solid var(--glass-border)',
            background: filterStatus === 'PAID' ? '#D1FAE5' : '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: '#059669' }}>{countPaid}</span>
          <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>Aprobados</span>
        </button>

        <button
          onClick={() => setFilterStatus('DELIVERED')}
          style={{
            borderRadius: '14px',
            padding: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: filterStatus === 'DELIVERED' ? '2px solid #2563EB' : '1px solid var(--glass-border)',
            background: filterStatus === 'DELIVERED' ? '#DBEAFE' : '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: '#2563EB' }}>{countDelivered}</span>
          <span style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>Entregados</span>
        </button>

        <button
          onClick={() => setFilterStatus('ALL')}
          style={{
            borderRadius: '14px',
            padding: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: filterStatus === 'ALL' ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
            background: filterStatus === 'ALL' ? '#F8FAFC' : '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: 'var(--text-primary)' }}>{paymentRecords.length}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Todos</span>
        </button>
      </div>

      {/* Catálogo de Vestuario y Aportes Activos */}
      {paymentFees.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FFFFFF' }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>
            🏷️ ELEMENTOS PUBLICADOS EN EL CATÁLOGO:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {paymentFees.map(f => {
              const isVestuario = f.category === 'VESTUARIO' || f.category === 'ACCESORIOS';
              const genderBadge = getGenderBadge(f.gender || f.targetGender);
              const rawSizes = f.availableSizes || f.sizes || 'S, M, L, XL';
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '6px', background: isVestuario ? '#EFF6FF' : '#FEF3C7', color: isVestuario ? '#1D4ED8' : '#92400E' }}>
                        {isVestuario ? '👗 VESTUARIO' : '💰 APORTE'}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{f.title}</strong>
                      {isVestuario && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '8px', background: genderBadge.bg, color: genderBadge.color }}>
                          {genderBadge.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <strong>Monto: S/ {f.amount.toFixed(2)}</strong> {isVestuario ? `• Tallas: ${rawSizes} • Stock: ${f.stock ?? 50}` : '• Aporte Oficial de Dinero'}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteFee(f.id, f.title)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LISTA ROBUSTA DE PEDIDOS Y APORTES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredRecords.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.35rem' }}>📋</span>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>No hay comprobantes en esta sección.</p>
          </div>
        )}

        {filteredRecords.map(r => {
          const userName = r.user?.name || 'Socio Registrado';
          const userDni = r.user?.dni || 'Sin DNI';
          const userPhone = r.user?.phone || 'Sin tel';
          
          const isPaid = r.status === 'PAID' || r.status === 'APPROVED';
          const isDelivered = r.status === 'DELIVERED';
          const isValidating = r.status === 'VALIDATING' || r.status === 'PENDING';
          const isVestuario = (r.itemsDetail || '').toLowerCase().includes('vestuario') || (r.itemsDetail || '').toLowerCase().includes('camisa') || (r.itemsDetail || '').toLowerCase().includes('pollera') || (r.itemsDetail || '').toLowerCase().includes('sombrero') || (r.itemsDetail || '').toLowerCase().includes('faja') || r.fee?.category === 'VESTUARIO';
          const voucherUrl = r.receiptUrl || r.proofUrl;
          const amountVal = r.amount ?? r.totalAmount ?? (r.fee ? r.fee.amount : 0);

          return (
            <div key={r.id} className="glass-panel animate-fade-in" style={{ padding: '1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>{userName}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    🪪 DNI: {userDni} • 📞 {userPhone}
                  </span>
                  
                  <div style={{ marginTop: '0.5rem', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      DETALLE REGISTRADO:
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.15rem' }}>
                      {r.itemsDetail || (r.fee ? r.fee.title : 'Comprobante de Pago')}
                    </strong>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--color-asistencia)', marginTop: '0.2rem' }}>
                      Total: S/ {Number(amountVal).toFixed(2)}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '14px',
                  background: isDelivered ? '#EFF6FF' : isPaid ? '#D1FAE5' : isValidating ? '#FEF3C7' : '#FEE2E2',
                  color: isDelivered ? '#1D4ED8' : isPaid ? '#065F46' : isValidating ? '#92400E' : '#991B1B',
                  border: isDelivered ? '1px solid #BFDBFE' : isPaid ? '1px solid #A7F3D0' : isValidating ? '1px solid #FDE68A' : '1px solid #FECACA'
                }}>
                  {isDelivered ? '📦 ENTREGADO Y RECIBIDO' : isPaid ? '🟢 APROBADO (Pendiente Entrega)' : isValidating ? '🟡 POR VALIDAR' : '🔴 RECHAZADO'}
                </span>
              </div>

              {/* Fotografía del Voucher Yape */}
              {voucherUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', marginBottom: '0.85rem', border: '1px solid #E2E8F0' }}>
                  <img 
                    src={voucherUrl} 
                    alt="Voucher Yape" 
                    onClick={() => setSelectedProofUrl(voucherUrl)}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--color-aportes)' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Comprobante Yape/Plin enviado</strong>
                    <button 
                      onClick={() => setSelectedProofUrl(voucherUrl)}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: '0.2rem' }}
                    >
                      🔍 Ver voucher en HD
                    </button>
                  </div>
                </div>
              )}

              {/* Acciones de Aprobación y Entrega de Ropa */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {isValidating && (
                  <>
                    <button
                      onClick={() => handleValidationAction(r.id, 'APPROVE')}
                      disabled={loadingId === r.id}
                      className="btn btn-green"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', fontWeight: 700 }}
                    >
                      ✓ Aprobar Pago
                    </button>
                    <button
                      onClick={() => handleValidationAction(r.id, 'REJECT')}
                      disabled={loadingId === r.id}
                      className="btn"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', fontWeight: 700 }}
                    >
                      ✕ Rechazar
                    </button>
                  </>
                )}

                {isPaid && isVestuario && (
                  <button
                    onClick={() => handleValidationAction(r.id, 'DELIVER')}
                    disabled={loadingId === r.id}
                    className="btn btn-blue"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', background: '#2563EB', color: 'white', fontWeight: 700 }}
                  >
                    📦 Marcar Vestuario Entregado al Socio
                  </button>
                )}

                {isPaid && !isVestuario && (
                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
                    ✓ Cuota ingresada a caja de la comparsa
                  </span>
                )}

                {isDelivered && (
                  <span style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 700 }}>
                    ✓ Vestuario entregado conforme
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Crear Nuevo Elemento de Catálogo */}
      {showFeeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3000, padding: '1rem'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-playfair)' }}>
                {modalMode === 'VESTUARIO' ? '👗 Publicar Nueva Prenda' : '💰 Publicar Nueva Cuota'}
              </h3>
              <button onClick={() => setShowFeeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateFee}>
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Nombre del Producto o Cuota:</label>
                <input 
                  type="text" 
                  required 
                  placeholder={modalMode === 'VESTUARIO' ? 'Ej. Camisa Bordada Varón' : 'Ej. Aporte para Contrato de Banda'} 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Precio / Monto (S/):</label>
                <input 
                  type="number" 
                  step="0.50" 
                  required 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }} 
                />
              </div>

              {modalMode === 'VESTUARIO' && (
                <>
                  <div style={{ marginBottom: '0.9rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Dirigido a:</label>
                    <select 
                      value={targetGender} 
                      onChange={e => setTargetGender(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: 'white' }}
                    >
                      <option value="ALL">👫 Todos / Unisex</option>
                      <option value="VARON">👨 Solo Varones</option>
                      <option value="MUJER">👩 Solo Mujeres</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.9rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Tallas Disponibles (separadas por coma):</label>
                    <input 
                      type="text" 
                      value={sizes} 
                      onChange={e => setSizes(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Stock Inicial:</label>
                    <input 
                      type="number" 
                      value={stock} 
                      onChange={e => setStock(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }} 
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={feeLoading} 
                className={modalMode === 'VESTUARIO' ? 'btn btn-blue' : 'btn btn-gold'} 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' }}
              >
                {feeLoading ? 'Publicando...' : 'Publicar en la Tienda 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Voucher */}
      {selectedProofUrl && (
        <div 
          onClick={() => setSelectedProofUrl(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 4000, padding: '1rem', cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={selectedProofUrl} alt="Voucher HD" style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px' }} />
            <p style={{ color: 'white', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.9rem' }}>✕ Toca para cerrar</p>
          </div>
        </div>
      )}

    </div>
  );
}
