const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cargar Logo institucional en Base64
const logoPath = path.join(__dirname, '..', 'public', 'images', 'Logo_1.jpg');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  logoBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(logoPath).toString('base64');
}

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dossier Ejecutivo Horizontal - Plataforma Digital Cangallo Señorial 2027</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');

    @page {
      size: 297mm 210mm; /* A4 Horizontal Landscape */
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #111827;
      background: #FAF7F2;
      line-height: 1.4;
      font-size: 11.5px;
    }

    .page {
      width: 297mm;
      height: 210mm;
      max-height: 210mm;
      padding: 12mm 15mm;
      background: #FFFFFF;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* COLORES INSTITUCIONALES CANGALLO SEÑORIAL */
    :root {
      --primary: #13603A;       /* Verde Esmeralda */
      --primary-dark: #0E472A;  /* Verde Bosque Oscuro */
      --gold: #D99B00;          /* Dorado Festivo */
      --gold-dark: #B45309;     /* Ámbar Profundo */
      --gold-bg: #FEF3C7;       /* Crema Dorado */
      --accent-red: #B71C1C;    /* Rojo Ayacucho */
      --dark: #111827;          /* Texto Oscuro */
      --muted: #4B5563;         /* Gris Slate */
      --border: #E5E7EB;
      --linen: #FAF7F2;
    }

    /* HEADER HORIZONTAL */
    .header-banner {
      background: linear-gradient(135deg, #0E472A 0%, #13603A 60%, #1C1917 100%);
      color: #FFFFFF;
      padding: 12px 18px;
      border-radius: 12px;
      border-bottom: 3px solid var(--gold);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      box-shadow: 0 4px 15px rgba(19, 96, 58, 0.2);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .header-logo-wrap {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid #FCD34D;
      background: #FFFFFF;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .header-tag {
      display: inline-block;
      background: rgba(217, 155, 0, 0.25);
      border: 1px solid #FCD34D;
      color: #FCD34D;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 12px;
      margin-bottom: 2px;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 19px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.3px;
      line-height: 1.1;
    }

    .header-sub {
      color: #E5E7EB;
      font-size: 10px;
      font-weight: 500;
    }

    .header-meta {
      text-align: right;
      font-size: 9.5px;
      border-left: 1px solid rgba(255, 255, 255, 0.18);
      padding-left: 15px;
    }

    .header-meta strong {
      color: #FCD34D;
    }

    /* TITULOS DE SECCIÓN */
    .sec-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
      margin-bottom: 6px;
    }

    .sec-title::after {
      content: "";
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
    }

    /* KPIS HORIZONTALES */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }

    .kpi-card {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 7px 10px;
      text-align: center;
      border-top: 3px solid var(--primary);
    }

    .kpi-num {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }

    .kpi-label {
      font-size: 8.5px;
      color: var(--muted);
      font-weight: 700;
      margin-top: 2px;
      text-transform: uppercase;
    }

    /* MODULOS EN 4 COLUMNAS HORIZONTALES */
    .modules-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .module-box {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .module-box.green { border-top: 3px solid var(--primary); }
    .module-box.gold { border-top: 3px solid var(--gold); }
    .module-box.blue { border-top: 3px solid #1E40AF; }
    .module-box.red { border-top: 3px solid var(--accent-red); }

    .module-head {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .module-desc {
      font-size: 9px;
      color: var(--muted);
      line-height: 1.3;
    }

    /* FLUJOS EN FILAS PANORÁMICAS */
    .flow-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 7px 10px;
      margin-bottom: 6px;
      align-items: center;
    }

    .flow-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .flow-steps-horiz {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .step-horiz-item {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 5px 6px;
      text-align: center;
    }

    .step-horiz-badge {
      font-size: 8px;
      font-weight: 800;
      color: #FFFFFF;
      background: var(--primary);
      padding: 1px 5px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 2px;
    }

    .step-horiz-name {
      font-size: 9.5px;
      font-weight: 700;
      color: var(--dark);
    }

    .step-horiz-desc {
      font-size: 8px;
      color: var(--muted);
      line-height: 1.15;
    }

    /* CV SECTION (PÁGINA 3) */
    .cv-grid {
      display: grid;
      grid-template-columns: 1.1fr 1.3fr 0.9fr;
      gap: 12px;
      margin-top: 4px;
    }

    .cv-card {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
    }

    .cv-card.highlight {
      background: linear-gradient(135deg, #FAF7F2 0%, #FEF3C7 100%);
      border: 1.5px solid var(--gold);
    }

    .cv-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1.5px solid var(--gold);
      padding-bottom: 3px;
    }

    .cv-item {
      margin-bottom: 7px;
    }

    .cv-item strong {
      font-size: 10px;
      color: var(--dark);
      display: block;
    }

    .cv-item span {
      font-size: 8.5px;
      color: var(--gold-dark);
      font-weight: 700;
      display: block;
      margin-bottom: 1px;
    }

    .cv-item p {
      font-size: 8.5px;
      color: var(--muted);
      line-height: 1.25;
    }

    .github-box {
      background: #111827;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      margin-top: 8px;
    }

    .github-box a {
      color: #FCD34D;
      text-decoration: none;
      font-weight: 700;
      font-size: 9.5px;
      display: block;
      margin-top: 2px;
    }

    /* TABLA DE PRECIOS HORIZONTAL (PÁGINA 4) */
    .pricing-grid-horiz {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 8px;
    }

    .plan-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .plan-card.highlight {
      background: #FEF3C7;
      border: 2px solid var(--gold);
      box-shadow: 0 4px 12px rgba(217, 155, 0, 0.15);
    }

    .plan-name {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
    }

    .plan-range {
      font-size: 9px;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .plan-price {
      font-size: 16px;
      font-weight: 900;
      color: var(--primary-dark);
      margin: 4px 0;
    }

    .plan-sub {
      font-size: 8.5px;
      color: var(--gold-dark);
      font-weight: 700;
    }

    /* FOOTER */
    .page-footer {
      border-top: 1px solid var(--border);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #9CA3AF;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: VISIÓN, OPERACIÓN & MÓDULOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner">
        <div class="header-left">
          <div class="header-logo-wrap">
            <img src="${logoBase64}" alt="Logo Cangallo">
          </div>
          <div>
            <div class="header-tag">Propuesta Oficial • Carnaval Ayacuchano 2027</div>
            <h1 class="header-title">COMPARSA CANGALLO SEÑORIAL</h1>
            <p class="header-sub">Dossier Técnico — Plataforma Digital de Gestión Integral, Asistencia QR & Tesorería</p>
          </div>
        </div>
        <div class="header-meta">
          <div><strong>Presentado a:</strong> Sr. Próspero Huayanay & Junta Directiva</div>
          <div><strong>Implementación de Negocios:</strong> Jhoan Taboada</div>
        </div>
      </div>

      <div class="sec-title">1. Métricas de Impacto & Eficiencia Operativa</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-num">0.2 seg</div>
          <div class="kpi-label">Tiempo por Escaneo QR</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">100%</div>
          <div class="kpi-label">Pagos Digitales & Cuotas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">+1,000</div>
          <div class="kpi-label">Capacidad de Integrantes</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">24 / 7</div>
          <div class="kpi-label">Disponibilidad en la Nube</div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 1.5px solid #10B981; border-radius: 8px; padding: 7px 12px; margin-bottom: 8px; font-size: 9.5px; color: #064E3B;">
        <strong>MODELO DE SERVICIO INTEGRAL EN LA NUBE:</strong> La plataforma se entrega completamente configurada y operativa. La institución únicamente cubre el <strong>Mantenimiento Operativo, Servidores en la Nube y Almacenamiento Seguro de la Información</strong> según la escala de socios, garantizando un servicio confiable, blindado y 100% autofinanciable con las cuotas.
      </div>

      <div class="sec-title">2. Módulos Operativos de la Plataforma Integrada</div>
      <div class="modules-grid-4">
        <div class="module-box green">
          <div class="module-head">📱 Asistencia QR</div>
          <p class="module-desc">Carnet digital en celular. Escaneo en fracciones de segundo con cámara o marcado manual para delegados. Reportes en Excel en vivo.</p>
        </div>
        <div class="module-box gold">
          <div class="module-head">👗 Tienda & Tallas</div>
          <p class="module-desc">Catálogo de camisas bordadas y polleras. Registro estricto de tallas (S, M, L, XL) y control de entrega para evitar mermas.</p>
        </div>
        <div class="module-box blue">
          <div class="module-head">💰 Tesorería Digital</div>
          <p class="module-desc">Carga directa de comprobantes de pagos digitales en HD. Validación en 1 clic y balance contable de recaudación al día.</p>
        </div>
        <div class="module-box red">
          <div class="module-head">🎶 Cancionero & Buzón</div>
          <p class="module-desc">Letras oficiales de carnavales y huaynos para ensayos, calendario de eventos y canal confidencial de sugerencias para socios.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 1 de 4</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 2: ARQUITECTURA & FLUJOS PANORÁMICOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 10px 16px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 40px; height: 40px;">
            <img src="${logoBase64}" alt="Logo Cangallo">
          </div>
          <div>
            <h2 style="font-size: 15px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">ARQUITECTURA CLOUD & FLUJOS OPERATIVOS</h2>
            <p style="color: #E5E7EB; font-size: 9px;">Infraestructura corporativa, servidores en la nube y funcionamiento en ensayos</p>
          </div>
        </div>
      </div>

      <div class="sec-title" style="margin-top: 6px;">1. Infraestructura & Almacenamiento Seguro en la Nube</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 6px;">
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--primary); display: block;">☁️ Servidores Cloud</strong>
          <p style="font-size: 8px; color: var(--muted);">Red distribuida para carga ultrarrápida 4G/5G con 99.9% de operatividad.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--primary); display: block;">🔒 Almacenamiento Seguro</strong>
          <p style="font-size: 8px; color: var(--muted);">Base de datos corporativa cifrada con respaldos automáticos continuos.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--primary); display: block;">⚙️ Monitoreo 24/7</strong>
          <p style="font-size: 8px; color: var(--muted);">Procesos automatizados que mantienen la plataforma activa sin demoras.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--primary); display: block;">📊 Exportación a Excel</strong>
          <p style="font-size: 8px; color: var(--muted);">Descarga instantánea del padrón y tesorería en cualquier momento.</p>
        </div>
      </div>

      <div class="sec-title">2. Flujos Operativos del Sistema</div>

      <!-- Flujo 1 -->
      <div class="flow-row">
        <div class="flow-label">📱 Asistencia QR en Ensayos</div>
        <div class="flow-steps-horiz">
          <div class="step-horiz-item">
            <span class="step-horiz-badge">1</span>
            <div class="step-horiz-name">Carnet Digital</div>
            <div class="step-horiz-desc">Socio abre su QR personal.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">2</span>
            <div class="step-horiz-name">Escaneo Cámara</div>
            <div class="step-horiz-desc">Delegado lee en 0.2 seg.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">3</span>
            <div class="step-horiz-name">Registro Nube</div>
            <div class="step-horiz-desc">Valida y sella hora exacta.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">4</span>
            <div class="step-horiz-name">Métricas en Vivo</div>
            <div class="step-horiz-desc">Dashboard se actualiza al instante.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 2 -->
      <div class="flow-row">
        <div class="flow-label">👗 Vestuario & Tesorería</div>
        <div class="flow-steps-horiz">
          <div class="step-horiz-item">
            <span class="step-horiz-badge">1</span>
            <div class="step-horiz-name">Elección & Talla</div>
            <div class="step-horiz-desc">Camisa/Pollera (S, M, L, XL).</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">2</span>
            <div class="step-horiz-name">Adjunto Digital</div>
            <div class="step-horiz-desc">Sube captura de comprobante.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">3</span>
            <div class="step-horiz-name">Validación 1 Clic</div>
            <div class="step-horiz-desc">Tesorería aprueba en HD.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge">4</span>
            <div class="step-horiz-name">Control Entrega</div>
            <div class="step-horiz-desc">Se marca como Entregado.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 3 -->
      <div class="flow-row" style="border-left: 3px solid var(--gold); margin-bottom: 0;">
        <div class="flow-label" style="color: var(--gold-dark);">🗺️ Ruta de Implementación</div>
        <div class="flow-steps-horiz">
          <div class="step-horiz-item">
            <span class="step-horiz-badge" style="background: var(--gold);">F1</span>
            <div class="step-horiz-name">Padrón Digital</div>
            <div class="step-horiz-desc">Carga y claves iniciales.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge" style="background: var(--gold);">F2</span>
            <div class="step-horiz-name">Capacitación</div>
            <div class="step-horiz-desc">Taller directiva y delegados.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge" style="background: var(--gold);">F3</span>
            <div class="step-horiz-name">Piloto en Ensayo</div>
            <div class="step-horiz-desc">Prueba real con soporte.</div>
          </div>
          <div class="step-horiz-item">
            <span class="step-horiz-badge" style="background: var(--gold);">F4</span>
            <div class="step-horiz-name">Carnaval 2027</div>
            <div class="step-horiz-desc">Operación continua blindada.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 2 de 4</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 3: PERFIL PROFESIONAL (RESPALDO & CONFIANZA) ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 10px 16px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 40px; height: 40px;">
            <img src="${logoBase64}" alt="Logo Cangallo">
          </div>
          <div>
            <h2 style="font-size: 15px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">PERFIL PROFESIONAL & RESPALDO TÉCNICO</h2>
            <p style="color: #E5E7EB; font-size: 9px;">Trayectoria en Economía, Inteligencia Empresarial, Startups & Transformación Digital</p>
          </div>
        </div>
        <div class="header-meta">
          <div><strong>Jhoan Taboada Huamán</strong></div>
          <div>PUCP • Economía & Aplicaciones con IA</div>
        </div>
      </div>

      <div class="sec-title" style="margin-top: 6px;">Trayectoria & Experiencia Aplicada</div>
      <div class="cv-grid">
        
        <!-- Columna 1: Formación -->
        <div class="cv-card">
          <div class="cv-title">🎓 Formación & Especialización</div>
          
          <div class="cv-item">
            <strong>Pontificia Universidad Católica del Perú (PUCP)</strong>
            <span>Bachiller en Economía</span>
            <p>Formación sólida en análisis económico, finanzas, evaluación de proyectos y optimización de recursos.</p>
          </div>

          <div class="cv-item">
            <strong>Diplomado en Aplicaciones con IA & Automatización (PUCP)</strong>
            <span>Setiembre 2025 – Abril 2026</span>
            <p>Construcción de soluciones analíticas, automatización de procesos y desarrollo de software moderno.</p>
          </div>

          <div class="cv-item">
            <strong>Beca de Excelencia Académica — QLAB PUCP</strong>
            <span>Certificación en Machine Learning & Finanzas</span>
            <p>Métodos cuantitativos avanzados y análisis financiero corporativo.</p>
          </div>
        </div>

        <!-- Columna 2: Experiencia Operativa -->
        <div class="cv-card highlight">
          <div class="cv-title">💼 Experiencia en Operaciones & Negocios</div>
          
          <div class="cv-item">
            <strong>Adecco Perú / América Móvil (Claro)</strong>
            <span>Analista de Inteligencia Empresarial</span>
            <p>Diseño y optimización de reportería estratégica y trazabilidad comercial para más de 400 colaboradores. Capacitación al 100% de supervisores.</p>
          </div>

          <div class="cv-item">
            <strong>Surgir – Santander Microfinanzas</strong>
            <span>Trainee de Operaciones</span>
            <p>Control de desembolsos, pagos y recaudación. Automatización de flujos de información y monitoreo presentado a Directorio.</p>
          </div>

          <div class="cv-item">
            <strong>180 Degrees Consulting PUCP</strong>
            <span>Coordinador del Programa de Incubación</span>
            <p>Diseño y validación de modelos de negocio y transformación digital para cerca de 30 emprendimientos y startups de impacto.</p>
          </div>
        </div>

        <!-- Columna 3: Confianza & GitHub -->
        <div class="cv-card">
          <div class="cv-title">🛡️ Enfoque & Repositorio</div>
          
          <p style="font-size: 8.5px; color: var(--muted); line-height: 1.35; margin-bottom: 8px;">
            Mi propósito es llevar la tecnología de alto nivel empresarial a instituciones culturales y organizaciones, haciéndola simple, transparente y útil para los directivos y socios.
          </p>

          <div class="github-box">
            <span style="font-size: 8.5px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Portafolio & Código Fuente</span>
            <a href="https://github.com/jhoan202012" target="_blank">🌐 github.com/jhoan202012</a>
          </div>

          <div style="margin-top: 8px; padding: 6px; background: #FFFFFF; border: 1px solid var(--border); border-radius: 6px; font-size: 8px; color: var(--dark);">
            <strong>Contacto Directo:</strong><br>
            📱 (+51) 912 802 226<br>
            ✉️ jhoanth1998@gmail.com
          </div>
        </div>

      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 3 de 4</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 4: PLANES POR USUARIO & SERVICIOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 10px 16px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 40px; height: 40px;">
            <img src="${logoBase64}" alt="Logo Cangallo">
          </div>
          <div>
            <h2 style="font-size: 15px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">PLANES FLEXIBLES POR USUARIO & MANTENIMIENTO</h2>
            <p style="color: #E5E7EB; font-size: 9px;">Inversión operativa de infraestructura, servidores y almacenamiento seguro por socio</p>
          </div>
        </div>
      </div>

      <div class="sec-title" style="margin-top: 6px;">1. Mantenimiento, Servidores en Nube & Almacenamiento Seguro</div>
      <div class="pricing-grid-horiz">
        <div class="plan-card">
          <div class="plan-name">Plan Base</div>
          <div class="plan-range">Hasta 500 socios activos</div>
          <div class="plan-price">S/ 0.30</div>
          <div class="plan-sub">por socio al mes (S/ 3.60 año)</div>
        </div>

        <div class="plan-card highlight">
          <div class="plan-name">★ Plan Señorial (Recomendado)</div>
          <div class="plan-range">Hasta 1,000 socios activos</div>
          <div class="plan-price" style="color: var(--primary); font-size: 18px;">S/ 0.20</div>
          <div class="plan-sub">por socio al mes (S/ 2.40 año)</div>
        </div>

        <div class="plan-card">
          <div class="plan-name">Plan Élite / Masivo</div>
          <div class="plan-range">Hasta 1,500 socios activos</div>
          <div class="plan-price">S/ 0.17</div>
          <div class="plan-sub">por socio al mes (S/ 2.00 año)</div>
        </div>
      </div>

      <div class="sec-title">2. Servicios de Acompañamiento & Respaldo Técnico</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--dark); display: block;">🎓 Taller de Capacitación</strong>
          <span style="font-size: 8px; color: var(--muted); display: block; margin-bottom: 2px;">Inducción para directivos y delegados.</span>
          <span style="font-size: 8px; color: #059669; font-weight: 800;">INCLUIDO EN EL SERVICIO</span>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--dark); display: block;">🤝 Acompañamiento en Ensayo</strong>
          <span style="font-size: 8px; color: var(--muted); display: block; margin-bottom: 2px;">Soporte presencial en ensayo inicial.</span>
          <span style="font-size: 8px; color: #059669; font-weight: 800;">INCLUIDO EN EL SERVICIO</span>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px;">
          <strong style="font-size: 9.5px; color: var(--dark); display: block;">🌐 Dominio Oficial Propio</strong>
          <span style="font-size: 8px; color: var(--muted); display: block; margin-bottom: 2px;">cangallosenorial.com con SSL candado.</span>
          <span style="font-size: 8px; color: #B45309; font-weight: 800;">S/ 120.00 / AÑO (OPCIONAL)</span>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #1C1917 0%, #0C0A09 100%); color: #FFFFFF; border-radius: 8px; padding: 8px 14px; border-left: 4px solid var(--gold); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h4 style="font-size: 11px; font-weight: 800; color: #FCD34D;">RESUMEN DEL PLAN SEÑORIAL (1,000 INTEGRANTES)</h4>
          <p style="font-size: 8.5px; color: #A8A29E;">• Plataforma Web Provisionada &bull; Servidores Cloud 24/7 &bull; Almacenamiento Seguro &bull; Capacitación y Soporte Inicial Incluidos</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 900; color: #34D399;">S/ 2.50</div>
          <div style="font-size: 8.5px; color: #FCD34D; font-weight: 700;">por socio al año</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Propuesta Técnica & Económica 2027</span>
      <span>Página 4 de 4</span>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, '..', 'public', 'dossier_propuesta.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfOutputPath1 = path.join(__dirname, '..', 'public', 'Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf');
const pdfOutputPath2 = path.join('C:', 'Users', 'jhoan', '.gemini', 'antigravity', 'brain', '03e53288-970f-4e84-abdf-a8ce111ba82e', 'Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath1}" --no-pdf-header-footer "file:///${htmlPath.replace(/\\/g, '/')}"`;

execSync(cmd);

if (fs.existsSync(pdfOutputPath1)) {
  fs.copyFileSync(pdfOutputPath1, pdfOutputPath2);
  console.log('PDF Horizontal de 4 páginas generado con éxito.');
}
