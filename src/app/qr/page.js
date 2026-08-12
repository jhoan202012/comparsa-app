import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QRCodeDisplay from './QRCodeDisplay';
import styles from './qr.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QRPage({ searchParams }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/'); 

  const params = await searchParams;
  const forceShowQR = params?.show === 'true';

  // Buscar el evento agendado más reciente o activo
  const activeEvent = await prisma.event.findFirst({
    orderBy: { date: 'desc' }
  });

  // Verificar si el usuario YA registró asistencia para este evento específico
  let myAttendance = null;
  if (activeEvent) {
    myAttendance = await prisma.attendance.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: activeEvent.id
        }
      }
    });
  }

  // Hash único permanente del usuario para su QR
  const qrPayload = user.qr_code_hash;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}>← Volver</Link>
        <h2>Mi Asistencia</h2>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.qrCard}`}>
        
        {/* Si YA registró asistencia para este ensayo Y no solicitó forzar ver su QR */}
        {myAttendance && !forceShowQR ? (
          <div style={{ padding: '1rem 0', textAlign: 'center' }}>
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
              Tu asistencia para el <strong>{activeEvent?.title || 'Ensayo General'}</strong> ya fue escaneada y confirmada con éxito.
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
                  {new Date(myAttendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                <strong style={{ color: 'var(--color-asistencia)' }}>
                  {myAttendance.status === 'PRESENT' ? 'Presente' : 'Tarde'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/" className="btn btn-green" style={{ width: '100%' }}>
                Volver al Inicio
              </Link>
              <Link href="/qr?show=true" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                Ver mi Carnet QR de nuevo
              </Link>
            </div>
          </div>
        ) : (
          /* Si AÚN NO ha registrado asistencia para el evento agendado (o solicitó ver su QR): Mostrar el QR */
          <>
            <p className={styles.instruction}>
              Muestra este código al delegado al llegar al ensayo para registrar tu asistencia automáticamente.
            </p>
            
            <div className={styles.qrWrapper}>
              <QRCodeDisplay value={qrPayload} />
            </div>

            <h3 className={styles.name}>{user.name}</h3>
            <p className={styles.role}>{user.role === 'MUSICIAN' ? 'Músico Exonerado' : 'Socio Activo'}</p>
            
            {myAttendance && (
              <Link href="/qr" style={{ display: 'block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-asistencia)', fontWeight: 600 }}>
                ✓ Ver confirmación de hoy
              </Link>
            )}
          </>
        )}

      </div>
    </div>
  );
}
