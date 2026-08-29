'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

// Iconos SVG Vectoriales de Alta Definición y Seguridad
const LockIcon = ({ size = 16, color = '#92400E' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="11" width="18" height="11" rx="2.5" ry="2.5" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldCheckIcon = ({ size = 16, color = '#059669' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CameraIcon = ({ size = 18, color = '#374151' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

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

  // ==================== ESTILOS MODERNOS Y REFINADOS (UI/UX DE ALTA GAMA) ====================
  const refinedInputStyle = {
    width: '100%',
    padding: '0.85rem 1.1rem',
    borderRadius: '12px',
    border: '1.5px solid #E5E7EB',
    fontSize: '0.96rem',
    fontWeight: '500',
    color: '#1F2937',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease'
  };

  const refinedLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.84rem',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: '7px',
    letterSpacing: '0.2px'
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', fontFamily: 'var(--font-inter, sans-serif)' }}>
      
      {/* ==================== BARRA SUPERIOR (PASOS & DIRECTIVA) ==================== */}
      {step < 5 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-modern-base"
                style={{
                  width: '38px',
                  height: '38px',
                  padding: 0,
                  fontSize: '1.1rem',
                  borderRadius: '10px'
                }}
              >
                ←
              </button>
            ) : (
              <div style={{ width: '38px' }} />
            )}

            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#92400E',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '9999px'
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
              className="btn-modern-base"
              style={{
                height: '38px',
                padding: '0 12px',
                fontSize: '0.8rem',
                color: '#92400E',
                background: '#FFFBEB',
                borderColor: '#FDE68A',
                gap: '5px'
              }}
            >
              <LockIcon size={14} color="#92400E" /> Directiva
            </button>
          </div>

          {/* Barra de Progreso Fina en Oro Señorial */}
          <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
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
          marginBottom: '1.25rem',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          {/* Fotografía de las Danzantes */}
          <div style={{ position: 'relative', width: '100%', height: '170px' }}>
            <img
              src="/images/cangallo_1.jpg"
              alt="Comparsa Cangallo Señorial"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%' }}
            />
            
            {/* Logo de la Comparsa superpuesto */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '5px 12px 5px 6px',
              borderRadius: '9999px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid #FCD34D'
            }}>
              <img
                src="/images/Logo_1.jpg"
                alt="Logo"
                style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#92400E' }}>
                Cangallo Señorial
              </span>
            </div>
          </div>

          <div style={{ padding: '1.25rem', textAlign: 'center' }}>
            {/* Título Principal */}
            <h1 style={{
              fontFamily: 'var(--font-playfair, "Libre Caslon Text", serif)',
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#1F2937',
              lineHeight: 1.15,
              margin: '0 0 0.6rem 0'
            }}>
              Empadronamiento Carnaval 2027
            </h1>

            {/* Pastillas de Disciplinas */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.76rem', fontWeight: 700, padding: '3px 12px', borderRadius: '8px' }}>
                💃 Danzantes
              </span>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.76rem', fontWeight: 700, padding: '3px 12px', borderRadius: '8px' }}>
                🎺 Músicos
              </span>
              <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.76rem', fontWeight: 700, padding: '3px 12px', borderRadius: '8px' }}>
                👑 Directivos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.9rem 1.1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ==================== TARJETA PRINCIPAL DEL FORMULARIO ==================== */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '20px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Borde Superior en Oro Señorial */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #D97706 100%)',
          width: '100%'
        }} />

        <div style={{ padding: '1.75rem 1.5rem' }}>

          {/* ==================== PASO 1: VALIDACIÓN DNI ==================== */}
          {step === 1 && (
            <div>
              {/* Campo DNI Principal */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Número de DNI (8 dígitos)</span>
                  {dniLoading && (
                    <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>
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
                      ...refinedInputStyle,
                      border: dniVerified ? '2px solid #10B981' : '1.5px solid #E5E7EB',
                      fontWeight: '600'
                    }}
                  />
                  {dniVerified && !alreadyRegisteredUser && (
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: '#10B981', color: '#FFFFFF', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>

                {dniVerified && !alreadyRegisteredUser && (
                  <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheckIcon size={15} color="#059669" /> <span>Identidad Verificada Oficialmente</span>
                  </div>
                )}
              </div>

              {/* Mensaje si el usuario ya está empadronado */}
              {alreadyRegisteredUser ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.2rem',
                  background: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  color: '#92400E',
                  borderRadius: '14px',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                }}>
                  ⚠️ El usuario ya se encuentra empadronado.
                </div>
              ) : (
                <>
                  {/* Campos de Identidad Desglosados */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.5rem' }}>
                    
                    {/* Nombres */}
                    <div>
                      <div style={refinedLabelStyle}>
                        <span>Nombres Oficiales</span>
                        {isLocked && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '0.76rem', fontWeight: 700 }}><LockIcon size={12} color="#D97706" /> Verificado</span>}
                      </div>
                      <input
                        type="text"
                        placeholder="Ej. Jhoan"
                        value={nombres}
                        readOnly={isLocked}
                        onChange={e => setNombres(e.target.value)}
                        style={{
                          ...refinedInputStyle,
                          background: isLocked ? '#F0FDF4' : '#FFFFFF',
                          color: isLocked ? '#065F46' : '#1F2937',
                          border: isLocked ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
                          cursor: isLocked ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <div style={refinedLabelStyle}>
                        <span>Apellidos Oficiales</span>
                        {isLocked && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '0.76rem', fontWeight: 700 }}><LockIcon size={12} color="#D97706" /> Verificado</span>}
                      </div>
                      <input
                        type="text"
                        placeholder="Ej. Taboada Huaman"
                        value={apellidos}
                        readOnly={isLocked}
                        onChange={e => setApellidos(e.target.value)}
                        style={{
                          ...refinedInputStyle,
                          background: isLocked ? '#F0FDF4' : '#FFFFFF',
                          color: isLocked ? '#065F46' : '#1F2937',
                          border: isLocked ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
                          cursor: isLocked ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>

                    {/* Fila: Sexo & Nacimiento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={refinedLabelStyle}>
                          <span>Sexo / Género</span>
                        </div>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          style={{
                            ...refinedInputStyle,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Masculino">Varón</option>
                          <option value="Femenino">Mujer</option>
                        </select>
                      </div>

                      <div>
                        <div style={refinedLabelStyle}>
                          <span>Fecha de Nacimiento</span>
                        </div>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          style={refinedInputStyle}
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={!dni || !nombres}
                    onClick={() => setStep(2)}
                    className="btn-modern-primary"
                    style={{
                      opacity: (!dni || !nombres) ? 0.5 : 1,
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.5rem' }}>
                <div>
                  <div style={refinedLabelStyle}>
                    <span>Celular / WhatsApp Principal <span style={{ color: '#DC2626' }}>*</span></span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Ej. 987654321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={refinedInputStyle}
                  />
                </div>

                <div>
                  <div style={refinedLabelStyle}>
                    <span>Correo Electrónico (Opcional)</span>
                  </div>
                  <input
                    type="email"
                    placeholder="Ej. mi.correo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={refinedInputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={refinedLabelStyle}>
                      <span>Departamento</span>
                    </div>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      style={refinedInputStyle}
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
                    <div style={refinedLabelStyle}>
                      <span>Distrito</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Ej. Cangallo"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      style={refinedInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <div style={refinedLabelStyle}>
                    <span>Dirección o Referencia</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Jr. Sucre 240 / Cerca a la Plaza Central"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={refinedInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={!phone}
                  onClick={() => setStep(3)}
                  className="btn-modern-primary"
                  style={{
                    opacity: !phone ? 0.5 : 1,
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
              {/* Selector de Rol Limpio y Elegante */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Selecciona tu Rol Institucional:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
                          border: active ? '2px solid #D97706' : '1.5px solid #E5E7EB',
                          background: active ? '#FFFBEB' : '#FFFFFF',
                          color: '#1F2937',
                          borderRadius: '14px',
                          padding: '14px 6px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          boxShadow: active ? '0 4px 14px rgba(217, 119, 6, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: '3px' }}>{item.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: active ? '#92400E' : '#1F2937' }}>{item.label}</div>
                        <div style={{ fontSize: '0.72rem', color: active ? '#B45309' : '#6B7280', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Año de Afiliación */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Año de Ingreso a Cangallo Señorial:</span>
                </div>
                <select
                  value={affiliationYear}
                  onChange={e => setAffiliationYear(e.target.value)}
                  style={refinedInputStyle}
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
                marginBottom: '1.5rem',
                background: '#FAF7F2',
                borderRadius: '14px',
                padding: '1.1rem',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1F2937' }}>
                    ¿Tienes familiares en la comparsa?
                  </span>
                  <input
                    type="checkbox"
                    checked={hasRelatives}
                    onChange={e => setHasRelatives(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#D97706', cursor: 'pointer' }}
                  />
                </div>

                {hasRelatives && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Ej. Mi hermano Carlos y mi prima Rosa"
                      value={relativesDetail}
                      onChange={e => setRelativesDetail(e.target.value)}
                      style={refinedInputStyle}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-modern-primary"
              >
                Continuar al Paso 4 ➔
              </button>
            </div>
          )}

          {/* ==================== PASO 4: TALENTOS, VESTUARIO, PIN & FOTO ==================== */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              {/* Disciplinas y Talentos */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Disciplinas & Talentos Artísticos:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                          border: isSelected ? '1.5px solid #D97706' : '1px solid #E5E7EB',
                          background: isSelected ? '#FEF3C7' : '#FFFFFF',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 2px 8px rgba(217, 119, 6, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isSelected ? '#92400E' : '#1F2937' }}>{item.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{item.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: isSelected ? '#D97706' : '#D1D5DB' }}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrumento si es Músico */}
              {selectedTalents.includes('Música') && (
                <div style={{ marginBottom: '1.25rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '0.9rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '6px' }}>
                    🎺 ¿Qué instrumento tocas?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mandolina, Quena, Guitarra, Trompeta"
                    value={musicalInstrument}
                    onChange={e => setMusicalInstrument(e.target.value)}
                    style={{ ...refinedInputStyle, background: '#FFFFFF' }}
                  />
                </div>
              )}

              {/* Selector de Talla de Vestuario */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Talla de Vestuario para Carnaval 2027:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const active = clothingSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setClothingSize(size)}
                        className={`btn-modern-pill ${active ? 'active' : ''}`}
                        style={{
                          height: '44px',
                          fontSize: '0.95rem'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN de Seguridad */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>PIN de Acceso a tu Perfil (4 dígitos):</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  style={{
                    ...refinedInputStyle,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: '1.2rem'
                  }}
                />
              </div>

              {/* Fotografía al Final */}
              <div style={{
                marginBottom: '1.5rem',
                background: '#FAF7F2',
                border: '1.5px dashed #D97706',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                  📸 Fotografía / Selfie para tu Carnet QR
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 0.85rem 0' }}>
                  Tómate una selfie con tu celular o elige una foto de tu rostro:
                </p>

                {avatarUrl ? (
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <img
                      src={avatarUrl}
                      alt="Foto de Perfil"
                      style={{ width: '95px', height: '95px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D97706', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      style={{ position: 'absolute', bottom: 0, right: 0, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '26px', height: '26px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                      className="btn-modern-base"
                      style={{
                        padding: '0.75rem 1.4rem',
                        color: '#374151',
                        gap: '6px'
                      }}
                    >
                      <CameraIcon size={18} color="#374151" /> Tomar Foto / Elegir Archivo
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-modern-primary"
                style={{
                  opacity: loading ? 0.6 : 1,
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
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#D1FAE5',
                color: '#059669',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
              }}>
                ✓
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.7rem', color: '#1F2937', fontWeight: 900, marginBottom: '0.25rem' }}>
                ¡EMPADRONAMIENTO EXITOSO!
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', marginBottom: '1.25rem' }}>
                Ya eres parte del <strong>Padrón Oficial Carnaval 2027</strong> de Cangallo Señorial.
              </p>

              {/* Tarjeta de Lujo del Carnet */}
              <div style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.6rem 1.4rem',
                maxWidth: '360px',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                border: '2.5px solid #D97706',
                position: 'relative',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 900, marginBottom: '0.35rem' }}>
                  CARNET DIGITAL OFICIAL • 2027
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: 1.15, marginBottom: '0.85rem' }}>
                  CANGALLO SEÑORIAL
                </div>

                <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FCD34D', margin: '0 auto 0.75rem auto', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={savedUser.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  {savedUser.name}
                </div>

                <div style={{
                  display: 'inline-block',
                  background: 'rgba(217, 119, 6, 0.25)',
                  border: '1.5px solid #FCD34D',
                  color: '#FCD34D',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  letterSpacing: '1.2px',
                  padding: '3px 12px',
                  borderRadius: '10px',
                  marginBottom: '0.5rem'
                }}>
                  CÓDIGO: {savedUser.affiliationYear || '2027'}{savedUser.dni}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#E5E7EB', fontWeight: 500, marginBottom: '0.85rem' }}>
                  DNI: {savedUser.dni} &bull; Talla: {savedUser.clothingSize || 'L'}
                </div>

                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '14px', display: 'inline-block', marginBottom: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${savedUser.qr_code_hash}`}
                    alt="QR Asistencia"
                    style={{ width: '135px', height: '135px', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '0.76rem', color: '#FCD34D', fontWeight: 700 }}>
                  {savedUser.memberType === 'MUSICO' ? '🎺 Músico de Banda' : savedUser.memberType === 'DIRECTIVO' ? '👑 Comité Directivo' : '💃 Socio Danzante'} &bull; Cangallo Señorial
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.25rem' }}>
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
                  className="btn-modern-base"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1.4rem',
                    color: '#92400E',
                    background: '#FFFBEB',
                    borderColor: '#FDE68A'
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
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '400px',
            width: '100%',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            border: '1.5px solid #E5E7EB',
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
                width: '30px',
                height: '30px',
                fontSize: '0.95rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}>
              <LockIcon size={22} color="#D97706" />
            </div>

            <h3 style={{
              fontFamily: 'var(--font-playfair, serif)',
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#1F2937',
              margin: '0 0 0.3rem 0'
            }}>
              Acceso de Directiva
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 1.25rem 0' }}>
              Ingresa las credenciales autorizadas para consultar el Padrón General y descargar reportes.
            </p>

            {adminError && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.7rem',
                background: '#FEE2E2',
                border: '1px solid #EF4444',
                color: '#B91C1C',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                ⚠️ {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Usuario:</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej. administrador"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  style={refinedInputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.35rem' }}>
                <div style={refinedLabelStyle}>
                  <span>Contraseña:</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  style={refinedInputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn-modern-primary"
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
