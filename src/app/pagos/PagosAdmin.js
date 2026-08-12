'use client';
import { useRouter } from 'next/navigation';
import styles from './pagos.module.css';
import { useState } from 'react';

export default function PagosAdmin({ records }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (recordId) => {
    setLoadingId(recordId);
    await fetch('/api/pagos/approve', {
      method: 'POST',
      body: JSON.stringify({ recordId }),
      headers: { 'Content-Type': 'application/json' }
    });
    setLoadingId(null);
    router.refresh();
  };

  const handleRevert = async (recordId) => {
    setLoadingId(recordId);
    await fetch('/api/pagos/revert', {
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
        <h2 className="gradient-text">Validación de Pagos</h2>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Aprueba los vouchers subidos por los miembros.</p>
      </div>

      <div className={styles.list}>
        {records.length === 0 && <p className={styles.empty}>No hay pagos registrados.</p>}
        {records.map(record => (
          <div key={record.id} className={`glass-panel animate-fade-in ${styles.paymentCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.title}>{record.user.name}</h3>
                <p className={styles.subtitle}>{record.fee.title}</p>
              </div>
              <div className={styles.amount}>S/ {record.fee.amount.toFixed(2)}</div>
            </div>
            
            <div className={styles.cardFooter}>
              <span className={`${styles.statusBadge} ${styles[record.status.toLowerCase()]}`}>
                {record.status === 'PENDING' ? 'Pendiente' : record.status === 'VALIDATING' ? 'En Revisión' : 'Aprobado'}
              </span>
              
              {record.status !== 'PAID' ? (
                <button 
                  className={`btn btn-primary ${styles.actionBtn}`} 
                  onClick={() => handleApprove(record.id)}
                  disabled={loadingId === record.id}
                >
                  {loadingId === record.id ? 'Procesando...' : 'Aprobar Pago'}
                </button>
              ) : (
                <button 
                  className={`btn btn-outline ${styles.actionBtn}`} 
                  onClick={() => handleRevert(record.id)}
                  disabled={loadingId === record.id}
                  style={{borderColor: 'var(--danger)', color: 'var(--danger)'}}
                >
                  {loadingId === record.id ? '...' : 'Deshacer'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
