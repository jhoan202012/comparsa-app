'use client';
import { useState, useRef } from 'react';

export default function FormPerfil({ user, defaultAvatars }) {
  const fileInputRef = useRef(null);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl || defaultAvatars[0]);
  const [loading, setLoading] = useState(false);

  // Estado para cambio de contraseña
  const [pin, setPin] = useState(user.pin || '1234');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Redimensionar automáticamente la imagen elegida a 300x300px JPEG
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 300;
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

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedAvatar(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl: selectedAvatar }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        alert(`Error al guardar: ${data.error || 'Intenta con otra imagen.'}`);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar.');
      setLoading(false);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    setPinLoading(true);
    setPinSuccess(false);

    try {
      const res = await fetch('/api/user/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: pin })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPinSuccess(true);
      } else {
        alert(data.error || 'Error al cambiar contraseña');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      
      {/* Previsualización del Avatar en Vivo */}
      <div style={{
        width: '130px',
        height: '130px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid var(--color-asistencia)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        {selectedAvatar ? (
          <img src={selectedAvatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--color-asistencia)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>{user.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Rol: {user.role === 'ADMIN' ? 'Tesorero / Directiva' : user.role === 'MUSICIAN' ? 'Músico de Banda' : 'Socio Activo'}
        </p>
        {user.phone && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>📞 {user.phone}</p>}
      </div>

      {/* SECCIÓN 1: CAMBIAR CONTRASEÑA O PIN */}
      <div className="glass-panel" style={{ width: '100%', padding: '1.25rem', background: 'var(--bg-primary)' }}>
        <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          🔑 Cambiar mi Contraseña o PIN
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Configura una contraseña sencilla para ingresar a tu cuenta:
        </p>

        {pinSuccess && (
          <div style={{ padding: '0.65rem', background: 'var(--color-asistencia)', color: 'white', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '0.85rem', textAlign: 'center' }}>
            ✓ ¡Contraseña actualizada exitosamente!
          </div>
        )}

        <form onSubmit={handleSavePin} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            required
            placeholder="Nueva contraseña (ej. 1234)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'white',
              color: '#111',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="submit"
            disabled={pinLoading}
            className="btn btn-green"
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            {pinLoading ? 'Guardando...' : 'Actualizar'}
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: SELECCIÓN DE FOTO DE PERFIL */}
      <div style={{ width: '100%' }}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className="btn btn-outline" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
        >
          📷 Subir Foto de Perfil
        </button>
      </div>

      {/* Galería Alternativa de Fotos de la Comparsa */}
      <div style={{ width: '100%', textAlign: 'left' }}>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'block', color: 'var(--text-secondary)' }}>
          O elige una foto oficial de la comparsa:
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {defaultAvatars.map((url, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedAvatar(url)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedAvatar === url ? '3px solid var(--color-asistencia)' : '2px solid transparent',
                transform: selectedAvatar === url ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <img src={url} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSaveAvatar} 
        className="btn btn-green" 
        style={{ width: '100%' }}
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar Foto de Perfil'}
      </button>
    </div>
  );
}
