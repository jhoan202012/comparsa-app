'use client';

import { useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import LogoutButton from '@/components/LogoutButton';
import { 
  IconInbox,
  IconCheckCircle,
  IconUsers,
  IconShirt,
  IconWallet,
  IconQrCode,
  IconCamera,
  IconPackage,
  IconChartBar,
  IconFileSpreadsheet
} from '@/components/Icons';

export default function ManualClient({ currentUser }) {
  const [activeRole, setActiveRole] = useState(currentUser?.role === 'ADMIN' ? 'ADMIN' : 'MEMBER');
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState('INTERACTIVE'); // 'INTERACTIVE' o 'FULL'

  // Pasos para Integrantes y Músicos (Iconos vectoriales 100% limpios sin emojis)
  const memberSteps = [
    {
      stepNum: "Paso 1",
      title: "Ingreso a la Plataforma",
      iconType: "USERS",
      color: "#13603A",
      bg: "#ECFDF5",
      badge: "ACCESO FÁCIL Y RÁPIDO",
      summary: "Ingresa con tu DNI y tu PIN de 4 dígitos (PIN por defecto: 1234).",
      details: [
        "Abre la dirección web de la comparsa en tu celular.",
        "Ingresa tu número de DNI o celular y tu PIN 1234.",
        "En los ensayaderos puedes presionar '¿En ensayo? Selecciona tu perfil rápido aquí' para ingresar con un solo toque."
      ],
      image: "/images/cangallo_4.jpg",
      actionText: "Ir a Pantalla de Ingreso",
      actionUrl: "/login"
    },
    {
      stepNum: "Paso 2",
      title: "Tu Carnet QR de Asistencia",
      iconType: "QR",
      color: "#2563EB",
      bg: "#DBEAFE",
      badge: "ASISTENCIA EN ENSAYOS",
      summary: "Muestra tu código QR en el celular para que la directiva escanee tu asistencia.",
      details: [
        "Toca el botón verde 'Mostrar mi Código QR' en tu pantalla principal.",
        "Aparecerá tu Carnet Digital con tu foto y código QR único.",
        "Muéstrale tu celular al encargado en el ensayo para registrar tu asistencia presencial al instante."
      ],
      image: "/images/cangallo_1.jpg",
      actionText: "Ver mi Carnet QR",
      actionUrl: "/qr"
    },
    {
      stepNum: "Paso 3",
      title: "Pedido de Vestuario por Talla",
      iconType: "SHIRT",
      color: "#B45309",
      bg: "#FEF3C7",
      badge: "TALLAS S, M, L, XL",
      summary: "Pide tus polleras, camisas y trajes filtrando por género y eligiendo tu talla exacta.",
      details: [
        "Ingresa a 'Mis Pagos' y presiona la pestaña 'Pedir Vestuario'.",
        "Selecciona si buscas ropa de Varón, Mujer o Unisex.",
        "Elige tu Talla (S, M, L, XL), realiza la transferencia Yape y sube la captura de pantalla de tu comprobante.",
        "Cuando el taller entregue tu ropa, tu estado cambiará a ENTREGADO Y RECIBIDO."
      ],
      image: "/images/cangallo_2.jpg",
      actionText: "Ir a Tienda de Vestuario",
      actionUrl: "/pagos"
    },
    {
      stepNum: "Paso 4",
      title: "Registro de Aportes Monetarios",
      iconType: "WALLET",
      color: "#059669",
      bg: "#D1FAE5",
      badge: "ENSAYOS, BANDA Y PASAJES",
      summary: "Cancela tus cuotas monetarias de forma transparente sin pedir tallas.",
      details: [
        "En la pestaña 'Pagar Aporte', selecciona la cuota a cancelar (Cuota de Ensayo, Banda, Pasajes).",
        "Adjunta la foto de tu Yape/Plin y confirma el envío.",
        "El tesorero revisará y aprobará tu comprobante en tiempo real."
      ],
      image: "/images/imagen_3.jpg",
      actionText: "Ver mis Aportes",
      actionUrl: "/pagos"
    },
    {
      stepNum: "Paso 5",
      title: "Buzón Directivo (Oficial o Anónimo)",
      iconType: "INBOX",
      color: "#7C3AED",
      bg: "#F3E8FF",
      badge: "100% CONFIDENCIAL O CON NOMBRE",
      summary: "Envía tus opiniones, sugerencias o reclamos directamente a la directiva.",
      details: [
        "Entra a 'Buzón' desde el menú inferior.",
        "Elige si es una Sugerencia, Reclamo o Consulta.",
        "Si prefieres opinar en privado sin revelar tu identidad, marca la casilla 'Enviar como Anónimo'."
      ],
      image: "/images/Logo_1.jpg",
      actionText: "Ir al Buzón Directivo",
      actionUrl: "/buzon"
    }
  ];

  // Pasos para Administradores y Junta Directiva
  const adminSteps = [
    {
      stepNum: "Paso 1",
      title: "Escáner HD de Cámara para Asistencia",
      iconType: "CAMERA",
      color: "#13603A",
      bg: "#ECFDF5",
      badge: "CONTROL PRESENCIAL EN VIVO",
      summary: "Registra asistencias en los ensayos usando la cámara de tu celular.",
      details: [
        "Entra a 'Escáner' en el menú inferior y permite el acceso a la cámara.",
        "Apunta la cámara al Carnet QR del bailarín.",
        "El sistema confirmará el registro con un sonido y notificación verde de asistencia."
      ],
      image: "/images/cangallo_1.jpg",
      actionText: "Abrir Escáner de Cámara",
      actionUrl: "/escaner"
    },
    {
      stepNum: "Paso 2",
      title: "Aprobación Yape & Publicación de Cuotas",
      iconType: "WALLET",
      color: "#B45309",
      bg: "#FEF3C7",
      badge: "TESORERÍA Y CATÁLOGO",
      summary: "Publica prendas con tallas y valida comprobantes de pago en HD.",
      details: [
        "Presiona '+ Agregar Vestuario' para publicar prendas con tallas (S, M, L, XL), stock y género.",
        "Presiona '+ Crear Aporte' para publicar cuotas monetarias.",
        "Haz clic sobre los vouchers Yape para abrirlos en HD y presiona 'Aprobar' o 'Rechazar'."
      ],
      image: "/images/cangallo_5.jpg",
      actionText: "Ir a Validación de Pagos",
      actionUrl: "/pagos"
    },
    {
      stepNum: "Paso 3",
      title: "Control Logístico de Entrega Física",
      iconType: "PACKAGE",
      color: "#2563EB",
      bg: "#DBEAFE",
      badge: "MARCAR COMO ENTREGADO AL SOCIO",
      summary: "Lleva el control exacto de quién ya recogió su vestuario del taller.",
      details: [
        "Usa la barra de búsqueda instantánea para encontrar al socio por nombre o DNI.",
        "Cuando recoja su ropa confeccionada, presiona el botón azul 'Marcar como ENTREGADO AL SOCIO'.",
        "Su solicitud cambiará a 'ENTREGADO Y RECIBIDO', evitando reclamos duplicados."
      ],
      image: "/images/cangallo_2.jpg",
      actionText: "Ver Control de Vestuario",
      actionUrl: "/pagos"
    },
    {
      stepNum: "Paso 4",
      title: "Reportería en 3 Slides Exportable a Excel",
      iconType: "CHART",
      color: "#059669",
      bg: "#D1FAE5",
      badge: "REPORTES .XLSX OFICIALES",
      summary: "Genera y descarga planillas Excel para el taller, asamblea y tesorería.",
      details: [
        "Entra a 'Reportes' y navega por los 3 slides independientes.",
        "Slide 1 (Asistencias): Planilla de puntualidad e inasistencias en Excel.",
        "Slide 2 (Vestuario): Conteo exacto de prendas solicitadas por talla para enviar al taller de confección.",
        "Slide 3 (Tesorería): Balance contable de dinero recaudado en Soles."
      ],
      image: "/images/cangallo_4.jpg",
      actionText: "Ver Centro de Reportes",
      actionUrl: "/reportes"
    },
    {
      stepNum: "Paso 5",
      title: "Bandeja del Buzón Directivo",
      iconType: "INBOX",
      color: "#7C3AED",
      bg: "#F3E8FF",
      badge: "SUGERENCIAS Y RECLAMOS",
      summary: "Lee las inquietudes y propuestas de los bailarines y músicos.",
      details: [
        "Entra a 'Buzón' para ver las opiniones clasificadas por Sugerencia, Reclamo o Consulta.",
        "Filtra mensajes identificados o enviados en modo 'Socio Anónimo'.",
        "Toma decisiones informadas para la comparsa en las asambleas."
      ],
      image: "/images/Logo_1.jpg",
      actionText: "Leer Buzón Directivo",
      actionUrl: "/buzon"
    }
  ];

  const currentSteps = activeRole === 'ADMIN' ? adminSteps : memberSteps;
  const step = currentSteps[activeStep] || currentSteps[0];

  const renderIcon = (type, color = "#FFF", size = 20) => {
    switch (type) {
      case 'USERS': return <IconUsers size={size} color={color} />;
      case 'QR': return <IconQrCode size={size} color={color} />;
      case 'SHIRT': return <IconShirt size={size} color={color} />;
      case 'WALLET': return <IconWallet size={size} color={color} />;
      case 'INBOX': return <IconInbox size={size} color={color} />;
      case 'CAMERA': return <IconCamera size={size} color={color} />;
      case 'PACKAGE': return <IconPackage size={size} color={color} />;
      case 'CHART': return <IconChartBar size={size} color={color} />;
      default: return <IconCheckCircle size={size} color={color} />;
    }
  };

  const handlePrint = () => {
    setViewMode('FULL');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F0EA', paddingBottom: '90px' }}>
      
      {/* Estilos CSS de Impresión Optimizado al 100% de la Hoja */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          html, body, div, main, .manual-main-wrapper { 
            background: #FFFFFF !important; 
            background-color: #FFFFFF !important;
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            color: #000 !important;
          }
          header, nav, .no-print, button, [role="button"], .dash-header, footer { 
            display: none !important; 
          }
          .print-full-flow { 
            display: flex !important; 
            flex-direction: column !important; 
            gap: 2rem !important; 
            width: 100% !important; 
            background: #FFFFFF !important;
          }
          .print-cover-page { 
            page-break-after: always; 
            border: 3px solid #D99B00 !important; 
            padding: 3rem 2rem !important; 
            box-shadow: none !important; 
            background: #FFF !important;
            min-height: 88vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .step-print-card { 
            page-break-inside: avoid; 
            border: 1.5px solid #CBD5E1 !important; 
            box-shadow: none !important; 
            margin-bottom: 1.5rem !important; 
            width: 100% !important;
            background: #FFF !important;
            display: grid !important;
            grid-template-columns: 1fr 280px !important;
            min-height: 320px !important;
          }
        }
      `}</style>

      {/* Header Superior Vectorial Limpio */}
      <header className="dash-header no-print" style={{ maxWidth: '1140px', margin: '0 auto 1.5rem', padding: '1rem 1.5rem' }}>
        <div className="dash-logo">
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #D99B00',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            flexShrink: 0,
            background: '#FFF'
          }}>
            <img src="/images/Logo_1.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <span className="dash-logo-title">GUÍA ILUSTRADA DE USO</span>
            <span className="dash-logo-year">CANGALLO SEÑORIAL 2027</span>
          </div>
        </div>

        <div className="dash-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--color-asistencia)', fontWeight: 700, textDecoration: 'none' }}>
            ← Ir al Inicio
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Control de Modo e Impresión Vectorial */}
        <div className="no-print" style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.25rem',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', fontFamily: 'var(--font-playfair)' }}>
                {activeRole === 'ADMIN' ? 'Manual de la Junta Directiva' : 'Manual de Integrantes & Músicos'}
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Selecciona tu perfil o exporta directamente en PDF.
              </span>
            </div>

            {/* Botón Imprimir PDF limpio */}
            <button
              onClick={handlePrint}
              style={{
                background: '#B45309',
                color: '#FFF',
                padding: '0.65rem 1.25rem',
                borderRadius: '14px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <IconFileSpreadsheet size={18} color="#FFF" />
              Guardar o Imprimir como PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={() => { setActiveRole('MEMBER'); setActiveStep(0); }}
              style={{
                padding: '0.75rem',
                borderRadius: '14px',
                border: activeRole === 'MEMBER' ? '2px solid #13603A' : '1.5px solid #CBD5E1',
                background: activeRole === 'MEMBER' ? '#ECFDF5' : '#FFF',
                color: activeRole === 'MEMBER' ? '#13603A' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.5rem'
              }}
            >
              <IconUsers size={18} color={activeRole === 'MEMBER' ? '#13603A' : '#6B7280'} />
              Guía Integrantes & Músicos
            </button>

            <button
              onClick={() => { setActiveRole('ADMIN'); setActiveStep(0); }}
              style={{
                padding: '0.75rem',
                borderRadius: '14px',
                border: activeRole === 'ADMIN' ? '2px solid #B45309' : '1.5px solid #CBD5E1',
                background: activeRole === 'ADMIN' ? '#FEF3C7' : '#FFF',
                color: activeRole === 'ADMIN' ? '#B45309' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.5rem'
              }}
            >
              <IconChartBar size={18} color={activeRole === 'ADMIN' ? '#B45309' : '#6B7280'} />
              Guía Junta Directiva (Admin)
            </button>
          </div>

          {/* Toggle Modo Interactivo vs Completo Desplegado */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.4rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setViewMode('INTERACTIVE')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: viewMode === 'INTERACTIVE' ? '1.5px solid var(--color-asistencia)' : 'none',
                background: viewMode === 'INTERACTIVE' ? '#FFF' : 'transparent',
                color: viewMode === 'INTERACTIVE' ? 'var(--color-asistencia)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Vista Paso a Paso (Interactiva)
            </button>

            <button
              onClick={() => setViewMode('FULL')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: viewMode === 'FULL' ? '1.5px solid var(--color-asistencia)' : 'none',
                background: viewMode === 'FULL' ? '#FFF' : 'transparent',
                color: viewMode === 'FULL' ? 'var(--color-asistencia)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Vista Completa Desplegada (Para Imprimir / PDF)
            </button>
          </div>

        </div>

        {/* MODALIDAD 1: VISTA INTERACTIVA PASO A PASO CON ICONOS VECTORIALES */}
        {viewMode === 'INTERACTIVE' && (
          <div>
            
            {/* Stepper Navegación Vectorial */}
            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              {currentSteps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: activeStep === idx ? `2px solid ${s.color}` : '1.5px solid #CBD5E1',
                    background: activeStep === idx ? s.bg : '#FFF',
                    color: activeStep === idx ? s.color : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {renderIcon(s.iconType, activeStep === idx ? s.color : '#6B7280', 16)}
                  {s.stepNum}: {s.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Tarjeta de Demostración Visual */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '440px'
            }}>
              
              {/* Lado Izquierdo: Explicación */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.35rem', borderRadius: '8px', background: step.bg, color: step.color, display: 'flex' }}>
                      {renderIcon(step.iconType, step.color, 20)}
                    </div>
                    <span style={{
                      background: step.bg,
                      color: step.color,
                      border: `1px solid ${step.color}40`,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {step.badge}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-playfair)', margin: '0 0 0.65rem', color: 'var(--text-primary)' }}>
                    {step.stepNum}: {step.title}
                  </h2>

                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                    "{step.summary}"
                  </p>

                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                      Instrucciones de Uso:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {step.details.map((d, i) => (
                        <li key={i} style={{ marginBottom: '0.35rem' }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón de Prueba en Vivo */}
                <Link 
                  href={step.actionUrl}
                  style={{
                    background: step.color,
                    color: '#FFF',
                    padding: '0.9rem 1.25rem',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {step.actionText} →
                </Link>
              </div>

              {/* Lado Derecho: Ilustración Oficial de la Comparsa */}
              <div style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
                <img 
                  src={step.image} 
                  alt={step.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                />
                
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #D99B00', flexShrink: 0 }}>
                    <img src="/images/Logo_1.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                      Comparsa Cangallo Señorial
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-asistencia)', fontWeight: 700 }}>
                      Carnaval Ayacuchano 2027
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Controles Stepper */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '14px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFF',
                  color: activeStep === 0 ? '#94A3B8' : 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: activeStep === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Paso Anterior
              </button>

              <span style={{ alignSelf: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Paso {activeStep + 1} de {currentSteps.length}
              </span>

              <button
                disabled={activeStep === currentSteps.length - 1}
                onClick={() => setActiveStep(prev => Math.min(currentSteps.length - 1, prev + 1))}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'var(--color-asistencia)',
                  color: '#FFF',
                  fontWeight: 700,
                  cursor: activeStep === currentSteps.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: activeStep === currentSteps.length - 1 ? 0.5 : 1
                }}
              >
                Siguiente Paso →
              </button>
            </div>

          </div>
        )}

        {/* MODALIDAD 2: VISTA COMPLETA DESPLEGADA VERTICAL PARA IMPRIMIR EN PDF CON CARÁTULA */}
        {viewMode === 'FULL' && (
          <div className="print-full-flow" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* CARÁTULA OFICIAL DE PORTADA */}
            <div className="print-cover-page" style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '2px solid #D99B00',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #D99B00',
                margin: '0 auto 1.25rem',
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                background: '#FFF'
              }}>
                <img src="/images/Logo_1.jpg" alt="Logo Cangallo Señorial" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              <span style={{
                background: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FCD34D',
                padding: '0.4rem 1.25rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '1px',
                display: 'inline-block',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                Carnaval Ayacuchano 2027 • Plataforma Oficial
              </span>

              <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-playfair)', margin: '0 0 0.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                MANUAL DE USUARIO & GUÍA OPERATIVA
              </h1>

              <h2 style={{ fontSize: '1.35rem', color: '#B45309', fontFamily: 'var(--font-playfair)', margin: '0 0 1.25rem', fontWeight: 700 }}>
                {activeRole === 'ADMIN' ? '👑 Guía para la Junta Directiva y Tesorería' : '💃 Guía de Uso para Integrantes y Músicos'}
              </h2>

              <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Instructivo ilustrado paso a paso con el funcionamiento oficial de Asistencias por QR, Tienda de Vestuario por Tallas, Aportes Monetarios, Reportería y Buzón Directivo.
              </p>

              <div style={{ width: '120px', height: '3px', background: '#D99B00', margin: '0 auto' }}></div>
            </div>

            {currentSteps.map((s, idx) => (
              <div 
                key={idx}
                className="step-print-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px'
                }}
              >
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.3rem', borderRadius: '6px', background: s.bg, color: s.color, display: 'flex' }}>
                      {renderIcon(s.iconType, s.color, 16)}
                    </div>
                    <span style={{
                      background: s.bg,
                      color: s.color,
                      border: `1px solid ${s.color}40`,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '14px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-playfair)', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                    {s.stepNum}: {s.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    "{s.summary}"
                  </p>

                  <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                      Instrucciones:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {s.details.map((d, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ position: 'relative', height: '100%', minHeight: '220px' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNav currentUser={currentUser} />
    </div>
  );
}
