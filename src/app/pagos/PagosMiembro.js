'use client';
import { useRouter } from 'next/navigation';
import styles from './pagos.module.css';
import { useState } from 'react';

export default function PagosMiembro({ records }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);

  const handleUpload = async (recordId) => {
    setLoadingId(recordId);
    // Aquí el usuario en la app final seleccionaría una foto de su galería.
    // Por ahora, simulamos directamente la subida enviando al backend.
    await fetch('/api/pagos/upload', {
      method: 'POST',
      body: JSON.stringify({ recordId }),
      headers: { 'Content-Type': 'application/json' }
    });
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="gradient-text">Mis Pagos</h2>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Sube las capturas de Yape/Plin para que tesorería las valide.</p>
      </div>

      <div className={styles.list}>
        {records.length === 0 && <p className={styles.empty}>Estás al día. No tienes cuotas pendientes.</p>}
        {records.map(record => (
          <div key={record.id} className={`glass-panel animate-fade-in ${styles.paymentCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.title}>{record.fee.title}</h3>
                <p className={styles.subtitle}>Vence: {new Date(record.fee.dueDate).toLocaleDateString()}</p>
              </div>
              <div className={styles.amount}>S/ {record.fee.amount.toFixed(2)}</div>
            </div>
            
            <div className={styles.cardFooter}>
              <span className={`${styles.statusBadge} ${styles[record.status.toLowerCase()]}`}>
                {record.status === 'PENDING' ? 'Pendiente' : record.status === 'VALIDATING' ? 'En Revisión' : 'Pagado'}
              </span>
              
              {record.status === 'PENDING' && (
                <button 
                  className={`btn btn-outline ${styles.actionBtn}`}
                  onClick={() => handleUpload(record.id)}
                  disabled={loadingId === record.id}
                >
                  {loadingId === record.id ? 'Subiendo...' : 'Subir Yape'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
