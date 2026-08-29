import Link from 'next/link';

export const metadata = {
  title: 'Propuesta Oficial • Comparsa Cangallo Señorial 2027',
  description: 'Dossier Técnico y Comercial — Plataforma Digital de Gestión Integral & Asistencia QR'
};

export default function PropuestaPage() {
  return (
    <div style={{ background: '#0F172A', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#FFF', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* Barra Superior con Botón de Descarga */}
        <div style={{ background: '#0D4A2B', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFF' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '1px', textTransform: 'uppercase' }}>Carnaval Ayacuchano 2027</span>
            <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', margin: 0 }}>CANGALLO SEÑORIAL — DOSSIER EJECUTIVO</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              ← Volver al Inicio
            </Link>
            <a href="/Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf" download style={{ background: '#D97706', color: '#FFF', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(217,119,6,0.4)' }}>
              📥 Descargar PDF Oficial
            </a>
          </div>
        </div>

        {/* Visor Iframe del HTML optimizado */}
        <iframe 
          src="/dossier_propuesta.html" 
          style={{ width: '100%', height: '1100px', border: 'none', display: 'block' }}
          title="Dossier Comercial Cangallo Señorial"
        />
      </div>
    </div>
  );
}
