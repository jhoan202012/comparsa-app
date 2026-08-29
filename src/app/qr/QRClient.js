'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCodeDisplay from './QRCodeDisplay';
import styles from './qr.module.css';

export default function QRClient({ initialUser, initialActiveEvent, initialAttendance, forceShowQR }) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [showQR, setShowQR] = useState(forceShowQR);

  useEffect(() => {
    if (!initialActiveEvent) return;

    // Polling automático cada 2 segundos para detectar si el tesorero escaneó el QR
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/asistencia/mi-estado?eventId=${initialActiveEvent.id}`);
        const data = await res.json();
        if (res.ok && data.myAttendance) {
          setAttendance(data.myAttendance);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [initialActiveEvent]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}>← Volver</Link>
        <h2>Mi Asistencia</h2>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.qrCard}`}>
        
        {/* Si YA registró asistencia para este ensayo Y no solicitó forzar ver su QR */}
        {attendance && !showQR ? (
          <div style={{ padding: '1rem 0', textAlign: 'center' }} className="animate-fade-in">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-asistencia)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 8px 24px rgba(19, 96, 58, 0.3)'
            }}>
              ✓
            </div>

            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ¡Asistencia Registrada!
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Tu asistencia para el <strong>{initialActiveEvent?.title || 'Ensayo General'}</strong> ya fue escaneada y confirmada con éxito.
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hora de escaneo:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Date(attendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                <strong style={{ color: 'var(--color-asistencia)' }}>
                  {attendance.status === 'PRESENT' ? 'Presente' : 'Tarde'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/" className="btn btn-green" style={{ width: '100%' }}>
                Volver al Inicio
              </Link>
              <button 
                onClick={() => setShowQR(true)} 
                style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Ver mi Carnet QR de nuevo
              </button>
            </div>
          </div>
        ) : (
          /* Si AÚN NO ha registrado asistencia para el evento agendado (o solicitó ver su QR): Mostrar el QR */
          <>
            <p className={styles.instruction}>
              Muestra este código al delegado al llegar al ensayo para registrar tu asistencia automáticamente.
            </p>
            
            <div className={styles.qrWrapper}>
              <QRCodeDisplay value={initialUser.qr_code_hash} />
            </div>

            <h3 className={styles.name}>{initialUser.name}</h3>
            <div style={{
              display: 'inline-block',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '1px',
              padding: '2px 10px',
              borderRadius: '8px',
              margin: '0.2rem auto 0.4rem auto'
            }}>
              CÓDIGO: {initialUser.affiliationYear || '2027'}-{initialUser.dni || ''}
            </div>
            <p className={styles.role}>{initialUser.role === 'MUSICIAN' ? '🎺 Músico de Banda' : initialUser.role === 'ADMIN' ? '👑 Directiva' : '💃 Socio Danzante'}</p>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-asistencia)', display: 'inline-block' }}></span>
              <span>Esperando escaneo en tiempo real...</span>
            </div>
            
            {attendance && (
              <button 
                onClick={() => setShowQR(false)} 
                style={{ display: 'block', margin: '1rem auto 0 auto', background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--color-asistencia)', fontWeight: 600, cursor: 'pointer' }}
              >
                ✓ Ver confirmación de hoy
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
}
