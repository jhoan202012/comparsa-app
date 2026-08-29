import EmpadronamientoClient from './EmpadronamientoClient';

export const metadata = {
  title: 'Empadronamiento Oficial 2027 • Comparsa Cangallo Señorial',
  description: 'Portal de registro, censo digital y emisión de Carnet QR para integrantes de la Comparsa Cangallo Señorial.',
};

export default function EmpadronamientoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #FAF7F2)', padding: '1.5rem 1rem 3rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <EmpadronamientoClient />
      </div>
    </div>
  );
}
