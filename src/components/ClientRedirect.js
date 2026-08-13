'use client';
import { useEffect } from 'react';

export default function ClientRedirect({ to = '/login' }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '3px solid #13603A',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.2rem'
        }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#0F172A' }}>
          Cangallo Señorial 2027
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
          Ingresando a la plataforma...
        </p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
