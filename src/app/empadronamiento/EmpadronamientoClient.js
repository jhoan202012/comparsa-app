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

  // Paso 1: Identidad (Campos Desglosados y Bloqueables)
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Masculino'); // 'Masculino' | 'Femenino'

  // Paso 2: Contacto & Residencia
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Ayacucho');
  const [province, setProvince] = useState('Cangallo');
  const [district, setDistrict] = useState('Cangallo');
  const [address, setAddress] = useState('');

  // Paso 3: Trayectoria & Familia
  const [memberType, setMemberType] = useState('SOCIO'); // SOCIO, MUSICO, DIRECTIVO
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
            setIsLocked(true); // Bloquear campos automáticamente
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

  // Enviar Formulario Final
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const fullName = `${nombres} ${apellidos}`.trim();

    try {
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
        setStep(5); // Pantalla final con Carnet Oficial QR
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
    <div style={{ background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 10px 30px rgba(19, 96, 58, 0.08)', border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
      
      {/* Cabecera Oficial */}
      <div style={{ background: 'linear-gradient(135deg, #0E472A 0%, #13603A 65%, #1C1917 100%)', color: '#FFFFFF', padding: '1.5rem', textAlign: 'center', borderBottom: '3.5px solid #D99B00' }}>
        <div style={{ display: 'inline-block', background: 'rgba(217, 155, 0, 0.25)', border: '1px solid #FCD34D', color: '#FCD34D', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px', marginBottom: '0.5rem' }}>
          Carnaval Ayacuchano 2027
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
          EMPADRONAMIENTO OFICIAL
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#E5E7EB', margin: 0 }}>
          Comparsa Cangallo Señorial • Padrón General de Socios Activos
        </p>
      </div>

      {/* Barra de Progreso (Pasos 1 a 4) */}
      {step < 5 && (
        <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem', background: '#FAF7F2', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #4B5563)' }}>
            <span style={{ color: step >= 1 ? '#13603A' : '#9CA3AF' }}>1. Identidad DNI</span>
            <span style={{ color: step >= 2 ? '#13603A' : '#9CA3AF' }}>2. Contacto</span>
            <span style={{ color: step >= 3 ? '#13603A' : '#9CA3AF' }}>3. Membresía</span>
            <span style={{ color: step >= 4 ? '#13603A' : '#9CA3AF' }}>4. Talentos & Foto</span>
          </div>
          <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'linear-gradient(90deg, #13603A, #D99B00)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {errorMsg && (
        <div style={{ margin: '1rem 1.5rem 0 1.5rem', padding: '0.85rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Contenido por Pasos */}
      <div style={{ padding: '1.5rem' }}>

        {/* ==================== PASO 1: IDENTIDAD DNI DESGLOSADA Y BLOQUEADA ==================== */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#13603A', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Paso 1: Validación de Identidad por DNI
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Digita tu DNI de 8 dígitos para autocompletar y verificar tu identidad oficial:
            </p>

            {/* DNI con autolookup */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                  Nº de DNI (8 dígitos): <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {dniLoading && (
                  <span style={{ fontSize: '0.78rem', color: '#13603A', fontWeight: 700 }}>
                    🔍 Validando en tiempo real...
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={8}
                placeholder="Escribe tu DNI (Ej. 74839201)"
                value={dni}
                onChange={e => handleDniInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: dniVerified ? '2px solid #10B981' : '1px solid #D1D5DB',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  background: '#FAF7F2',
                  outline: 'none'
                }}
              />
              {dniVerified && !alreadyRegisteredUser && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ✅ <span>Identidad Verificada con RENIEC</span>
                </div>
              )}
            </div>

            {/* Si el socio ya está empadronado en el sistema */}
            {alreadyRegisteredUser ? (
              <div style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                background: '#FEF3C7',
                border: '1.5px solid #F59E0B',
                color: '#92400E',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                textAlign: 'center'
              }}>
                ⚠️ El usuario ya se encuentra empadronado.
              </div>
            ) : (
              <>
                {/* Banner de Bloqueo de Seguridad */}
                {isLocked && (
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '0.65rem 0.9rem',
                    marginBottom: '1.1rem',
                    fontSize: '0.78rem',
                    color: '#065F46',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🔒 <strong>Datos Oficiales Bloqueados:</strong> La información obtenida de tu DNI no puede ser modificada para garantizar la validez del padrón.
                  </div>
                )}

                {/* Nombres y Apellidos Desglosados */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                      Nombre: <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Jhoan"
                      value={nombres}
                      readOnly={isLocked}
                      onChange={e => setNombres(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: isLocked ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        background: isLocked ? '#F0FDF4' : '#FFFFFF',
                        color: isLocked ? '#065F46' : '#111827',
                        cursor: isLocked ? 'not-allowed' : 'text',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                      Apellidos: <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Taboada Huaman"
                      value={apellidos}
                      readOnly={isLocked}
                      onChange={e => setApellidos(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: isLocked ? '1.5px solid #10B981' : '1px solid #D1D5DB',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        background: isLocked ? '#F0FDF4' : '#FFFFFF',
                        color: isLocked ? '#065F46' : '#111827',
                        cursor: isLocked ? 'not-allowed' : 'text',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Sexo y Fecha de Nacimiento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                      Sexo / Género:
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    >
                      <option value="Masculino">Varón</option>
                      <option value="Femenino">Mujer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                      Fecha de Nacimiento:
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.8rem',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        color: '#111827',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!dni || !nombres}
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '14px',
                    background: (!dni || !nombres) ? '#9CA3AF' : '#13603A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: (!dni || !nombres) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(19, 96, 58, 0.25)'
                  }}
                >
                  Continuar al Paso 2 ➔
                </button>
              </>
            )}
          </div>
        )}

        {/* ==================== PASO 2: CONTACTO & RESIDENCIA ==================== */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#13603A', fontWeight: 800, marginBottom: '0.35rem' }}>
              📍 Paso 2: Contacto & Residencia
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              ¿Dónde resides actualmente y a qué número de WhatsApp podemos coordinar?
            </p>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                Celular / WhatsApp Principal: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="tel"
                placeholder="Ej. 987654321"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                Correo Electrónico (Opcional):
              </label>
              <input
                type="email"
                placeholder="Ej. socio@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                  Región / Departamento:
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.9rem', background: '#FFFFFF', outline: 'none' }}
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
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                  Distrito de Residencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cangallo / San Juan / Los Olivos"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                Dirección / Referencia (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Jr. Sucre 240 / Cerca a la Plaza"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: '#F3F4F6', color: '#374151', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ⬅ Volver
              </button>
              <button
                type="button"
                disabled={!phone}
                onClick={() => setStep(3)}
                style={{ flex: 2, padding: '0.85rem', borderRadius: '12px', background: !phone ? '#9CA3AF' : '#13603A', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: !phone ? 'not-allowed' : 'pointer' }}
              >
                Continuar al Paso 3 ➔
              </button>
            </div>
          </div>
        )}

        {/* ==================== PASO 3: MEMBRESÍA & FAMILIA ==================== */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#13603A', fontWeight: 800, marginBottom: '0.35rem' }}>
              🏛️ Paso 3: Membresía & Familiares
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Tu rol institucional en Cangallo Señorial y vínculos familiares:
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.4rem' }}>
                Tipo de Socio / Rol Institucional:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'SOCIO', label: '💃 Danzante', desc: 'Bailarín(a) de comparsa' },
                  { id: 'MUSICO', label: '🎺 Músico', desc: 'Banda / Orquesta' },
                  { id: 'DIRECTIVO', label: '👑 Directivo', desc: 'Comité / Delegado' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setMemberType(item.id)}
                    style={{
                      border: memberType === item.id ? '2px solid #13603A' : '1px solid #D1D5DB',
                      background: memberType === item.id ? '#ECFDF5' : '#FFFFFF',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: memberType === item.id ? '#13603A' : '#111827' }}>{item.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                ¿Desde qué año integras Cangallo Señorial? (Año de Ingreso):
              </label>
              <select
                value={affiliationYear}
                onChange={e => setAffiliationYear(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.95rem', fontWeight: 600, background: '#FFFFFF', outline: 'none' }}
              >
                <option value="2027">🌟 2027 (Nuevo Integrante)</option>
                <option value="2026">2026 (1 año de antigüedad)</option>
                <option value="2025">2025 (2 años de antigüedad)</option>
                <option value="2024">2024 (3 años de antigüedad)</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2020">2020 o anterior (Socio Tradicional)</option>
                <option value="2015">2015 o anterior (Socio Fundador / Veterano)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem', background: '#FAF7F2', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                  ¿Tienes familiares directos en la comparsa?
                </span>
                <input
                  type="checkbox"
                  checked={hasRelatives}
                  onChange={e => setHasRelatives(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#13603A', cursor: 'pointer' }}
                />
              </div>

              {hasRelatives && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Ej. Mi hermano Carlos Huayanay y mi prima Rosa"
                    value={relativesDetail}
                    onChange={e => setRelativesDetail(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFFFFF', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block', marginTop: '3px' }}>
                    Nos ayuda a organizar filas familiares y bloques en pasacalle.
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: '#F3F4F6', color: '#374151', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ⬅ Volver
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                style={{ flex: 2, padding: '0.85rem', borderRadius: '12px', background: '#13603A', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Continuar al Paso 4 ➔
              </button>
            </div>
          </div>
        )}

        {/* ==================== PASO 4: TALENTOS, VESTUARIO, PIN & FOTOGRAFÍA AL FINAL ==================== */}
        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '1.25rem', color: '#13603A', fontWeight: 800, marginBottom: '0.35rem' }}>
              🎨 Paso 4: Talentos, Vestuario & Fotografía Final
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Completa tus disciplinas, talla de ropa, PIN y sube tu foto para el carnet QR:
            </p>

            {/* Talentos Selección */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.4rem' }}>
                Disciplinas y Talentos (Selecciona todas las que apliquen):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'Danza', label: '💃 Danza', sub: 'Danzante / Coreógrafo' },
                  { id: 'Canto', label: '🎤 Canto', sub: 'Solista / Corista' },
                  { id: 'Música', label: '🎺 Música', sub: 'Toca instrumento' },
                  { id: 'Creación', label: '✍️ Creación', sub: 'Compositor / Letrista' },
                  { id: 'Arte', label: '📸 Arte & Foto', sub: 'Fotografía / Video / Redes' },
                  { id: 'Bordado', label: '🧵 Vestuario', sub: 'Confección / Bordado' }
                ].map(item => {
                  const isSelected = selectedTalents.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTalentToggle(item.id)}
                      style={{
                        border: isSelected ? '2px solid #13603A' : '1px solid #D1D5DB',
                        background: isSelected ? '#ECFDF5' : '#FFFFFF',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#13603A' : '#111827' }}>{item.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{item.sub}</div>
                      </div>
                      <span style={{ fontSize: '1rem', color: isSelected ? '#13603A' : '#D1D5DB' }}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instrumento si seleccionó Música */}
            {selectedTalents.includes('Música') && (
              <div style={{ marginBottom: '1.1rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '0.85rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '0.35rem' }}>
                  🎺 ¿Qué instrumento musical tocas?
                </label>
                <input
                  type="text"
                  placeholder="Ej. Guitarra, Mandolina, Quena, Violín, Trompeta, Bombo"
                  value={musicalInstrument}
                  onChange={e => setMusicalInstrument(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #F59E0B', fontSize: '0.88rem', background: '#FFFFFF', outline: 'none' }}
                />
              </div>
            )}

            {/* Talla de Vestuario */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.4rem' }}>
                Talla de Vestuario para Carnaval 2027:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setClothingSize(size)}
                    style={{
                      padding: '0.7rem 0',
                      borderRadius: '10px',
                      border: clothingSize === size ? '2.5px solid #13603A' : '1px solid #D1D5DB',
                      background: clothingSize === size ? '#13603A' : '#FFFFFF',
                      color: clothingSize === size ? '#FFFFFF' : '#111827',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN de 4 dígitos */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                Crea tu PIN de Acceso (4 dígitos):
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="Ej. 1234"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '4px', textAlign: 'center', background: '#FAF7F2', outline: 'none' }}
              />
            </div>

            {/* FOTOGRAFÍA AL FINAL DEL FORMULARIO (REQUERIMIENTO DEL USUARIO) */}
            <div style={{ marginBottom: '1.5rem', background: '#FAF7F2', border: '1.5px dashed #D99B00', borderRadius: '14px', padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.25rem' }}>
                Paso Final • Emisión de Carnet
              </div>
              <label style={{ fontSize: '0.92rem', fontWeight: 800, color: '#13603A', display: 'block', marginBottom: '0.5rem' }}>
                📸 Sube tu Fotografía o Tómate una Selfie:
              </label>

              {avatarUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <img src={avatarUrl} alt="Preview" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3.5px solid #13603A', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'none', border: 'none', color: '#13603A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cambiar fotografía
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: '#13603A', color: '#FFFFFF', padding: '0.75rem 1.3rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(19, 96, 58, 0.2)' }}
                  >
                    📷 Tomar Foto / Subir desde Celular
                  </button>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.4rem' }}>
                    Esta foto aparecerá impresa en tu Carnet Digital Oficial 2027
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '14px', background: '#F3F4F6', color: '#374151', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                ⬅ Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(135deg, #13603A 0%, #0E472A 100%)', color: '#FFFFFF', border: 'none', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(19, 96, 58, 0.35)' }}
              >
                {loading ? 'Generando Carnet...' : 'Completar Empadronamiento 🚀'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== PASO 5: ÉXITO & CARNET OFICIAL QR ==================== */}
        {step === 5 && savedUser && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
              ✓
            </div>

            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', color: '#13603A', fontWeight: 900, marginBottom: '0.25rem' }}>
              ¡EMPADRONAMIENTO EXITOSO!
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '1.25rem' }}>
              Ya eres parte del <strong>Padrón Oficial Carnaval 2027</strong> de la Comparsa Cangallo Señorial.
            </p>

            {/* CARNET DIGITAL OFICIAL */}
            <div style={{
              background: 'linear-gradient(135deg, #092B1A 0%, #13603A 70%, #1C1917 100%)',
              color: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.5rem',
              maxWidth: '360px',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              border: '2.5px solid #D99B00',
              position: 'relative',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 800, marginBottom: '0.35rem' }}>
                CARNET DIGITAL OFICIAL • 2027
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-playfair, serif)', color: '#FFFFFF', lineHeight: '1.15', marginBottom: '0.85rem' }}>
                CANGALLO SEÑORIAL
              </div>

              {/* Foto de Perfil */}
              <div style={{ width: '78px', height: '78px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FCD34D', margin: '0 auto 0.75rem auto', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={savedUser.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Nombre, Código de Socio y DNI */}
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                {savedUser.name}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(217, 155, 0, 0.25)',
                border: '1px solid #FCD34D',
                color: '#FCD34D',
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '1px',
                padding: '3px 12px',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }}>
                CÓDIGO: {savedUser.affiliationYear || '2027'}{savedUser.dni}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#E5E7EB', fontWeight: 600, marginBottom: '0.85rem' }}>
                DNI: {savedUser.dni} &bull; Talla: {savedUser.clothingSize || 'L'}
              </div>

              {/* Código QR Generado */}
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '14px', display: 'inline-block', marginBottom: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${savedUser.qr_code_hash}`}
                  alt="QR Asistencia"
                  style={{ width: '135px', height: '135px', display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 600 }}>
                {savedUser.memberType === 'MUSICO' ? '🎺 Músico de Banda' : savedUser.memberType === 'DIRECTIVO' ? '👑 Comité Directivo' : '💃 Socio Danzante'} &bull; Cangallo Señorial
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              💡 <strong>Consejo:</strong> Toma una <strong>captura de pantalla</strong> a este carnet o guárdalo en tus fotos para mostrarlo en la puerta de los ensayos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
              <Link
                href="/login"
                style={{ display: 'block', padding: '0.85rem', background: '#13603A', color: '#FFFFFF', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
              >
                Ir a Mi Perfil en la App ➔
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
