'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function EmpadronamientoClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dniLoading, setDniLoading] = useState(false);
  const [dniVerified, setDniVerified] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Paso 1: Identidad
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Masculino');

  // Paso 2: Contacto & Residencia
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Ayacucho');
  const [province, setProvince] = useState('Cangallo');
  const [district, setDistrict] = useState('Cangallo');
  const [address, setAddress] = useState('');

  // Paso 3: Trayectoria & Familia
  const [memberType, setMemberType] = useState('SOCIO');
  const [affiliationYear, setAffiliationYear] = useState('2027');
  const [hasRelatives, setHasRelatives] = useState(false);
  const [relativesDetail, setRelativesDetail] = useState('');

  // Paso 4: Talentos, Vestuario, PIN & FOTOGRAFÍA AL FINAL
  const [selectedTalents, setSelectedTalents] = useState(['Danza']);
  const [musicalInstrument, setMusicalInstrument] = useState('');
  const [clothingSize, setClothingSize] = useState('L');
  const [pin, setPin] = useState('1234');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef(null);

  // Paso 5: Resultado / Carnet Generado
  const [savedUser, setSavedUser] = useState(null);
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState(null);

  // ==================== ESTADOS DE ACCESO DIRECTIVA ====================
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      const res = await fetch('/api/auth/directiva-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/padron';
      } else {
        setAdminError(data.error || 'Credenciales de directiva incorrectas.');
      }
    } catch (err) {
      console.error(err);
      setAdminError('Error al conectar con el servidor.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Consulta Inteligente DNI con Desglose y Bloqueo
  const handleDniInput = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    setDni(clean);
    setDniVerified(false);
    setIsLocked(false);
    setAlreadyRegisteredUser(null);
    setErrorMsg(null);

    if (clean.length === 8) {
      setDniLoading(true);
      try {
        const res = await fetch(`/api/dni/consultar?dni=${clean}`);
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.alreadyRegistered && data.user) {
            setAlreadyRegisteredUser(data.user);
            setDniVerified(true);
            return;
          }

          if (data.nombres || data.name) {
            setNombres(data.nombres || data.name);
            setApellidos(data.apellidos || '');
            setDniVerified(true);
            setIsLocked(true);
          }
          if (data.birthDate) {
            setBirthDate(data.birthDate);
          }
          if (data.gender) {
            setGender(data.gender);
          }
          if (data.district) {
            setDistrict(data.district);
          }
        }
      } catch (err) {
        console.error('Error al consultar DNI:', err);
      } finally {
        setDniLoading(false);
      }
    }
  };

  // Manejador de Foto / Selfie con compresión en Canvas
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setAvatarUrl(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Toggle de Talentos
  const handleTalentToggle = (talent) => {
    if (selectedTalents.includes(talent)) {
      setSelectedTalents(selectedTalents.filter(t => t !== talent));
    } else {
      setSelectedTalents([...selectedTalents, talent]);
    }
  };

  // Enviar Empadronamiento Completo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const fullName = `${nombres} ${apellidos}`.trim();

      const res = await fetch('/api/empadronamiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          name: fullName,
          birthDate,
          gender: gender === 'Femenino' ? 'MUJER' : 'VARON',
          avatarUrl,
          phone,
          email,
          department,
          province,
          district,
          address,
          hasRelatives,
          relativesDetail,
          memberType,
          affiliationYear,
          talents: selectedTalents,
          musicalInstrument: selectedTalents.includes('Música') ? musicalInstrument : null,
          clothingSize,
          pin
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedUser(data.user);
        setStep(5);
      } else {
        setErrorMsg(data.error || 'Hubo un error al procesar tu empadronamiento.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== ESTILOS DE ESPACIADO Y ACABADO TÁCTIL ====================
  const spaciousInputStyle = {
    width: '100%',
    padding: '0.95rem 1.15rem',
    borderRadius: '0.85rem',
    border: '1px solid #e8e8e8',
    fontSize: '0.98rem',
    fontWeight: '500',
    color: '#090909',
    background: '#e8e8e8',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: 'inset 2px 2px 5px #c5c5c5, inset -2px -2px 5px #ffffff',
    transition: 'all 0.3s ease'
  };

  const spaciousLabelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    letterSpacing: '0.2px'
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', fontFamily: 'var(--font-inter, sans-serif)' }}>
      
      {/* ==================== BARRA SUPERIOR (PASOS & DIRECTIVA) ==================== */}
      {step < 5 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-neu-base"
                style={{
                  width: '42px',
                  height: '42px',
                  padding: 0,
                  fontSize: '1.2rem'
                }}
              >
                ←
              </button>
            ) : (
              <div style={{ width: '42px' }} />
            )}

            <div style={{
              background: '#e8e8e8',
              border: '1px solid #e8e8e8',
              boxShadow: '4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff',
              color: '#92400E',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '6px 16px',
              borderRadius: '0.75rem'
            }}>
              PASO {step} DE 4
            </div>

            {/* Botón Protegido para la Directiva */}
            <button
              type="button"
              onClick={() => {
                setShowAdminModal(true);
                setAdminError(null);
              }}
              title="Acceso restringido para el Comité Directivo"
              className="btn-neu-base"
              style={{
                height: '42px',
                padding: '0 14px',
                fontSize: '0.82rem',
                color: '#92400E'
              }}
            >
              <span>🔒</span> Directiva
            </button>
          </div>

          {/* Barra de Progreso Fina en Oro Señorial */}
          <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(step / 4) * 100}%`,
              background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>
      )}

      {/* ==================== CABECERA INSTITUCIONAL CON FOTO ==================== */}
      {step < 5 && (
        <div style={{
          marginBottom: '1.5rem',
          background: '#FFFFFF',
          borderRadius: '1.25rem',
          border: '1.5px solid #FDE68A',
          boxShadow: '6px 6px 16px rgba(0,0,0,0.06), -6px -6px 16px #ffffff',
          overflow: 'hidden'
        }}>
          {/* Fotografía de las Danzantes */}
          <div style={{ position: 'relative', width: '100%', height: '175px' }}>
            <img
              src="/images/cangallo_1.jpg"
              alt="Comparsa Cangallo Señorial"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%' }}
            />
            
            {/* Logo de la Comparsa superpuesto */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px 6px 8px',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              border: '1px solid #FCD34D'
            }}>
              <img
                src="/images/Logo_1.jpg"
                alt="Logo"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E' }}>
                Cangallo Señorial
              </span>
            </div>
          </div>

          <div style={{ padding: '1.5rem 1.5rem', textAlign: 'center' }}>
            {/* Título Principal */}
            <h1 style={{
              fontFamily: 'var(--font-playfair, "Libre Caslon Text", serif)',
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#1F2937',
              lineHeight: 1.15,
              margin: '0 0 0.75rem 0'
            }}>
              Empadronamiento Carnaval 2027
            </h1>

            {/* Pastillas de Disciplinas */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '0.75rem' }}>
                💃 Danzantes
              </span>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '0.75rem' }}>
                🎺 Músicos
              </span>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '0.75rem' }}>
                👑 Directivos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ==================== TARJETA PRINCIPAL DEL FORMULARIO ==================== */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '1.25rem',
        boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.05), -8px -8px 24px #ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Borde Superior en Oro Señorial */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #D97706 100%)',
          width: '100%'
        }} />

        <div style={{ padding: '2rem 1.75rem' }}>

          {/* ==================== PASO 1: VALIDACIÓN DNI ==================== */}
          {step === 1 && (
            <div>
              {/* Campo DNI Principal */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={spaciousLabelStyle}>
                    Número de DNI (8 dígitos)
                  </label>
                  {dniLoading && (
                    <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                      🔍 Consultando...
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="Ej. 70112123"
                    value={dni}
                    onChange={e => handleDniInput(e.target.value)}
                    style={{
                      ...spaciousInputStyle,
                      border: dniVerified ? '2px solid #10B981' : '1px solid #e8e8e8',
                      fontWeight: '600'
                    }}
                  />
                  {dniVerified && !alreadyRegisteredUser && (
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: '#10B981', color: '#FFFFFF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>

                {dniVerified && !alreadyRegisteredUser && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛡️</span> <span>Identidad Verificada Oficialmente</span>
                  </div>
                )}
              </div>

              {/* Mensaje si el usuario ya está empadronado */}
              {alreadyRegisteredUser ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  background: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  color: '#92400E',
                  borderRadius: '0.75rem',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                }}>
                  ⚠️ El usuario ya se encuentra empadronado.
                </div>
              ) : (
                <>
                  {/* Campos de Identidad Desglosados con Espaciado Cómodo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '1.75rem' }}>
                    
                    {/* Nombres */}
                    <div>
                      <label style={spaciousLabelStyle}>
                        Nombres Oficiales {isLocked && <span style={{ color: '#D97706' }}>🔒</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Jhoan"
                        value={nombres}
                        readOnly={isLocked}
                        onChange={e => setNombres(e.target.value)}
                        style={{
                          ...spaciousInputStyle,
                          background: isLocked ? '#F0FDF4' : '#e8e8e8',
                          color: isLocked ? '#065F46' : '#090909',
                          border: isLocked ? '1.5px solid #10B981' : '1px solid #e8e8e8',
                          cursor: isLocked ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <label style={spaciousLabelStyle}>
                        Apellidos Oficiales {isLocked && <span style={{ color: '#D97706' }}>🔒</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Taboada Huaman"
                        value={apellidos}
                        readOnly={isLocked}
                        onChange={e => setApellidos(e.target.value)}
                        style={{
                          ...spaciousInputStyle,
                          background: isLocked ? '#F0FDF4' : '#e8e8e8',
                          color: isLocked ? '#065F46' : '#090909',
                          border: isLocked ? '1.5px solid #10B981' : '1px solid #e8e8e8',
                          cursor: isLocked ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>

                    {/* Fila: Sexo & Nacimiento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={spaciousLabelStyle}>
                          Sexo / Género
                        </label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          style={{
                            ...spaciousInputStyle,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Masculino">Varón</option>
                          <option value="Femenino">Mujer</option>
                        </select>
                      </div>

                      <div>
                        <label style={spaciousLabelStyle}>
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          style={spaciousInputStyle}
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={!dni || !nombres}
                    onClick={() => setStep(2)}
                    className="btn-neu-primary"
                    style={{
                      opacity: (!dni || !nombres) ? 0.6 : 1,
                      cursor: (!dni || !nombres) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Continuar al Paso 2 ➔
                  </button>
                </>
              )}
            </div>
          )}

          {/* ==================== PASO 2: CONTACTO ==================== */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '1.75rem' }}>
                <div>
                  <label style={spaciousLabelStyle}>
                    Celular / WhatsApp Principal <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 987654321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={spaciousInputStyle}
                  />
                </div>

                <div>
                  <label style={spaciousLabelStyle}>
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. mi.correo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={spaciousInputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={spaciousLabelStyle}>
                      Departamento
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      style={spaciousInputStyle}
                    >
                      <option value="Ayacucho">Ayacucho</option>
                      <option value="Lima">Lima / Callao</option>
                      <option value="Ica">Ica</option>
                      <option value="Huancavelica">Huancavelica</option>
                      <option value="Arequipa">Arequipa</option>
                      <option value="Cusco">Cusco</option>
                      <option value="Otro">Otra Región</option>
                    </select>
                  </div>

                  <div>
                    <label style={spaciousLabelStyle}>
                      Distrito
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cangallo"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      style={spaciousInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={spaciousLabelStyle}>
                    Dirección o Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Jr. Sucre 240 / Cerca a la Plaza Central"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={spaciousInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={!phone}
                  onClick={() => setStep(3)}
                  className="btn-neu-primary"
                  style={{
                    opacity: !phone ? 0.6 : 1,
                    cursor: !phone ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continuar al Paso 3 ➔
                </button>
              </div>
            </div>
          )}

          {/* ==================== PASO 3: MEMBRESÍA & FAMILIA ==================== */}
          {step === 3 && (
            <div>
              {/* Selector de Rol */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  Selecciona tu Rol Institucional:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { id: 'SOCIO', icon: '💃', label: 'Danzante', desc: 'Bailarín(a)' },
                    { id: 'MUSICO', icon: '🎺', label: 'Músico', desc: 'Banda' },
                    { id: 'DIRECTIVO', icon: '👑', label: 'Directivo', desc: 'Comité' }
                  ].map(item => {
                    const active = memberType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setMemberType(item.id)}
                        style={{
                          border: active ? '2px solid #D97706' : '1px solid #e8e8e8',
                          background: active ? '#FEF3C7' : '#e8e8e8',
                          color: '#1F2937',
                          borderRadius: '0.75rem',
                          padding: '16px 8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          boxShadow: active ? 'inset 3px 3px 6px rgba(217, 119, 6, 0.2), inset -3px -3px 6px #ffffff' : '5px 5px 10px #c5c5c5, -5px -5px 10px #ffffff',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{item.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: active ? '#92400E' : '#1F2937' }}>{item.label}</div>
                        <div style={{ fontSize: '0.74rem', color: active ? '#B45309' : '#6B7280', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Año de Afiliación */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  Año de Ingreso a Cangallo Señorial:
                </label>
                <select
                  value={affiliationYear}
                  onChange={e => setAffiliationYear(e.target.value)}
                  style={spaciousInputStyle}
                >
                  <option value="2027">🌟 2027 (Nuevo Integrante)</option>
                  <option value="2026">2026 (1 año de antigüedad)</option>
                  <option value="2025">2025 (2 años de antigüedad)</option>
                  <option value="2024">2024 (3 años de antigüedad)</option>
                  <option value="2023">2023</option>
                  <option value="2020">2020 o anterior (Socio Tradicional)</option>
                  <option value="2015">2015 o anterior (Socio Fundador / Veterano)</option>
                </select>
              </div>

              {/* Familiares en la Comparsa */}
              <div style={{
                marginBottom: '1.75rem',
                background: '#e8e8e8',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #e8e8e8',
                boxShadow: '4px 4px 10px #c5c5c5, -4px -4px 10px #ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937' }}>
                    ¿Tienes familiares en la comparsa?
                  </span>
                  <input
                    type="checkbox"
                    checked={hasRelatives}
                    onChange={e => setHasRelatives(e.target.checked)}
                    style={{ width: '22px', height: '22px', accentColor: '#D97706', cursor: 'pointer' }}
                  />
                </div>

                {hasRelatives && (
                  <div style={{ marginTop: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Ej. Mi hermano Carlos y mi prima Rosa"
                      value={relativesDetail}
                      onChange={e => setRelativesDetail(e.target.value)}
                      style={spaciousInputStyle}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-neu-primary"
              >
                Continuar al Paso 4 ➔
              </button>
            </div>
          )}

          {/* ==================== PASO 4: TALENTOS, VESTUARIO, PIN & FOTO ==================== */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              {/* Disciplinas y Talentos */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  Disciplinas & Talentos Artísticos:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { id: 'Danza', label: '💃 Danza', desc: 'Coreografía' },
                    { id: 'Canto', label: '🎤 Canto', desc: 'Voz / Coro' },
                    { id: 'Música', label: '🎺 Música', desc: 'Instrumento' },
                    { id: 'Creación', label: '✍️ Creación', desc: 'Compositor' },
                    { id: 'Arte', label: '📸 Arte & Foto', desc: 'Redes / Foto' },
                    { id: 'Bordado', label: '🧵 Vestuario', desc: 'Confección' }
                  ].map(item => {
                    const isSelected = selectedTalents.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleTalentToggle(item.id)}
                        style={{
                          border: isSelected ? '1.5px solid #D97706' : '1px solid #e8e8e8',
                          background: isSelected ? '#FEF3C7' : '#e8e8e8',
                          borderRadius: '0.75rem',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? 'inset 3px 3px 6px rgba(217, 119, 6, 0.2), inset -3px -3px 6px #ffffff' : '4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#92400E' : '#1F2937' }}>{item.label}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{item.desc}</div>
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: isSelected ? '#D97706' : '#9CA3AF' }}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrumento si es Músico */}
              {selectedTalents.includes('Música') && (
                <div style={{ marginBottom: '1.5rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '0.75rem', padding: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '8px' }}>
                    🎺 ¿Qué instrumento tocas?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mandolina, Quena, Guitarra, Trompeta"
                    value={musicalInstrument}
                    onChange={e => setMusicalInstrument(e.target.value)}
                    style={{ ...spaciousInputStyle, background: '#FFFFFF' }}
                  />
                </div>
              )}

              {/* Selector de Talla de Vestuario con Estilo Neumórfico */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  Talla de Vestuario para Carnaval 2027:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const active = clothingSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setClothingSize(size)}
                        className={`btn-neu-pill ${active ? 'active' : ''}`}
                        style={{
                          height: '48px',
                          fontSize: '1rem'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN de Seguridad */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  PIN de Acceso a tu Perfil (4 dígitos):
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  style={{
                    ...spaciousInputStyle,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: '1.25rem'
                  }}
                />
              </div>

              {/* Fotografía al Final */}
              <div style={{
                marginBottom: '1.75rem',
                background: '#e8e8e8',
                border: '1.5px dashed #D97706',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: 'inset 2px 2px 6px #c5c5c5, inset -2px -2px 6px #ffffff'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                  📸 Fotografía / Selfie para tu Carnet QR
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 1rem 0' }}>
                  Tómate una selfie con tu celular o elige una foto de tu rostro:
                </p>

                {avatarUrl ? (
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <img
                      src={avatarUrl}
                      alt="Foto de Perfil"
                      style={{ width: '105px', height: '105px', borderRadius: '50%', objectFit: 'cover', border: '3.5px solid #D97706', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      style={{ position: 'absolute', bottom: 0, right: 0, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-neu-base"
                      style={{
                        padding: '0.8em 1.6em',
                        color: '#090909'
                      }}
                    >
                      📷 Tomar Foto / Elegir Archivo
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neu-primary"
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Generando Carnet Oficial 2027...' : '✓ Finalizar Empadronamiento'}
              </button>
            </form>
          )}

          {/* ==================== PASO 5: CARNET DIGITAL OFICIAL ==================== */}
          {step === 5 && savedUser && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#D1FAE5',
                color: '#059669',
                fontSize: '2.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem auto',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.2)'
              }}>
                ✓
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.75rem', color: '#1F2937', fontWeight: 900, marginBottom: '0.25rem' }}>
                ¡EMPADRONAMIENTO EXITOSO!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                Ya eres parte del <strong>Padrón Oficial Carnaval 2027</strong> de Cangallo Señorial.
              </p>

              {/* Tarjeta de Lujo del Carnet */}
              <div style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                color: '#FFFFFF',
                borderRadius: '1.25rem',
                padding: '1.75rem 1.5rem',
                maxWidth: '360px',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                border: '2.5px solid #D97706',
                position: 'relative',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 900, marginBottom: '0.35rem' }}>
                  CARNET DIGITAL OFICIAL • 2027
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: 1.15, marginBottom: '0.9rem' }}>
                  CANGALLO SEÑORIAL
                </div>

                <div style={{ width: '86px', height: '86px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FCD34D', margin: '0 auto 0.85rem auto', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={savedUser.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  {savedUser.name}
                </div>

                <div style={{
                  display: 'inline-block',
                  background: 'rgba(217, 119, 6, 0.25)',
                  border: '1.5px solid #FCD34D',
                  color: '#FCD34D',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  letterSpacing: '1.2px',
                  padding: '4px 14px',
                  borderRadius: '0.75rem',
                  marginBottom: '0.6rem'
                }}>
                  CÓDIGO: {savedUser.affiliationYear || '2027'}{savedUser.dni}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#E5E7EB', fontWeight: 500, marginBottom: '0.9rem' }}>
                  DNI: {savedUser.dni} &bull; Talla: {savedUser.clothingSize || 'L'}
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '0.75rem', display: 'inline-block', marginBottom: '0.85rem', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${savedUser.qr_code_hash}`}
                    alt="QR Asistencia"
                    style={{ width: '135px', height: '135px', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: '#FCD34D', fontWeight: 700 }}>
                  {savedUser.memberType === 'MUSICO' ? '🎺 Músico de Banda' : savedUser.memberType === 'DIRECTIVO' ? '👑 Comité Directivo' : '💃 Socio Danzante'} &bull; Cangallo Señorial
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                💡 Toma una <strong>captura de pantalla</strong> a este carnet para tenerlo listo en cada ensayo.
              </p>

              <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setDni('');
                    setNombres('');
                    setApellidos('');
                    setSavedUser(null);
                  }}
                  className="btn-neu-base"
                  style={{
                    width: '100%',
                    padding: '0.85em 1.5em',
                    color: '#92400E'
                  }}
                >
                  ← Empadronar a Otro Integrante
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== MODAL DE ACCESO DIRECTIVA ==================== */}
      {showAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '1.25rem',
            maxWidth: '420px',
            width: '100%',
            padding: '2rem 1.75rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid #D97706',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '0.75rem',
              background: '#FEF3C7',
              border: '2px solid #FCD34D',
              color: '#D97706',
              fontSize: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}>
              🔒
            </div>

            <h3 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#1F2937',
              margin: '0 0 0.35rem 0'
            }}>
              Acceso de Directiva
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 1.5rem 0' }}>
              Ingresa las credenciales autorizadas para consultar el Padrón General y descargar reportes.
            </p>

            {adminError && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#FEE2E2',
                border: '1px solid #EF4444',
                color: '#B91C1C',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                ⚠️ {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={spaciousLabelStyle}>
                  Usuario:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. administrador"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  style={spaciousInputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={spaciousLabelStyle}>
                  Contraseña:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  style={spaciousInputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn-neu-primary"
              >
                {adminLoading ? 'Verificando...' : 'Ingresar al Padrón Oficial ➔'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
