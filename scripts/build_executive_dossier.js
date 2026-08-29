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
      line-height: 1.45;
      font-size: 12px;
    }

    .page {
      width: 297mm;
      height: 210mm;
      max-height: 210mm;
      padding: 13mm 16mm;
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
      padding: 14px 22px;
      border-radius: 14px;
      border-bottom: 3.5px solid var(--gold);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 16px rgba(19, 96, 58, 0.2);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-logo-wrap {
      width: 58px;
      height: 58px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #FCD34D;
      background: #FFFFFF;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .header-tag {
      display: inline-block;
      background: rgba(217, 155, 0, 0.25);
      border: 1px solid #FCD34D;
      color: #FCD34D;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 3px 9px;
      border-radius: 12px;
      margin-bottom: 3px;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.3px;
      line-height: 1.1;
    }

    .header-sub {
      color: #E5E7EB;
      font-size: 11px;
      font-weight: 500;
    }

    .header-meta {
      text-align: right;
      font-size: 10.5px;
      border-left: 1.5px solid rgba(255, 255, 255, 0.2);
      padding-left: 18px;
      line-height: 1.45;
    }

    .header-meta strong {
      color: #FCD34D;
    }

    /* TITULOS DE SECCIÓN */
    .sec-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
      margin-bottom: 8px;
    }

    .sec-title::after {
      content: "";
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
    }

    /* KPIS HORIZONTALES CON ALTURA GENEROSA */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 10px;
    }

    .kpi-card {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      text-align: center;
      border-top: 4px solid var(--primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }

    .kpi-num {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 10px;
      color: var(--muted);
      font-weight: 700;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* BANNER DE COBERTURA TOTAL */
    .banner-value-horiz {
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      border: 1.5px solid #10B981;
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 10px;
    }

    .badge-icon-box {
      background: var(--primary);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 8px 14px;
      border-radius: 10px;
      text-align: center;
      white-space: nowrap;
      box-shadow: 0 4px 8px rgba(19, 96, 58, 0.2);
    }

    .badge-icon-box span {
      display: block;
      font-size: 8.5px;
      color: #A7F3D0;
      font-weight: 600;
    }

    .banner-value-horiz p {
      font-size: 11px;
      color: #064E3B;
      line-height: 1.4;
    }

    /* MÓDULOS EN 4 COLUMNAS CON ALTURA Y BULLETS */
    .modules-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      flex: 1;
      min-height: 175px;
    }

    .module-box {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 6px;
    }

    .module-box.green { border-top: 4px solid var(--primary); }
    .module-box.gold { border-top: 4px solid var(--gold); }
    .module-box.blue { border-top: 4px solid #1E40AF; }
    .module-box.red { border-top: 4px solid var(--accent-red); }

    .module-head {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .module-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 10px;
      color: var(--muted);
      line-height: 1.35;
    }

    .module-bullets li {
      display: flex;
      align-items: flex-start;
      gap: 5px;
    }

    .module-bullets li::before {
      content: "✓";
      color: var(--primary);
      font-weight: 800;
      flex-shrink: 0;
    }

    /* FLUJOS EN FILAS PANORÁMICAS AMPLIAS (PAG 3) */
    .flow-row-large {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 11px 15px;
      margin-bottom: 9px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }

    .flow-head-bar {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flow-steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .step-box-item {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 9px 10px;
      text-align: center;
    }

    .step-box-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 10.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 5px;
    }

    .step-box-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 2px;
    }

    .step-box-desc {
      font-size: 9.5px;
      color: var(--muted);
      line-height: 1.25;
    }

    /* CV SECTION EN 3 COLUMNAS TALL (PÁGINA 1) */
    .cv-grid-tall {
      display: grid;
      grid-template-columns: 1.1fr 1.35fr 0.95fr;
      gap: 14px;
      flex: 1;
      margin-top: 6px;
    }

    .cv-column {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .cv-column.highlight {
      background: linear-gradient(135deg, #FAF7F2 0%, #FEF3C7 100%);
      border: 1.5px solid var(--gold);
    }

    .cv-col-title {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 2px solid var(--gold);
      padding-bottom: 4px;
    }

    .cv-item-block {
      margin-bottom: 10px;
    }

    .cv-item-block strong {
      font-size: 11px;
      color: var(--dark);
      display: block;
      margin-bottom: 2px;
    }

    .cv-item-block p {
      font-size: 9.5px;
      color: var(--muted);
      line-height: 1.35;
    }

    .github-banner-card {
      background: #111827;
      color: #FFFFFF;
      border-radius: 10px;
      padding: 12px 14px;
      text-align: center;
      margin-top: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    .github-banner-card a {
      color: #FCD34D;
      text-decoration: none;
      font-weight: 800;
      font-size: 11px;
      display: block;
      margin-top: 4px;
    }

    /* TABLA DE PRECIOS & SERVICIOS (PÁGINA 4) */
    .pricing-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 10px;
    }

    .plan-box-large {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .plan-box-large.highlight {
      background: #FEF3C7;
      border: 2.5px solid var(--gold);
      box-shadow: 0 6px 16px rgba(217, 155, 0, 0.2);
    }

    .plan-title-lg {
      font-size: 13px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
    }

    .plan-range-lg {
      font-size: 10px;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 6px;
    }

    .plan-price-lg {
      font-size: 22px;
      font-weight: 900;
      color: var(--primary-dark);
      margin: 4px 0;
      line-height: 1;
    }

    .plan-sub-lg {
      font-size: 10px;
      color: var(--gold-dark);
      font-weight: 700;
    }

    .services-3col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }

    .service-card-item {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
    }

    .service-card-item strong {
      font-size: 11px;
      color: var(--dark);
      display: block;
      margin-bottom: 2px;
    }

    .service-card-item p {
      font-size: 9.5px;
      color: var(--muted);
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .service-tag-inc {
      font-size: 9px;
      color: #059669;
      font-weight: 800;
      text-transform: uppercase;
    }

    .final-summary-wide {
      background: linear-gradient(135deg, #1C1917 0%, #0C0A09 100%);
      color: #FFFFFF;
      border-radius: 12px;
      padding: 12px 18px;
      border-left: 5px solid var(--gold);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .final-summary-wide h4 {
      font-size: 12.5px;
      font-weight: 800;
      color: #FCD34D;
      margin-bottom: 2px;
    }

    .final-summary-wide p {
      font-size: 10px;
      color: #A8A29E;
      line-height: 1.35;
    }

    .final-cost-val {
      font-size: 22px;
      font-weight: 900;
      color: #34D399;
      line-height: 1;
    }

    /* FOOTER */
    .page-footer {
      border-top: 1px solid var(--border);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #9CA3AF;
      margin-top: 8px;
    }
  </style>
</head>
<body>

  <!-- ==================== LÁMINA 1: PERFIL PROFESIONAL & RESPALDO (INICIO) ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 12px 20px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 48px; height: 48px;">
            <img src="${logoBase64}" width="44" height="44" alt="Logo Cangallo" style="display: block; width: 44px; height: 44px; object-fit: contain;">
          </div>
          <div>
            <div class="header-tag">Presentación Institucional • Carnaval Ayacuchano 2027</div>
            <h1 class="header-title" style="font-size: 20px;">PERFIL PROFESIONAL & RESPALDO TÉCNICO</h1>
            <p class="header-sub">Economía, Inteligencia Empresarial, Startups & Transformación Digital</p>
          </div>
        </div>
        <div class="header-meta">
          <div><strong>Jhoan Taboada Huamán</strong></div>
          <div>PUCP • Economía & Aplicaciones con IA</div>
          <div><strong>Especialista en Implementación de Negocios</strong></div>
        </div>
      </div>

      <div class="sec-title">Trayectoria Profesional & Experiencia Aplicada</div>
      <div class="cv-grid-tall">
        
        <!-- Columna 1: Formación -->
        <div class="cv-column">
          <div class="cv-col-title">🎓 Formación & Especialización</div>
          
          <div class="cv-item-block">
            <strong>Pontificia Universidad Católica del Perú (PUCP)</strong>
            <p>Bachiller en Economía con formación sólida en análisis económico, finanzas corporativas, evaluación de proyectos y optimización de recursos.</p>
          </div>

          <div class="cv-item-block">
            <strong>Diplomado en Aplicaciones con IA & Automatización (PUCP)</strong>
            <p>Construcción de soluciones analíticas, automatización de procesos empresariales y desarrollo de software moderno.</p>
          </div>

          <div class="cv-item-block">
            <strong>Beca de Excelencia Académica — QLAB PUCP</strong>
            <p>Certificación en Machine Learning Aplicado y métodos cuantitativos avanzados.</p>
          </div>
        </div>

        <!-- Columna 2: Experiencia Operativa (Sin Puestos) -->
        <div class="cv-column highlight">
          <div class="cv-col-title">💼 Experiencia en Negocios & Operaciones</div>
          
          <div class="cv-item-block">
            <strong>Adecco Perú / América Móvil (Claro)</strong>
            <p>Diseño y optimización de reportería estratégica y trazabilidad comercial para más de 400 colaboradores. Capacitación al 100% de supervisores.</p>
          </div>

          <div class="cv-item-block">
            <strong>Grupo Santander</strong>
            <p>Control de desembolsos, pagos y recaudación. Automatización de flujos de información y monitoreo operativo presentado a Directorio.</p>
          </div>

          <div class="cv-item-block">
            <strong>180 Degrees Consulting PUCP</strong>
            <p>Diseño y validación de modelos de negocio y transformación digital para cerca de 30 emprendimientos y startups de impacto.</p>
          </div>
        </div>

        <!-- Columna 3: Confianza & GitHub -->
        <div class="cv-column">
          <div class="cv-col-title">🛡️ Enfoque & Repositorio</div>
          
          <p style="font-size: 9.5px; color: var(--muted); line-height: 1.4; margin-bottom: 8px;">
            Mi propósito es llevar la tecnología de alto nivel empresarial a instituciones culturales y organizaciones, haciéndola simple, transparente y útil para los directivos y socios.
          </p>

          <div class="github-banner-card">
            <span style="font-size: 9px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Portafolio & Código Fuente</span>
            <a href="https://github.com/jhoan202012" target="_blank">🌐 github.com/jhoan202012</a>
          </div>

          <div style="margin-top: 10px; padding: 8px 10px; background: #FFFFFF; border: 1px solid var(--border); border-radius: 8px; font-size: 9px; color: var(--dark); line-height: 1.4;">
            <strong>Contacto Directo:</strong><br>
            📱 (+51) 912 802 226<br>
            ✉️ jhoanth1998@gmail.com
          </div>
        </div>

      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Perfil Profesional</span>
      <span>Página 1 de 4</span>
    </div>
  </div>

  <!-- ==================== LÁMINA 2: VISIÓN, OPERACIÓN & MÓDULOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner">
        <div class="header-left">
          <div class="header-logo-wrap">
            <img src="${logoBase64}" width="54" height="54" alt="Logo Cangallo" style="display: block; width: 54px; height: 54px; object-fit: contain;">
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

      <div class="banner-value-horiz">
        <div class="badge-icon-box">
          COBERTURA TOTAL
          <span>NUBE 24/7</span>
        </div>
        <p>
          <strong>MODELO DE SERVICIO INTEGRAL EN LA NUBE:</strong> La plataforma se entrega completamente configurada y operativa. La institución únicamente cubre el <strong>Mantenimiento Operativo, Servidores en la Nube y Almacenamiento Seguro de la Información</strong> según la escala de socios, garantizando un servicio confiable, blindado y 100% autofinanciable con las cuotas.
        </p>
      </div>

      <div class="sec-title">2. Módulos Operativos de la Plataforma Integrada</div>
      <div class="modules-grid-4">
        <div class="module-box green">
          <div class="module-head">📱 Asistencia QR</div>
          <ul class="module-bullets">
            <li>Carnet QR personal en celular.</li>
            <li>Escaneo cámara en 0.2 segundos.</li>
            <li>Marcado manual para delegados.</li>
            <li>Reportes en Excel en tiempo real.</li>
          </ul>
        </div>
        <div class="module-box gold">
          <div class="module-head">👗 Tienda & Tallas</div>
          <ul class="module-bullets">
            <li>Catálogo de camisas y polleras.</li>
            <li>Registro estricto de tallas S/M/L/XL.</li>
            <li>Control de entrega de prendas.</li>
            <li>Cero mermas ni prendas perdidas.</li>
          </ul>
        </div>
        <div class="module-box blue">
          <div class="module-head">💰 Tesorería Digital</div>
          <ul class="module-bullets">
            <li>Carga de comprobantes en HD.</li>
            <li>Validación o reversión en 1 clic.</li>
            <li>Balance de recaudación al día.</li>
            <li>Historial auditable por socio.</li>
          </ul>
        </div>
        <div class="module-box red">
          <div class="module-head">🎶 Cancionero & Buzón</div>
          <ul class="module-bullets">
            <li>Letras oficiales para ensayos.</li>
            <li>Calendario de eventos y fechas.</li>
            <li>Buzón confidencial para socios.</li>
            <li>Acceso directo sin descargas.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 2 de 4</span>
    </div>
  </div>

  <!-- ==================== LÁMINA 3: ARQUITECTURA & FLUJOS PANORÁMICOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 12px 20px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 48px; height: 48px;">
            <img src="${logoBase64}" width="44" height="44" alt="Logo Cangallo" style="display: block; width: 44px; height: 44px; object-fit: contain;">
          </div>
          <div>
            <h2 style="font-size: 17px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">ARQUITECTURA CLOUD & FLUJOS OPERATIVOS</h2>
            <p style="color: #E5E7EB; font-size: 10px;">Infraestructura corporativa, servidores en la nube y funcionamiento en ensayos</p>
          </div>
        </div>
      </div>

      <div class="sec-title">1. Infraestructura & Almacenamiento Seguro en la Nube</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 8px;">
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px;">
          <strong style="font-size: 11px; color: var(--primary); display: block; margin-bottom: 2px;">☁️ Servidores Cloud</strong>
          <p style="font-size: 9.5px; color: var(--muted); line-height: 1.3;">Red distribuida para carga ultrarrápida 4G/5G con 99.9% de operatividad.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px;">
          <strong style="font-size: 11px; color: var(--primary); display: block; margin-bottom: 2px;">🔒 Almacenamiento Seguro</strong>
          <p style="font-size: 9.5px; color: var(--muted); line-height: 1.3;">Base de datos corporativa cifrada con respaldos automáticos continuos.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px;">
          <strong style="font-size: 11px; color: var(--primary); display: block; margin-bottom: 2px;">⚙️ Monitoreo 24/7</strong>
          <p style="font-size: 9.5px; color: var(--muted); line-height: 1.3;">Procesos automatizados que mantienen la plataforma activa sin demoras.</p>
        </div>
        <div style="background: #FAF7F2; border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px;">
          <strong style="font-size: 11px; color: var(--primary); display: block; margin-bottom: 2px;">📊 Exportación a Excel</strong>
          <p style="font-size: 9.5px; color: var(--muted); line-height: 1.3;">Descarga instantánea del padrón y tesorería en cualquier momento.</p>
        </div>
      </div>

      <div class="sec-title">2. Flujos Operativos del Sistema</div>

      <!-- Flujo 1 -->
      <div class="flow-row-large">
        <div class="flow-head-bar">📱 Flujo 1: Asistencia QR en Ensayos</div>
        <div class="flow-steps-grid">
          <div class="step-box-item">
            <div class="step-box-badge">1</div>
            <div class="step-box-title">Carnet Digital</div>
            <div class="step-box-desc">Socio abre su QR en el celular al llegar.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">2</div>
            <div class="step-box-title">Escaneo Cámara</div>
            <div class="step-box-desc">Delegado lee el código en 0.2 seg.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">3</div>
            <div class="step-box-title">Registro Nube</div>
            <div class="step-box-desc">Valida y sella hora y asistencia exacta.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">4</div>
            <div class="step-box-title">Métricas en Vivo</div>
            <div class="step-box-desc">Dashboard directivo actualiza presentes.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 2 -->
      <div class="flow-row-large">
        <div class="flow-head-bar">👗 Flujo 2: Tienda de Vestuario & Validación Digital</div>
        <div class="flow-steps-grid">
          <div class="step-box-item">
            <div class="step-box-badge">1</div>
            <div class="step-box-title">Elección & Talla</div>
            <div class="step-box-desc">Selecciona prenda y talla (S/M/L/XL).</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">2</div>
            <div class="step-box-title">Adjunto Digital</div>
            <div class="step-box-desc">Sube captura de comprobante en HD.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">3</div>
            <div class="step-box-title">Validación 1 Clic</div>
            <div class="step-box-desc">Tesorería aprueba el pago con un toque.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge">4</div>
            <div class="step-box-title">Control Entrega</div>
            <div class="step-box-desc">Se marca como Entregado sin mermas.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 3 -->
      <div class="flow-row-large" style="border-left: 4px solid var(--gold); margin-bottom: 0;">
        <div class="flow-head-bar" style="color: var(--gold-dark);">🗺️ Flujo 3: Ruta de Implementación en 4 Fases</div>
        <div class="flow-steps-grid">
          <div class="step-box-item">
            <div class="step-box-badge" style="background: var(--gold);">F1</div>
            <div class="step-box-title">Padrón Digital</div>
            <div class="step-box-desc">Carga inicial de socios y carnets QR.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge" style="background: var(--gold);">F2</div>
            <div class="step-box-title">Capacitación</div>
            <div class="step-box-desc">Taller práctico a directiva y delegados.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge" style="background: var(--gold);">F3</div>
            <div class="step-box-title">Piloto en Ensayo</div>
            <div class="step-box-desc">Prueba real con soporte presencial.</div>
          </div>
          <div class="step-box-item">
            <div class="step-box-badge" style="background: var(--gold);">F4</div>
            <div class="step-box-title">Carnaval 2027</div>
            <div class="step-box-desc">Operación continua y reportes finales.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 3 de 4</span>
    </div>
  </div>

  <!-- ==================== LÁMINA 4: PLANES POR USUARIO & SERVICIOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 12px 20px;">
        <div class="header-left">
          <div class="header-logo-wrap" style="width: 48px; height: 48px;">
            <img src="${logoBase64}" width="44" height="44" alt="Logo Cangallo" style="display: block; width: 44px; height: 44px; object-fit: contain;">
          </div>
          <div>
            <h2 style="font-size: 17px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">PLANES FLEXIBLES POR USUARIO & MANTENIMIENTO</h2>
            <p style="color: #E5E7EB; font-size: 10px;">Inversión operativa de infraestructura, servidores y almacenamiento seguro por socio</p>
          </div>
        </div>
      </div>

      <div class="sec-title" style="margin-top: 6px;">1. Mantenimiento, Servidores en Nube & Almacenamiento Seguro</div>
      <div class="pricing-cards-grid">
        <div class="plan-box-large">
          <div class="plan-title-lg">Plan Base</div>
          <div class="plan-range-lg">Hasta 500 socios activos</div>
          <div class="plan-price-lg">S/ 0.30</div>
          <div class="plan-sub-lg">por socio al mes (S/ 3.60 año)</div>
        </div>

        <div class="plan-box-large highlight">
          <div class="plan-title-lg">★ Plan Señorial (Recomendado)</div>
          <div class="plan-range-lg">Hasta 1,000 socios activos</div>
          <div class="plan-price-lg" style="color: var(--primary); font-size: 24px;">S/ 0.20</div>
          <div class="plan-sub-lg">por socio al mes (S/ 2.40 año)</div>
        </div>

        <div class="plan-box-large">
          <div class="plan-title-lg">Plan Élite / Masivo</div>
          <div class="plan-range-lg">Hasta 1,500 socios activos</div>
          <div class="plan-price-lg">S/ 0.17</div>
          <div class="plan-sub-lg">por socio al mes (S/ 2.00 año)</div>
        </div>
      </div>

      <div class="sec-title">2. Servicios de Acompañamiento & Respaldo Técnico</div>
      <div class="services-3col">
        <div class="service-card-item">
          <strong>🎓 Taller de Capacitación</strong>
          <p>Inducción para directivos y delegados en escaneo y reportes.</p>
          <span class="service-tag-inc">INCLUIDO EN EL SERVICIO</span>
        </div>
        <div class="service-card-item">
          <strong>🤝 Acompañamiento en Ensayo</strong>
          <p>Soporte presencial en puerta durante el ensayo inicial.</p>
          <span class="service-tag-inc">INCLUIDO EN EL SERVICIO</span>
        </div>
        <div class="service-card-item">
          <strong>🌐 Dominio Oficial Propio</strong>
          <p>cangallosenorial.com con certificado de seguridad SSL.</p>
          <span style="font-size: 9px; color: var(--gold-dark); font-weight: 800;">S/ 120.00 / AÑO (OPCIONAL)</span>
        </div>
      </div>

      <div class="final-summary-wide">
        <div>
          <h4>RESUMEN DEL PLAN SEÑORIAL (1,000 INTEGRANTES)</h4>
          <p>• Plataforma Web Provisionada &bull; Servidores Cloud 24/7 &bull; Almacenamiento Seguro &bull; Capacitación y Soporte Inicial Incluidos</p>
        </div>
        <div style="text-align: right;">
          <div class="final-cost-val">S/ 2.50</div>
          <div style="font-size: 9.5px; color: #FCD34D; font-weight: 700; margin-top: 2px;">por socio al año</div>
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

const cmd = `"${browserPath}" --headless --disable-gpu --virtual-time-budget=3000 --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath1}" --no-pdf-header-footer "file:///${htmlPath.replace(/\\/g, '/')}"`;

execSync(cmd);

if (fs.existsSync(pdfOutputPath1)) {
  fs.copyFileSync(pdfOutputPath1, pdfOutputPath2);
  console.log('PDF reordenado con éxito: Perfil Profesional en Lámina 1 y Plataforma en Láminas 2-4.');
}
