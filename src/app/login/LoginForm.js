'use client';
import { useState } from 'react';

export default function LoginForm({ users, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'pending_success'
  
  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('MEMBER');
  const [regError, setRegError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      // Buscar usuario coincidente por teléfono, email o nombre
      const foundUser = users.find(u => 
        (u.phone && u.phone === loginInput.trim()) ||
        (u.email && u.email.toLowerCase() === loginInput.trim().toLowerCase()) ||
        u.name.toLowerCase().includes(loginInput.trim().toLowerCase())
      );

      if (!foundUser) {
        setLoginError('No se encontró ningún integrante activo con ese teléfono o correo. Solicita tu registro si eres nuevo.');
        setLoading(false);
        return;
      }

      // Redirigir a quicklogin con el usuario encontrado
      window.location.href = `/api/auth/quicklogin?userId=${foundUser.id}`;
    } catch (err) {
      console.error(err);
      setLoginError('Error de conexión al ingresar');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          role: regRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMode('pending_success');
      } else {
        setRegError(data.error || 'No se pudo procesar la solicitud');
      }
    } catch (err) {
      console.error(err);
      setRegError('Error de conexión al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'pending_success') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(225, 177, 44, 0.15)',
          color: 'var(--color-aportes)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          margin: '0 auto 1.25rem auto'
        }}>
          ⏳
        </div>

        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          ¡Solicitud Enviada a la Directiva!
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          Tus datos fueron recibidos con éxito. El Tesorero o Presidente habilitará tu cuenta y te enviará la notificación por <strong>WhatsApp</strong> para ingresar a tu carnet QR.
        </p>

        <button
          onClick={() => setMode('login')}
          className="btn btn-green"
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '14px',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Volver al Inicio de Sesión
        </button>
      </div>
    );
  }

  return (
    <div>
      
      {/* Botones superiores de pestaña con colores oficiales */}
      <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '14px', marginBottom: '1.75rem', border: '1px solid var(--glass-border)' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: mode === 'login' ? '#FFFFFF' : 'transparent',
            color: mode === 'login' ? 'var(--color-asistencia)' : 'var(--text-secondary)',
            boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: mode === 'register' ? '#FFFFFF' : 'transparent',
            color: mode === 'register' ? 'var(--color-asistencia)' : 'var(--text-secondary)',
            boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          Solicitar Registro
        </button>
      </div>

      {mode === 'login' ? (
        /* FORMULARIO DE INGRESO ESTILO HAPI CON COLORES OFICIALES */
        <form onSubmit={handleLoginSubmit}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            ¡Hola de nuevo! 👋
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Ingresa tu teléfono o correo registrado en la comparsa:
          </p>

          {loginError && (
            <div style={{ padding: '0.75rem', background: 'rgba(183, 28, 28, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {loginError}
            </div>
          )}

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
              Teléfono o Correo electrónico:
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 988888888 o juan@comparsa.com"
              value={loginInput}
              onChange={e => setLoginInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-primary)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
              PIN / Contraseña de Acceso:
            </label>
            <input
              type="password"
              placeholder="••••"
              value={loginPin}
              onChange={e => setLoginPin(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-primary)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-green"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(19, 96, 58, 0.3)',
              marginBottom: '1.25rem'
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar a mi Perfil ➔'}
          </button>

          {/* Acceso Rápido para Ensayos (Desplegable de Pruebas) */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowQuickSelect(!showQuickSelect)}
              style={{ background: 'none', border: 'none', color: 'var(--color-asistencia)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {showQuickSelect ? '▲ Ocultar perfiles de prueba' : '⚡ ¿En ensayo? Selecciona tu perfil rápido aquí'}
            </button>

            {showQuickSelect && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {users.map(u => (
                  <a
                    key={u.id}
                    href={`/api/auth/quicklogin?userId=${u.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <span>{u.name} ({u.role === 'ADMIN' ? 'Directiva' : u.role === 'MUSICIAN' ? 'Músico' : 'Socio'})</span>
                    <span>➔</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </form>
      ) : (
        /* FORMULARIO DE SOLICITUD DE REGISTRO CON COLORES OFICIALES */
        <form onSubmit={handleRegisterSubmit}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Solicitud de Inscripción 📝
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            La Directiva evaluará tu registro para autorizar tu carnet QR:
          </p>

          {regError && (
            <div style={{ padding: '0.75rem', background: 'rgba(183, 28, 28, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {regError}
            </div>
          )}

          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              Nombre y Apellidos Completos:
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carmen Rosa Mendoza"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              Celular / WhatsApp (Para notificación):
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 987654321"
              value={regPhone}
              onChange={e => setRegPhone(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              ¿Cómo participas en la comparsa?
            </label>
            <select
              value={regRole}
              onChange={e => setRegRole(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', background: 'white', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="MEMBER">Socio Activo (Bailarín de Comparsa)</option>
              <option value="MUSICIAN">Músico de Banda de Acompañamiento</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-green"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(19, 96, 58, 0.35)'
            }}
          >
            {loading ? 'Enviando Solicitud...' : 'Enviar Solicitud a la Directiva 🚀'}
          </button>
        </form>
      )}

    </div>
  );
}
