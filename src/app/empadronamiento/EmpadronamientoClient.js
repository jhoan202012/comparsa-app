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

  // Manejador de Foto / Selfie con compresión en Canvas (Al final)
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

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', fontFamily: 'var(--font-inter, sans-serif)' }}>
      
      {/* ==================== GOOGLE STITCH APP HEADER ==================== */}
      {step < 5 && (
        <div style={{ marginBottom: '1.75rem' }}>
          {/* Top Bar con Botón Volver y Paso */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#002F18',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                ←
              </button>
            ) : (
              <Link
                href="/"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#002F18',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                ←
              </Link>
            )}

            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '4px 14px',
              borderRadius: '9999px'
            }}>
              PASO {step} DE 4
            </div>

            <div style={{ width: '40px' }} />
          </div>

          {/* Barra de Progreso Fina de Stitch */}
          <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(step / 4) * 100}%`,
              background: 'linear-gradient(90deg, #002F18 0%, #D99B00 100%)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>
      )}

      {/* ==================== HERO DE SECCIÓN ==================== */}
      {step < 5 && (
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          {/* Badge Dorado */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(217, 155, 0, 0.12)',
            border: '1px solid rgba(217, 155, 0, 0.35)',
            color: '#7D5800',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            padding: '4px 14px',
            borderRadius: '9999px',
            marginBottom: '0.75rem'
          }}>
            <span>✨</span> CANGALLO SEÑORIAL 2027
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair, "Libre Caslon Text", serif)',
            fontSize: '1.9rem',
            fontWeight: 900,
            color: '#002F18',
            lineHeight: 1.15,
            margin: '0 0 0.5rem 0'
          }}>
            {step === 1 && 'Validación de Identidad'}
            {step === 2 && 'Contacto & Residencia'}
            {step === 3 && 'Membresía & Familia'}
            {step === 4 && 'Talentos & Fotografía'}
          </h1>

          <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: 0, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            {step === 1 && 'Ingresa tu DNI para autocompletar tus datos oficiales de RENIEC.'}
            {step === 2 && 'Indica tu WhatsApp principal para recibir comunicados oficiales.'}
            {step === 3 && 'Selecciona tu rol institucional en la comparsa y familiares.'}
            {step === 4 && 'Elige tu talla de vestuario, disciplinas y sube tu foto carnet.'}
          </p>
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.9rem 1.1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ==================== TARJETA PRINCIPAL (GOOGLE STITCH SPEC) ==================== */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '24px',
        boxShadow: '0 16px 40px rgba(0, 47, 24, 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Borde Superior Dorado Sutil */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #D99B00 0%, #FEBB30 50%, #D99B00 100%)',
          width: '100%'
        }} />

        <div style={{ padding: '2rem 1.75rem' }}>

          {/* ==================== PASO 1: VALIDACIÓN DNI ==================== */}
          {step === 1 && (
            <div>
              {/* Campo DNI Principal con Look Premium */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    NÚMERO DE DNI (8 DÍGITOS)
                  </label>
                  {dniLoading && (
                    <span style={{ fontSize: '0.75rem', color: '#002F18', fontWeight: 800 }}>
                      🔍 Consultando RENIEC...
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
                      width: '100%',
                      padding: '1rem 1.25rem',
                      borderRadius: '16px',
                      border: dniVerified ? '2px solid #10B981' : '1.5px solid #D1D5DB',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      letterSpacing: '3px',
                      background: '#FFF8F5',
                      color: '#002F18',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'border 0.2s ease'
                    }}
                  />
                  {dniVerified && !alreadyRegisteredUser && (
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: '#10B981', color: '#FFFFFF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>

                {dniVerified && !alreadyRegisteredUser && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛡️</span> <span>Identidad Verificada Oficialmente</span>
                  </div>
                )}
              </div>

              {/* Mensaje si el usuario ya está empadronado: ULTRA LIMPIO */}
              {alreadyRegisteredUser ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  background: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  color: '#92400E',
                  borderRadius: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                }}>
                  ⚠️ El usuario ya se encuentra empadronado.
                </div>
              ) : (
                <>
                  {/* Campos de Identidad Desglosados */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.75rem' }}>
                    
                    {/* Nombres */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                        Nombres Oficiales {isLocked && <span style={{ color: '#D99B00' }}>🔒</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Jhoan"
                        value={nombres}
                        readOnly={isLocked}
                        onChange={e => setNombres(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: isLocked ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                          fontSize: '1rem',
                          fontWeight: 700,
                          background: isLocked ? '#F0FDF4' : '#FFFFFF',
                          color: isLocked ? '#065F46' : '#1E1B18',
                          cursor: isLocked ? 'not-allowed' : 'text',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                        Apellidos Oficiales {isLocked && <span style={{ color: '#D99B00' }}>🔒</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Taboada Huaman"
                        value={apellidos}
                        readOnly={isLocked}
                        onChange={e => setApellidos(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: isLocked ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                          fontSize: '1rem',
                          fontWeight: 700,
                          background: isLocked ? '#F0FDF4' : '#FFFFFF',
                          color: isLocked ? '#065F46' : '#1E1B18',
                          cursor: isLocked ? 'not-allowed' : 'text',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Fila: Sexo & Nacimiento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                          Sexo / Género
                        </label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '12px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            background: '#FFFFFF',
                            color: '#1E1B18',
                            outline: 'none'
                          }}
                        >
                          <option value="Masculino">Varón</option>
                          <option value="Femenino">Mujer</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                          Nacimiento
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '12px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            background: '#FFFFFF',
                            color: '#1E1B18',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={!dni || !nombres}
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%',
                      padding: '1.1rem',
                      borderRadius: '16px',
                      background: (!dni || !nombres) ? '#CBD5E1' : 'linear-gradient(135deg, #002F18 0%, #0E472A 100%)',
                      color: '#FFFFFF',
                      border: (!dni || !nombres) ? 'none' : '1px solid #D99B00',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      cursor: (!dni || !nombres) ? 'not-allowed' : 'pointer',
                      boxShadow: (!dni || !nombres) ? 'none' : '0 8px 24px rgba(0, 47, 24, 0.28)',
                      transition: 'all 0.2s ease'
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                    Celular / WhatsApp Principal <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 987654321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      borderRadius: '14px',
                      border: '1.5px solid #D1D5DB',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      background: '#FFF8F5',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. mi.correo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                      Departamento
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        outline: 'none'
                      }}
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
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                      Distrito
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cangallo"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.3rem' }}>
                    Dirección o Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Jr. Sucre 240 / Cerca a la Plaza Central"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={!phone}
                  onClick={() => setStep(3)}
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    borderRadius: '16px',
                    background: !phone ? '#CBD5E1' : 'linear-gradient(135deg, #002F18 0%, #0E472A 100%)',
                    color: '#FFFFFF',
                    border: !phone ? 'none' : '1px solid #D99B00',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: !phone ? 'not-allowed' : 'pointer',
                    boxShadow: !phone ? 'none' : '0 8px 24px rgba(0, 47, 24, 0.28)'
                  }}
                >
                  Continuar al Paso 3 ➔
                </button>
              </div>
            </div>
          )}

          {/* ==================== PASO 3: MEMBRESÍA & FAMILIA (STITCH TACTILE TILES) ==================== */}
          {step === 3 && (
            <div>
              {/* Selector de Rol en Tarjetas de Lujo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.6rem' }}>
                  Selecciona tu Rol Institucional:
                </label>
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
                          border: active ? '2px solid #D99B00' : '1.5px solid #E5E7EB',
                          background: active ? '#002F18' : '#FFF8F5',
                          color: active ? '#FFFFFF' : '#1E1B18',
                          borderRadius: '16px',
                          padding: '14px 8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          boxShadow: active ? '0 6px 16px rgba(0, 47, 24, 0.25)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{item.icon}</div>
                        <div style={{ fontWeight: 900, fontSize: '0.92rem', color: active ? '#FCD34D' : '#002F18' }}>{item.label}</div>
                        <div style={{ fontSize: '0.72rem', color: active ? '#A7F3D0' : '#6B7280', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Año de Afiliación */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.4rem' }}>
                  Año de Ingreso a Cangallo Señorial:
                </label>
                <select
                  value={affiliationYear}
                  onChange={e => setAffiliationYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '14px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: '#FFFFFF',
                    color: '#002F18',
                    outline: 'none'
                  }}
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
              <div style={{ marginBottom: '1.75rem', background: '#FFF8F5', borderRadius: '16px', padding: '1.1rem', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#002F18' }}>
                    ¿Tienes familiares en la comparsa?
                  </span>
                  <input
                    type="checkbox"
                    checked={hasRelatives}
                    onChange={e => setHasRelatives(e.target.checked)}
                    style={{ width: '22px', height: '22px', accentColor: '#002F18', cursor: 'pointer' }}
                  />
                </div>

                {hasRelatives && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Ej. Mi hermano Carlos y mi prima Rosa"
                      value={relativesDetail}
                      onChange={e => setRelativesDetail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.88rem',
                        background: '#FFFFFF',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #002F18 0%, #0E472A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #D99B00',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 47, 24, 0.28)'
                }}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
                  Disciplinas & Talentos Artísticos:
                </label>
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
                          border: isSelected ? '1.5px solid #002F18' : '1px solid #E5E7EB',
                          background: isSelected ? '#ECFDF5' : '#FFFFFF',
                          borderRadius: '14px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#002F18' : '#1E1B18' }}>{item.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{item.desc}</div>
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: isSelected ? '#002F18' : '#D1D5DB' }}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrumento si es Músico */}
              {selectedTalents.includes('Música') && (
                <div style={{ marginBottom: '1.25rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '14px', padding: '0.9rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '0.35rem' }}>
                    🎺 ¿Qué instrumento tocas?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Guitarra, Mandolina, Quena, Trompeta"
                    value={musicalInstrument}
                    onChange={e => setMusicalInstrument(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #F59E0B', fontSize: '0.9rem', background: '#FFFFFF', outline: 'none' }}
                  />
                </div>
              )}

              {/* Selector de Talla de Vestuario (Pills) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
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
                        style={{
                          padding: '0.85rem 0',
                          borderRadius: '12px',
                          border: active ? '2px solid #D99B00' : '1px solid #D1D5DB',
                          background: active ? '#002F18' : '#FFF8F5',
                          color: active ? '#FFFFFF' : '#1E1B18',
                          fontWeight: 900,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: active ? '0 4px 12px rgba(0, 47, 24, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
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
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.4rem' }}>
                  PIN de Acceso a tu Perfil (4 dígitos):
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    background: '#FFF8F5',
                    color: '#002F18',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Fotografía al Final (Módulo Stitch Avatar Upload) */}
              <div style={{
                marginBottom: '1.75rem',
                background: '#FFF8F5',
                border: '1.5px dashed #D99B00',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#7D5800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                  📸 FOTOGRAFÍA / SELFIE PARA TU CARNET QR
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 1rem 0' }}>
                  Tómate una selfie con tu celular o elige una foto de tu rostro:
                </p>

                {avatarUrl ? (
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <img
                      src={avatarUrl}
                      alt="Foto de Perfil"
                      style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3.5px solid #D99B00', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
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
                      style={{
                        padding: '0.85rem 1.6rem',
                        borderRadius: '14px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1.5px solid #F59E0B',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
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
                style={{
                  width: '100%',
                  padding: '1.15rem',
                  borderRadius: '16px',
                  background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #002F18 0%, #0E472A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #D99B00',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 47, 24, 0.35)'
                }}
              >
                {loading ? 'Generando Carnet Oficial 2027...' : '✓ Finalizar Empadronamiento'}
              </button>
            </form>
          )}

          {/* ==================== PASO 5: CARNET DIGITAL OFICIAL (GOOGLE STITCH LUXURY SPEC) ==================== */}
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
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
              }}>
                ✓
              </div>

              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.75rem', color: '#002F18', fontWeight: 900, marginBottom: '0.25rem' }}>
                ¡EMPADRONAMIENTO EXITOSO!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                Ya eres parte del <strong>Padrón Oficial Carnaval 2027</strong> de Cangallo Señorial.
              </p>

              {/* Tarjeta de Lujo del Carnet (Stitch Spec) */}
              <div style={{
                background: 'linear-gradient(135deg, #002F18 0%, #0E472A 70%, #1A3624 100%)',
                color: '#FFFFFF',
                borderRadius: '24px',
                padding: '1.75rem',
                maxWidth: '380px',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 20px 48px rgba(0, 47, 24, 0.4)',
                border: '2.5px solid #D99B00',
                position: 'relative',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 900, marginBottom: '0.35rem' }}>
                  CARNET DIGITAL OFICIAL • 2027
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: 1.15, marginBottom: '0.9rem' }}>
                  CANGALLO SEÑORIAL
                </div>

                <div style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3.5px solid #FCD34D', margin: '0 auto 0.85rem auto', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={savedUser.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  {savedUser.name}
                </div>

                <div style={{
                  display: 'inline-block',
                  background: 'rgba(217, 155, 0, 0.25)',
                  border: '1.5px solid #FCD34D',
                  color: '#FCD34D',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  letterSpacing: '1.2px',
                  padding: '4px 14px',
                  borderRadius: '10px',
                  marginBottom: '0.6rem'
                }}>
                  CÓDIGO: {savedUser.affiliationYear || '2027'}{savedUser.dni}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#E5E7EB', fontWeight: 600, marginBottom: '0.9rem' }}>
                  DNI: {savedUser.dni} &bull; Talla: {savedUser.clothingSize || 'L'}
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '18px', display: 'inline-block', marginBottom: '0.85rem', boxShadow: '0 6px 18px rgba(0,0,0,0.3)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${savedUser.qr_code_hash}`}
                    alt="QR Asistencia"
                    style={{ width: '145px', height: '145px', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: '#A7F3D0', fontWeight: 700 }}>
                  {savedUser.memberType === 'MUSICO' ? '🎺 Músico de Banda' : savedUser.memberType === 'DIRECTIVO' ? '👑 Comité Directivo' : '💃 Socio Danzante'} &bull; Cangallo Señorial
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                💡 Toma una <strong>captura de pantalla</strong> a este carnet para tenerlo listo en cada ensayo.
              </p>

              <div style={{ maxWidth: '380px', margin: '0 auto' }}>
                <Link
                  href="/login"
                  style={{
                    display: 'block',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #002F18 0%, #0E472A 100%)',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    fontWeight: 900,
                    textDecoration: 'none',
                    fontSize: '1rem',
                    border: '1px solid #D99B00',
                    boxShadow: '0 8px 24px rgba(0, 47, 24, 0.3)'
                  }}
                >
                  Ir a Mi Perfil en la App ➔
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
