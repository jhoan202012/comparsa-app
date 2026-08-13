'use client';
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';

export default function QRScannerClient({ members, events: initialEvents = [], initialActiveEvent, activeAttendances }) {
  const [eventsList, setEventsList] = useState(initialEvents || []);
  const [selectedEventId, setSelectedEventId] = useState(initialActiveEvent?.id || initialEvents[0]?.id || '');
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [attendances, setAttendances] = useState(activeAttendances || {});
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [refreshingEvents, setRefreshingEvents] = useState(false);
  
  const isProcessing = useRef(false);
  const fileQrInputRef = useRef(null);
  const cameraDirectInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const selectedEventIdRef = useRef(selectedEventId);
  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  // Cargar lista fresca de eventos al entrar al escáner
  const fetchLatestEvents = async () => {
    setRefreshingEvents(true);
    try {
      const res = await fetch('/api/eventos');
      const data = await res.json();
      if (res.ok && data.events && data.events.length > 0) {
        setEventsList(data.events);
        // Si no hay evento seleccionado o el evento actual fue borrado, seleccionar el más reciente
        if (!selectedEventId || !data.events.some(ev => ev.id === selectedEventId)) {
          setSelectedEventId(data.events[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingEvents(false);
    }
  };

  useEffect(() => {
    fetchLatestEvents();
  }, []);

  // Al cambiar de evento en el desplegable, cargar las asistencias de ese evento
  useEffect(() => {
    if (!selectedEventId) return;
    async function loadEventAttendances() {
      try {
        const res = await fetch(`/api/asistencia/evento?eventId=${selectedEventId}`);
        const data = await res.json();
        if (res.ok && data.attendances) {
          setAttendances(data.attendances);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadEventAttendances();
  }, [selectedEventId]);

  // Procesar escaneo exitoso
  const onScanSuccess = async (decodedText) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const res = await fetch('/api/asistencia/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qr_code_hash: decodedText, 
          eventId: selectedEventIdRef.current,
          status: 'PRESENT' 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult(data);
        setErrorMsg(null);
        setAttendances(prev => ({
          ...prev,
          [data.user.id]: data.status
        }));
      } else {
        setErrorMsg(data.error || 'Código QR no reconocido');
        setScanResult(null);
      }
    } catch (err) {
      setErrorMsg('Error de conexión al procesar el código');
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 2500);
    }
  };

  // Encender la cámara en vivo
  const startCameraStream = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    setTimeout(async () => {
      try {
        const readerElement = document.getElementById('reader');
        if (readerElement) {
          readerElement.innerHTML = '';
        }

        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (e) {
            // Silencioso
          }
        }

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 230, height: 230 } 
          },
          onScanSuccess,
          () => {}
        );
      } catch (err) {
        console.error('Error al encender cámara:', err);
        setIsCameraActive(false);
        setCameraError('No se pudo abrir la cámara. Revisa que hayas concedido el permiso de cámara en tu navegador.');
      }
    }, 100);
  };

  // Apagar la cámara de forma segura
  const stopCameraStream = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setIsCameraActive(false);
  };

  // Limpiar cámara al salir de la página
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Helper para normalizar y redimensionar fotos de cámaras de alta resolución (iPhone 12MP/48MP)
  const optimizeImageForQrScan = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const MAX_SIZE = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], 'optimized-qr.jpg', { type: 'image/jpeg' });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Escanear foto procesada o cámara nativa
  const handleScanImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedFile = await optimizeImageForQrScan(file);
      let decodedText = null;

      try {
        const html5QrcodeTemp = new Html5Qrcode("file-qr-temp");
        decodedText = await html5QrcodeTemp.scanFile(optimizedFile, true);
      } catch (err1) {
        const html5QrcodeTemp = new Html5Qrcode("file-qr-temp");
        decodedText = await html5QrcodeTemp.scanFile(file, true);
      }
      
      const res = await fetch('/api/asistencia/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qr_code_hash: decodedText, 
          eventId: selectedEventId,
          status: 'PRESENT' 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult(data);
        setErrorMsg(null);
        setAttendances(prev => ({
          ...prev,
          [data.user.id]: data.status
        }));
      } else {
        setErrorMsg(data.error || 'Código QR no reconocido en la imagen');
        setScanResult(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se detectó un código QR válido. Asegúrate de encuadrar bien el código QR de la pantalla.');
      setScanResult(null);
    }
  };

  const handleManualMark = async (userId, status) => {
    setLoadingId(userId);
    try {
      const res = await fetch('/api/asistencia/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventId: selectedEventId, status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAttendances(prev => ({
          ...prev,
          [userId]: status
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'MUSICIAN') return 'Músico de Banda';
    if (role === 'MEMBER') return 'Socio Activo';
    if (role === 'ADMIN') return 'Tesorero / Directiva';
    return 'Integrante';
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memberIds = new Set(members.map(m => m.id));
  const presentCount = Object.entries(attendances).filter(([uId, s]) => memberIds.has(uId) && s === 'PRESENT').length;
  const lateCount = Object.entries(attendances).filter(([uId, s]) => memberIds.has(uId) && s === 'LATE').length;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.4rem', margin: '0 auto', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
          Escáner de Asistencia QR 📷
        </h2>
        <div style={{ width: '50px' }}></div>
      </div>

      {/* Tarjeta de Control del Tesorero: Selector de Evento Monitoreado */}
      <div className="glass-panel" style={{
        marginBottom: '1.5rem',
        padding: '1.25rem',
        borderLeft: '4px solid var(--color-asistencia)',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-asistencia)', letterSpacing: '0.5px' }}>
            🔴 MONITOREANDO ASISTENCIA EN VIVO
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            👥 {presentCount} Presentes • {lateCount} Tarde
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Selecciona el Ensayo o Evento que estás escaneando:
          </label>
          <button 
            type="button" 
            onClick={fetchLatestEvents} 
            disabled={refreshingEvents}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {refreshingEvents ? '⌛ Cargando...' : '🔄 Actualizar Ensayos'}
          </button>
        </div>

        <select 
          value={selectedEventId} 
          onChange={e => setSelectedEventId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.9rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'white',
            color: '#111',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {eventsList.length === 0 && <option value="">No hay eventos agendados</option>}
          {eventsList.map(ev => (
            <option key={ev.id} value={ev.id}>
              📍 {ev.title} — {new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} ({ev.location})
            </option>
          ))}
        </select>
      </div>

      {/* Banner de Éxito o Advertencia de Escaneo Repetido */}
      {scanResult && (
        <div className="animate-fade-in" style={{
          background: scanResult.alreadyMarked ? 'var(--color-aportes)' : 'var(--color-asistencia)',
          color: scanResult.alreadyMarked ? '#161B14' : 'white',
          padding: '1.25rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'white',
            flexShrink: 0
          }}>
            <img 
              src={scanResult.user.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
              alt={scanResult.user.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <strong style={{ fontSize: '1.1rem', display: 'block' }}>
              {scanResult.alreadyMarked ? '⚠️ Asistencia Ya Registrada' : '¡Asistencia Registrada! ✅'}
            </strong>
            <span style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              {scanResult.user.name} ({getRoleLabel(scanResult.user.role)}) - {new Date(scanResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Error al Escanear */}
      {errorMsg && (
        <div className="animate-fade-in" style={{
          background: 'var(--color-accent)',
          color: 'white',
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tarjeta de Escáner de Cámara */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        
        {/* Input Oculto para Disparar la Cámara Nativa del Celular/iPhone */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={cameraDirectInputRef} 
          onChange={handleScanImageFile} 
          style={{ display: 'none' }} 
        />

        {/* Input Oculto para Selección desde la Galería */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileQrInputRef} 
          onChange={handleScanImageFile} 
          style={{ display: 'none' }} 
        />

        {!isCameraActive ? (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Escáner de Código QR
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
              Elige cómo deseas escanear el carnet QR del integrante:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* OPCIÓN 1: Cámara en Vivo Continua (Ideal para Laptops o Celulares en HTTPS) */}
              <button 
                type="button"
                onClick={startCameraStream} 
                className="btn btn-green"
                style={{ 
                  padding: '0.85rem 1.25rem', 
                  fontSize: '0.95rem', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 14px rgba(19, 96, 58, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                📹 Encender Cámara en Vivo
              </button>

              {/* OPCIÓN 2: Cámara Nativa del Celular / iPhone */}
              <button 
                type="button"
                onClick={() => cameraDirectInputRef.current?.click()} 
                className="btn btn-outline"
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '0.88rem', 
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                📸 Tomar Foto de QR con Celular
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-asistencia)' }}>
                🟢 CÁMARA ESCANEANDO EN VIVO
              </span>
              <button 
                onClick={stopCameraStream} 
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', background: '#E0E0E0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#333' }}
              >
                ⏹ Apagar Cámara
              </button>
            </div>
          </div>
        )}

        {/* Visor de Video de la Cámara en el DOM siempre disponible */}
        <div 
          id="reader" 
          style={{ 
            width: '100%', 
            minHeight: isCameraActive ? '260px' : '0px',
            height: isCameraActive ? 'auto' : '0px',
            background: '#111', 
            borderRadius: '16px', 
            overflow: 'hidden',
            display: isCameraActive ? 'block' : 'none'
          }}
        ></div>

        {cameraError && (
          <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-accent)', borderRadius: '12px', color: 'var(--color-accent)', fontSize: '0.85rem', marginTop: '1rem' }}>
            💡 {cameraError}
          </div>
        )}

        {/* Opción 3: Cargar imagen desde la Galería */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
          <button 
            type="button" 
            onClick={() => fileQrInputRef.current?.click()} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            🖼️ ¿Prefieres seleccionar una foto de la galería? Haz clic aquí
          </button>
        </div>

        <div id="file-qr-temp" style={{ display: 'none' }}></div>
      </div>

      {/* Lista Manual de Contingencia con Buscador */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
          Registro Manual de Integrantes
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Usa la búsqueda si alguien olvidó su celular en el ensayo:
        </p>

        {/* Buscador en tiempo real */}
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
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredMembers.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem' }}>
              No se encontraron integrantes con "{searchTerm}".
            </p>
          )}

          {filteredMembers.map(member => {
            const currentStatus = attendances[member.id];
            const isPresent = currentStatus === 'PRESENT';
            const isLate = currentStatus === 'LATE';

            return (
              <div key={member.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={member.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} 
                    alt={member.name} 
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>{member.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getRoleLabel(member.role)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleManualMark(member.id, 'PRESENT')}
                    disabled={loadingId === member.id}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: isPresent ? 'var(--color-asistencia)' : '#E0E0E0',
                      color: isPresent ? 'white' : '#555'
                    }}
                  >
                    {isPresent ? '✓ Presente' : 'Presente'}
                  </button>

                  <button 
                    onClick={() => handleManualMark(member.id, 'LATE')}
                    disabled={loadingId === member.id}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: isLate ? 'var(--color-aportes)' : '#E0E0E0',
                      color: isLate ? '#161B14' : '#555'
                    }}
                  >
                    {isLate ? '⏱ Tarde' : 'Tarde'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
