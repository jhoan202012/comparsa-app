'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IconShirt, IconWallet, IconCheckCircle, IconPackage, IconSearch } from '@/components/Icons';

export default function PagosMiembro({ catalog = [], records = [] }) {
  const [paymentRecords, setPaymentRecords] = useState(records);

  // Modal Wizard: mode 'VESTUARIO' o 'APORTE'
  const [showOrderWizard, setShowOrderWizard] = useState(false);
  const [wizardMode, setWizardMode] = useState('VESTUARIO'); // 'VESTUARIO' | 'APORTE'
  const [wizardStep, setWizardStep] = useState(1); // 1: Selección, 2: Config/Detalles, 3: Yape & Voucher, 4: Éxito
  
  const [selectedGender, setSelectedGender] = useState('ALL'); // 'ALL' | 'VARON' | 'MUJER' | 'ACCESORIOS'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastCreatedRecord, setLastCreatedRecord] = useState(null);
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

  // Abrir Wizard para Vestuario
  const handleOpenVestuarioWizard = () => {
    setWizardMode('VESTUARIO');
    setShowOrderWizard(true);
    setWizardStep(1);
    setSelectedGender('ALL');
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity(1);
    setPreviewImage(null);
  };

  // Abrir Wizard para Aporte de Cuota
  const handleOpenAporteWizard = () => {
    setWizardMode('APORTE');
    setShowOrderWizard(true);
    setWizardStep(1);
    setSelectedProduct(null);
    setSelectedSize('Única');
    setQuantity(1);
    setPreviewImage(null);
  };

  // Seleccionar ítem en el Paso 1
  const handleSelectItem = (item) => {
    setSelectedProduct(item);
    if (wizardMode === 'VESTUARIO') {
      const rawSizes = item.availableSizes || item.sizes || 'S, M, L, XL';
      const availableSizes = rawSizes.split(',').map(s => s.trim());
      setSelectedSize(availableSizes[0] || 'Única');
      setQuantity(1);
      setWizardStep(2); // Pasar a elegir Talla
    } else {
      setSelectedSize('Única');
      setQuantity(1);
      setWizardStep(3); // Aporte salta directo al Pago Yape (Sin tallas)
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewImage(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!previewImage) {
      alert('Por favor adjunta la foto/captura de tu voucher de Yape o Plin');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = selectedProduct.amount * quantity;
      const sizeText = wizardMode === 'VESTUARIO' && selectedSize && selectedSize !== 'Única' ? ` (Talla: ${selectedSize})` : '';
      const quantityText = quantity > 1 ? ` x${quantity}` : '';
      const prefix = wizardMode === 'VESTUARIO' ? '👗 Vestuario: ' : '💰 Aporte: ';
      const itemsDetailText = `${prefix}${selectedProduct.title}${sizeText}${quantityText} - S/ ${totalAmount.toFixed(2)}`;

      const res = await fetch('/api/pagos/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemsDetail: itemsDetailText,
          totalAmount,
          proofUrl: previewImage,
          feeId: selectedProduct.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentRecords(prev => [data.record, ...prev]);
        setLastCreatedRecord(data.record);
        setWizardStep(4); // Paso 4: ¡Éxito!
      } else {
        alert(data.error || 'Error al procesar el envío');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al enviar el comprobante');
    } finally {
      setLoading(false);
    }
  };

  const getGenderBadge = (g) => {
    const gender = (g || 'UNISEX').toUpperCase();
    if (gender === 'VARON') return { label: '👨 Varones', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
    if (gender === 'MUJER') return { label: '👩 Mujeres', bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' };
    return { label: '👫 Unisex', bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
  };

  // Filtrar catálogo por Vestuario o Aporte
  const vestuarioItems = catalog.filter(item => item.category === 'VESTUARIO' || item.category === 'ACCESORIOS');
  const aporteItems = catalog.filter(item => item.category !== 'VESTUARIO' && item.category !== 'ACCESORIOS');

  const filteredVestuario = vestuarioItems.filter(item => {
    const itemGender = (item.gender || item.targetGender || 'UNISEX').toUpperCase();
    if (selectedGender === 'ALL') return true;
    if (selectedGender === 'VARON') return itemGender === 'VARON' || itemGender === 'UNISEX' || itemGender === 'ALL';
    if (selectedGender === 'MUJER') return itemGender === 'MUJER' || itemGender === 'UNISEX' || itemGender === 'ALL';
    if (selectedGender === 'ACCESORIOS') return item.category === 'ACCESORIOS';
    return true;
  });

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1.25rem', paddingBottom: '100px' }}>
      
      {/* Header Superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'var(--color-asistencia)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ← Volver al Inicio
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
            Pagos & Vestuario 🎭
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Comparsa Cangallo Señorial</span>
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* DOS BOTONES TOTALMENTE SEPARADOS: VESTUARIO VS APORTES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
        
        {/* BOTÓN 1: COMPRAR VESTUARIO & PRENDAS */}
        <div 
          className="glass-panel animate-fade-in" 
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
            borderRadius: '20px',
            border: '1px solid #BFDBFE',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#DBEAFE', color: '#1E40AF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
              <IconShirt size={24} color="#1E40AF" />
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#1E40AF', display: 'block' }}>Pedir Vestuario</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: '1rem' }}>
              Camisas, polleras, sombreros y fajas con tallas personalizadas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenVestuarioWizard}
            className="btn btn-blue"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: '12px',
              background: '#2563EB',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <IconShirt size={18} color="#FFF" />
            Pedir Vestuario →
          </button>
        </div>

        {/* BOTÓN 2: REALIZAR APORTE O CUOTA DE DINERO */}
        <div 
          className="glass-panel animate-fade-in" 
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F3E9 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(225, 177, 44, 0.4)',
            boxShadow: '0 4px 14px rgba(225, 177, 44, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
              <IconWallet size={24} color="#B45309" />
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#13603A', display: 'block' }}>Aportes & Cuotas</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: '1rem' }}>
              Paga tu cuota mensual de ensayo, aporte de banda o pasajes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAporteWizard}
            className="btn btn-gold"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(225, 177, 44, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <IconWallet size={18} color="#FFF" />
            Pagar Aporte →
          </button>
        </div>

      </div>

      {/* HISTORIAL LIMPIO Y ORGANIZADO */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.2px' }}>
            📋 MIS PEDIDOS Y COMPROBANTES REGISTRADOS ({paymentRecords.length})
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {paymentRecords.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem', background: '#FFFFFF', borderRadius: '16px' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>Sin comprobantes registrados aún</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Usa los botones superiores para pedir tu vestuario o pagar tus cuotas de la comparsa.
              </p>
            </div>
          )}

          {paymentRecords.map(r => {
            const voucherImg = r.receiptUrl || r.proofUrl;
            const amountVal = r.amount ?? r.totalAmount ?? (r.fee ? r.fee.amount : 0);

            return (
              <div 
                key={r.id} 
                className="glass-panel animate-fade-in" 
                style={{
                  padding: '1.25rem',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                      {r.itemsDetail || (r.fee ? r.fee.title : 'Comprobante de Pago')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'block' }}>
                      📅 Registrado: {new Date(r.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div style={{ fontSize: '1.35rem', fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--color-asistencia)', marginTop: '0.35rem' }}>
                      S/ {Number(amountVal).toFixed(2)}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    background: r.status === 'PAID' ? '#D1FAE5' : r.status === 'VALIDATING' ? '#FEF3C7' : '#FEE2E2',
                    color: r.status === 'PAID' ? '#065F46' : r.status === 'VALIDATING' ? '#92400E' : '#991B1B',
                    border: r.status === 'PAID' ? '1px solid #A7F3D0' : r.status === 'VALIDATING' ? '1px solid #FDE68A' : '1px solid #FECACA'
                  }}>
                    {r.status === 'PAID' ? '🟢 PAGADO & VALIDADO' : r.status === 'VALIDATING' ? '🟡 EN REVISIÓN' : r.status === 'REJECTED' ? '🔴 COMPROBANTE RECHAZADO' : '🔴 PENDIENTE'}
                  </span>
                </div>

                {r.status === 'VALIDATING' && (
                  <div style={{ padding: '0.75rem 0.9rem', background: '#FFFBEB', borderRadius: '12px', fontSize: '0.84rem', color: '#92400E', border: '1px solid #FEF3C7' }}>
                    🟡 Tu comprobante fue recibido. El Tesorero revisará la captura para validar la recepción de tu pago.
                  </div>
                )}

                {r.status === 'PAID' && (
                  <div style={{ padding: '0.75rem 0.9rem', background: '#F0FDF4', borderRadius: '12px', fontSize: '0.84rem', color: '#166534', fontWeight: 600, border: '1px solid #DCFCE7' }}>
                    ✓ ¡Pago verificado por Tesorería! Gracias por estar al día con la comparsa.
                  </div>
                )}

                {voucherImg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', marginTop: '0.85rem', border: '1px solid #E2E8F0' }}>
                    <img 
                      src={voucherImg} 
                      alt="Voucher Registrado" 
                      onClick={() => setSelectedProofUrl(voucherImg)}
                      style={{ width: '55px', height: '55px', borderRadius: '10px', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--color-aportes)' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Voucher Yape/Plin enviado</strong>
                      <button 
                        onClick={() => setSelectedProofUrl(voucherImg)}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: '0.15rem' }}
                      >
                        🔍 Ver voucher en HD
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL WIZARD SEPARADO PARA VESTUARIO O APORTES */}
      {showOrderWizard && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div 
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '85vh',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              overflowY: 'auto'
            }}
          >
            {/* Header del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{wizardMode === 'VESTUARIO' ? '👗' : '💰'}</span>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', margin: 0 }}>
                  {wizardMode === 'VESTUARIO' ? 'Catálogo de Vestuario' : 'Pagar Aporte o Cuota'}
                </h3>
              </div>

              <button 
                onClick={() => setShowOrderWizard(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
              >
                ✕
              </button>
            </div>

            {/* OPCIÓN A: WIZARD DE VESTUARIO (CON TALLAS Y GÉNERO) */}
            {wizardMode === 'VESTUARIO' && (
              <div>
                {/* Paso 1: Elegir Prenda */}
                {wizardStep === 1 && (
                  <div>
                    {/* Filtros de Género para Vestuario */}
                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedGender('ALL')}
                        style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: selectedGender === 'ALL' ? '#2563EB' : '#F1F5F9', color: selectedGender === 'ALL' ? 'white' : '#475569', border: 'none' }}
                      >
                        🌟 Todas las Prendas
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGender('VARON')}
                        style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: selectedGender === 'VARON' ? '#1D4ED8' : '#EFF6FF', color: selectedGender === 'VARON' ? 'white' : '#1D4ED8', border: 'none' }}
                      >
                        👨 Varones
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGender('MUJER')}
                        style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: selectedGender === 'MUJER' ? '#BE185D' : '#FDF2F8', color: selectedGender === 'MUJER' ? 'white' : '#BE185D', border: 'none' }}
                      >
                        👩 Mujeres
                      </button>
                    </div>

                    {/* Lista de Prendas de Vestuario */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '48vh', overflowY: 'auto' }}>
                      {filteredVestuario.map(item => {
                        const genderBadge = getGenderBadge(item.gender || item.targetGender);
                        const rawSizes = item.availableSizes || item.sizes || 'S, M, L, XL';
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            style={{
                              padding: '1rem',
                              borderRadius: '16px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</strong>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.08rem 0.4rem', borderRadius: '6px', background: genderBadge.bg, color: genderBadge.color }}>
                                  {genderBadge.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Tallas: <strong style={{ color: '#1E293B' }}>{rawSizes}</strong>
                              </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', color: '#2563EB', display: 'block' }}>
                                S/ {item.amount.toFixed(2)}
                              </strong>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>Elegir Talla →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Paso 2: Elegir Talla */}
                {wizardStep === 2 && selectedProduct && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedProduct.title}</strong>
                      <button onClick={() => setWizardStep(1)} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                        ← Cambiar
                      </button>
                    </div>

                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Selecciona tu Talla:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {(selectedProduct.availableSizes || selectedProduct.sizes || 'S, M, L, XL').split(',').map(s => s.trim()).map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          style={{
                            padding: '0.65rem 0.4rem',
                            borderRadius: '10px',
                            border: selectedSize === sz ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: selectedSize === sz ? '#2563EB' : '#FFFFFF',
                            color: selectedSize === sz ? 'white' : '#1E293B',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Monto a Pagar:</span>
                      <strong style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#2563EB' }}>
                        S/ {selectedProduct.amount.toFixed(2)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="btn btn-blue"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px', background: '#2563EB', color: 'white' }}
                    >
                      Continuar al Pago Yape →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OPCIÓN B: WIZARD DE APORTES Y CUOTAS (SIN PEDIR TALLAS) */}
            {wizardMode === 'APORTE' && wizardStep === 1 && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Selecciona la cuota o aporte que deseas registrar:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '48vh', overflowY: 'auto' }}>
                  {aporteItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)', display: 'block' }}>{item.title}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Aporte Oficial de la Comparsa</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--font-playfair)', color: 'var(--color-asistencia)', display: 'block' }}>
                          S/ {item.amount.toFixed(2)}
                        </strong>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-asistencia)' }}>Pagar Aporte →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 3: PAGO YAPE & VOUCHER (COMÚN PARA AMBOS) */}
            {wizardStep === 3 && selectedProduct && (
              <div>
                <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '1.1rem', borderRadius: '16px', marginBottom: '1.25rem', textAlign: 'center', border: '1px solid #FCD34D' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E' }}>YAPEAR EL MONTO DE:</span>
                  <strong style={{ fontSize: '1.85rem', fontFamily: 'var(--font-playfair)', color: '#13603A', display: 'block', margin: '0.15rem 0' }}>
                    S/ {(selectedProduct.amount * quantity).toFixed(2)}
                  </strong>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', display: 'block' }}>📱 Yape / Plin: 999 999 999</span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Adjunta la captura del voucher:</label>
                  <input type="file" accept="image/*" id="wizard-voucher-input" onChange={handleFileSelect} style={{ display: 'none' }} />

                  {previewImage ? (
                    <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <img src={previewImage} alt="Voucher" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '8px', objectFit: 'contain', marginBottom: '0.5rem', border: '2px solid var(--color-asistencia)' }} />
                      <label htmlFor="wizard-voucher-input" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, cursor: 'pointer', display: 'block' }}>📷 Cambiar Captura</label>
                    </div>
                  ) : (
                    <label htmlFor="wizard-voucher-input" className="btn btn-gold" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.85rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '12px' }}>
                      📷 Adjuntar Captura de Yape / Plin
                    </label>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeOrder}
                  disabled={loading}
                  className="btn btn-green"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, borderRadius: '12px' }}
                >
                  {loading ? 'Enviando Comprobante...' : 'Finalizar y Enviar Comprobante 🚀'}
                </button>
              </div>
            )}

            {/* PASO 4: ¡ÉXITO! */}
            {wizardStep === 4 && lastCreatedRecord && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.35rem' }}>🎉</span>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--color-asistencia)', marginBottom: '0.25rem' }}>
                  ¡Comprobante Enviado a Tesorería!
                </h3>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '20px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-block', marginBottom: '1.15rem' }}>
                  🟡 Pendiente de Revisión por Tesorería
                </span>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                    {lastCreatedRecord.itemsDetail}
                  </strong>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--color-asistencia)', marginTop: '0.3rem' }}>
                    Total: S/ {Number(lastCreatedRecord.amount || lastCreatedRecord.totalAmount || 0).toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOrderWizard(false)}
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '12px' }}
                >
                  Cerrar y Ver mi Historial 📋
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal Zoom Voucher en HD */}
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
