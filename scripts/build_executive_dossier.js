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
  <title>Dossier Institucional - Plataforma Digital Cangallo Señorial 2027</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');

    @page {
      size: A4 portrait;
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
      font-size: 12.5px;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      padding: 16mm 18mm;
      background: #FFFFFF;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* COLORES OFICIALES CANGALLO SEÑORIAL */
    :root {
      --primary: #13603A;       /* Verde Esmeralda Tradicional */
      --primary-dark: #0E472A;  /* Verde Bosque Oscuro */
      --gold: #D99B00;          /* Dorado Festivo */
      --gold-dark: #B45309;     /* Ámbar Profundo */
      --gold-bg: #FEF3C7;       /* Crema Cálido Dorado */
      --accent-red: #B71C1C;    /* Rojo Ayacucho */
      --dark: #111827;          /* Texto Principal */
      --muted: #4B5563;         /* Texto Secundario */
      --bg-card: #FFFFFF;
      --border: #E5E7EB;
      --linen: #FAF7F2;
    }

    /* HEADER INSTITUCIONAL */
    .header-banner {
      background: linear-gradient(135deg, #0E472A 0%, #13603A 65%, #1C1917 100%);
      color: #FFFFFF;
      padding: 18px 22px;
      border-radius: 16px;
      position: relative;
      box-shadow: 0 8px 20px -4px rgba(19, 96, 58, 0.25);
      border-bottom: 3px solid var(--gold);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-logo-wrap {
      width: 68px;
      height: 68px;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid #FCD34D;
      background: #FFFFFF;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .header-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .header-content {
      flex: 1;
    }

    .header-tag {
      display: inline-block;
      background: rgba(217, 155, 0, 0.25);
      border: 1px solid #FCD34D;
      color: #FCD34D;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 2.5px 8px;
      border-radius: 20px;
      margin-bottom: 4px;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
      line-height: 1.15;
    }

    .header-sub {
      color: #E5E7EB;
      font-size: 11px;
      font-weight: 500;
    }

    .meta-bar {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 12px;
      font-size: 10px;
    }

    .meta-item strong {
      color: #FCD34D;
    }

    /* TITULOS DE SECCIÓN */
    .sec-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    .sec-title::after {
      content: "";
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
    }

    /* KPIS OPERATIVOS */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .kpi-card {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 9px 10px;
      text-align: center;
      border-top: 3.5px solid var(--primary);
    }

    .kpi-num {
      font-size: 17px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 9px;
      color: var(--muted);
      font-weight: 700;
      margin-top: 2px;
      text-transform: uppercase;
    }

    /* BANNER DE VALOR & LISTO PARA USAR */
    .banner-value {
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      border: 1.5px solid #10B981;
      border-radius: 12px;
      padding: 11px 15px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .badge-icon-box {
      background: var(--primary);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 8px 12px;
      border-radius: 10px;
      text-align: center;
      white-space: nowrap;
      box-shadow: 0 4px 8px rgba(19, 96, 58, 0.2);
    }

    .badge-icon-box span {
      display: block;
      font-size: 8px;
      color: #A7F3D0;
      font-weight: 600;
    }

    .banner-value p {
      font-size: 10.5px;
      color: #064E3B;
      line-height: 1.35;
    }

    /* MÓDULOS DE LA APP */
    .modules-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .module-box {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .module-box.green { border-left: 4px solid var(--primary); }
    .module-box.gold { border-left: 4px solid var(--gold); }
    .module-box.blue { border-left: 4px solid #1E40AF; }
    .module-box.red { border-left: 4px solid var(--accent-red); }

    .module-head {
      font-size: 11px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .module-desc {
      font-size: 9.5px;
      color: var(--muted);
      line-height: 1.35;
    }

    /* FLUJOS VISUALES (PAGINA 2) */
    .flow-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 11px 13px;
      margin-bottom: 11px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    .flow-title {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 7px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .flow-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
    }

    .step-item {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 7px 6px;
      text-align: center;
    }

    .step-badge {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 4px;
    }

    .step-name {
      font-size: 10px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 2px;
    }

    .step-detail {
      font-size: 8.5px;
      color: var(--muted);
      line-height: 1.25;
    }

    /* ARQUITECTURA CLOUD BOXES */
    .cloud-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }

    .cloud-item {
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
    }

    .cloud-item strong {
      font-size: 10.5px;
      color: var(--primary);
      display: block;
      margin-bottom: 2px;
    }

    .cloud-item p {
      font-size: 9px;
      color: var(--muted);
      line-height: 1.3;
    }

    /* TABLA DE PLANES POR USUARIO (PAGINA 3) */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .pricing-table th {
      background: #0E472A;
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
    }

    .pricing-table td {
      padding: 9px 10px;
      font-size: 10px;
      border-bottom: 1px solid var(--border);
      color: var(--dark);
    }

    .pricing-table tr.highlight {
      background: #FEF3C7;
      font-weight: 700;
    }

    .pricing-table tr.highlight td {
      color: #92400E;
    }

    .tag-recommend {
      background: var(--gold);
      color: #FFFFFF;
      font-size: 8px;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: 4px;
      margin-left: 5px;
      text-transform: uppercase;
    }

    /* FILAS DE SERVICIOS */
    .service-row {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      background: #FAF7F2;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 6px;
      align-items: center;
    }

    .service-info strong {
      font-size: 10.5px;
      color: var(--dark);
      display: block;
    }

    .service-info span {
      font-size: 9px;
      color: var(--muted);
    }

    .service-price {
      text-align: right;
    }

    .service-price .amount {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary);
    }

    .service-price .sub {
      font-size: 8px;
      color: #059669;
      font-weight: 700;
      display: block;
    }

    /* RESUMEN FINAL BOX */
    .final-summary {
      background: linear-gradient(135deg, #1C1917 0%, #0C0A09 100%);
      color: #FFFFFF;
      border-radius: 12px;
      padding: 13px 16px;
      border-left: 5px solid var(--gold);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .final-left h4 {
      font-size: 12px;
      font-weight: 800;
      color: #FCD34D;
      margin-bottom: 3px;
    }

    .final-left p {
      font-size: 9px;
      color: #A8A29E;
      line-height: 1.35;
    }

    .final-right {
      text-align: right;
    }

    .final-cost {
      font-size: 19px;
      font-weight: 900;
      color: #34D399;
      line-height: 1;
    }

    .final-per-user {
      font-size: 9.5px;
      color: #FCD34D;
      font-weight: 700;
      margin-top: 2px;
    }

    /* FOOTER */
    .page-footer {
      border-top: 1px solid var(--border);
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #9CA3AF;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: IDENTIDAD, QUÉ HACE & MÓDULOS ==================== -->
  <div class="page">
    <div>
      <!-- Banner Cabecera con Logo Oficial -->
      <div class="header-banner">
        <div class="header-logo-wrap">
          <img src="${logoBase64}" alt="Logo Oficial Cangallo Señorial">
        </div>
        <div class="header-content">
          <div class="header-tag">Propuesta Oficial • Carnaval Ayacuchano 2027</div>
          <h1 class="header-title">COMPARSA CANGALLO SEÑORIAL</h1>
          <p class="header-sub">Dossier Técnico — Plataforma Digital de Gestión Integral, Asistencia QR & Tesorería</p>
          
          <div class="meta-bar">
            <div class="meta-item"><strong>Presentado a:</strong> Sr. Próspero Huayanay & Junta Directiva</div>
            <div class="meta-item"><strong>Implementación de Negocios:</strong> Jhoan Taboada</div>
          </div>
        </div>
      </div>

      <!-- Métricas de Impacto Operativo -->
      <div class="sec-title" style="margin-top: 12px;">Métricas & Eficiencia Operativa</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-num">0.2 seg</div>
          <div class="kpi-label">Tiempo por Escaneo QR</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">100%</div>
          <div class="kpi-label">Cuentas Claras Yape</div>
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

      <!-- Propósito & Visión Institucional -->
      <div class="banner-value">
        <div class="badge-icon-box">
          LISTA & ACTIVA
          <span>100% FUNCIONAL</span>
        </div>
        <p>
          <strong>VISIÓN & MODERNIZACIÓN:</strong> La comparsa Cangallo Señorial da el salto hacia la digitalización total. Esta plataforma web centraliza el control de ensayos, la adquisición ordenada de vestuarios y la transparencia en tesorería, accesible desde cualquier teléfono inteligente sin necesidad de instalar aplicaciones pesadas.
        </p>
      </div>

      <!-- Módulos Operativos de la Plataforma -->
      <div class="sec-title">Módulos de la Plataforma Integrada</div>
      <div class="modules-grid">
        <div class="module-box green">
          <div class="module-head">📱 Asistencia Digital por Código QR</div>
          <p class="module-desc">Cada socio porta su carnet QR personal en el celular. Los delegados escanean en fracciones de segundo con la cámara o marcan en lista táctil. Reportes instantáneos en Excel.</p>
        </div>

        <div class="module-box gold">
          <div class="module-head">👗 Tienda de Vestuario & Tallas</div>
          <p class="module-desc">Catálogo con camisas bordadas, polleras y accesorios. Registro estricto de tallas (S, M, L, XL) y control de entrega de prendas para evitar confusiones y mermas.</p>
        </div>

        <div class="module-box blue">
          <div class="module-head">💰 Tesorería & Validación de Vouchers</div>
          <p class="module-desc">Carga directa de comprobantes Yape/Plin en alta resolución. La directiva valida o revierte aportes con un solo toque, manteniendo el balance al día.</p>
        </div>

        <div class="module-box red">
          <div class="module-head">🎶 Cancionero Oficial & Buzón Directivo</div>
          <p class="module-desc">Letras oficiales de carnavales y huaynos en el bolsillo de todos los integrantes para los ensayos, calendario de eventos y canal confidencial de sugerencias.</p>
        </div>
      </div>
    </div>

    <!-- Footer Pág 1 -->
    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 1 de 3</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 2: ARQUITECTURA CLOUD, SEGURIDAD & FLUJOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 13px 18px;">
        <div class="header-logo-wrap" style="width: 48px; height: 48px;">
          <img src="${logoBase64}" alt="Logo Cangallo">
        </div>
        <div class="header-content">
          <h2 style="font-size: 16px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">ARQUITECTURA CLOUD & FLUJOS OPERATIVOS</h2>
          <p style="color: #E5E7EB; font-size: 10px;">Seguridad corporativa, infraestructura en la nube y funcionamiento en vivo</p>
        </div>
      </div>

      <!-- Seguridad y Nube -->
      <div class="sec-title">Infraestructura & Seguridad en la Nube</div>
      <div class="cloud-grid">
        <div class="cloud-item">
          <strong>☁️ Servidores Cloud de Alta Disponibilidad</strong>
          <p>Red distribuida para carga ultrarrápida en cualquier celular 4G/5G con 99.9% de operatividad.</p>
        </div>
        <div class="cloud-item">
          <strong>🔒 Base de Datos Segura con Cifrado</strong>
          <p>Almacenamiento corporativo blindado con copias de seguridad continuas y redundantes.</p>
        </div>
        <div class="cloud-item">
          <strong>⚙️ Mantenimiento & Monitoreo 24/7</strong>
          <p>Procesos automatizados de diagnóstico que garantizan que el sistema responda sin demoras.</p>
        </div>
        <div class="cloud-item">
          <strong>📊 Soberanía y Control de Datos</strong>
          <p>Descarga del padrón y reportes de tesorería a Microsoft Excel (.xlsx) en cualquier momento.</p>
        </div>
      </div>

      <!-- Flujo 1: Asistencia -->
      <div class="sec-title">Flujo 1: Asistencia en Ensayos con Código QR</div>
      <div class="flow-card">
        <div class="flow-steps">
          <div class="step-item">
            <div class="step-badge">1</div>
            <div class="step-name">Carnet Digital</div>
            <div class="step-detail">El socio abre su carnet QR personal desde su celular.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">2</div>
            <div class="step-name">Escaneo Cámara</div>
            <div class="step-detail">El delegado apunta la cámara y lee el código en 0.2 seg.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">3</div>
            <div class="step-name">Registro Nube</div>
            <div class="step-detail">El servidor seguro valida identidad y registra hora exacta.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">4</div>
            <div class="step-name">Métricas en Vivo</div>
            <div class="step-detail">El dashboard directivo actualiza los presentes en tiempo real.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 2: Vestuario y Tesorería -->
      <div class="sec-title">Flujo 2: Tienda de Vestuario & Validación Yape/Plin</div>
      <div class="flow-card">
        <div class="flow-steps">
          <div class="step-item">
            <div class="step-badge">1</div>
            <div class="step-name">Elección & Talla</div>
            <div class="step-detail">El socio elige prenda (Camisa/Pollera) y su talla exacta.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">2</div>
            <div class="step-name">Adjunto Yape</div>
            <div class="step-detail">Sube la captura de su voucher desde la galería del celular.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">3</div>
            <div class="step-name">Aprobación 1-Clic</div>
            <div class="step-detail">Tesorería revisa el voucher en HD y aprueba con un toque.</div>
          </div>
          <div class="step-item">
            <div class="step-badge">4</div>
            <div class="step-name">Control Entrega</div>
            <div class="step-detail">Se marca como "Entregado" al dar la prenda, sin mermas.</div>
          </div>
        </div>
      </div>

      <!-- Flujo 3: Despliegue -->
      <div class="sec-title">Ruta de Implementación en 4 Fases</div>
      <div class="flow-card" style="border-left: 4px solid var(--gold); margin-bottom: 0;">
        <div class="flow-steps">
          <div class="step-item">
            <div class="step-badge" style="background: var(--gold);">F1</div>
            <div class="step-name">Padrón Digital</div>
            <div class="step-detail">Carga de socios y generación automática de carnets QR.</div>
          </div>
          <div class="step-item">
            <div class="step-badge" style="background: var(--gold);">F2</div>
            <div class="step-name">Capacitación</div>
            <div class="step-detail">Taller práctico con la directiva y delegados para uso fluido.</div>
          </div>
          <div class="step-item">
            <div class="step-badge" style="background: var(--gold);">F3</div>
            <div class="step-name">Piloto en Ensayo</div>
            <div class="step-detail">Prueba en vivo en el primer ensayo con soporte presencial.</div>
          </div>
          <div class="step-item">
            <div class="step-badge" style="background: var(--gold);">F4</div>
            <div class="step-name">Carnaval 2027</div>
            <div class="step-detail">Operación continua y consolidación de reportes finales.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Pág 2 -->
    <div class="page-footer">
      <span>Comparsa Cangallo Señorial — Plataforma Digital 2027</span>
      <span>Página 2 de 3</span>
    </div>
  </div>

  <!-- ==================== PÁGINA 3: PLANES POR USUARIO & SERVICIOS ==================== -->
  <div class="page">
    <div>
      <div class="header-banner" style="padding: 13px 18px;">
        <div class="header-logo-wrap" style="width: 48px; height: 48px;">
          <img src="${logoBase64}" alt="Logo Cangallo">
        </div>
        <div class="header-content">
          <h2 style="font-size: 16px; font-weight: 800; color: #FFF; font-family: 'Playfair Display', serif;">PLANES FLEXIBLES POR USUARIO & MANTENIMIENTO</h2>
          <p style="color: #E5E7EB; font-size: 10px;">Inversión operativa mínima, transparente y 100% autofinanciable por socio</p>
        </div>
      </div>

      <!-- Planes por Escala -->
      <div class="sec-title">1. Planes de Mantenimiento e Infraestructura Cloud</div>
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Plan Institucional</th>
            <th>Escala de Integrantes</th>
            <th>Costo Mensual / Socio</th>
            <th>Inversión por Temporada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Plan Base</strong></td>
            <td>Hasta 500 socios activos</td>
            <td>S/ 0.30 por socio / mes</td>
            <td>S/ 3.60 al año por socio</td>
          </tr>
          <tr class="highlight">
            <td><strong>Plan Señorial</strong> <span class="tag-recommend">Recomendado</span></td>
            <td><strong>Hasta 1,000 socios activos</strong></td>
            <td><strong>S/ 0.20 por socio / mes</strong></td>
            <td><strong>S/ 2.40 al año por socio</strong></td>
          </tr>
          <tr>
            <td><strong>Plan Élite / Masivo</strong></td>
            <td>Hasta 1,500 socios activos</td>
            <td>S/ 0.17 por socio / mes</td>
            <td>S/ 2.00 al año por socio</td>
          </tr>
        </tbody>
      </table>

      <!-- Servicios de Acompañamiento -->
      <div class="sec-title">2. Capacitación & Soporte Técnico Incluido</div>
      
      <div class="service-row">
        <div class="service-info">
          <strong>Taller de Capacitación para Directiva & Delegados</strong>
          <span>Inducción práctica de 1.5 horas para escaneo QR, validación de pagos y reportes.</span>
        </div>
        <div class="service-price">
          <span class="amount">S/ 350.00</span>
          <span class="sub">100% BONIFICADO GRATIS</span>
        </div>
      </div>

      <div class="service-row">
        <div class="service-info">
          <strong>Acompañamiento Técnico en Ensayo de Lanzamiento</strong>
          <span>Soporte presencial en puerta durante el primer ensayo oficial para garantizar 0 fallas.</span>
        </div>
        <div class="service-price">
          <span class="amount">S/ 200.00</span>
          <span class="sub">100% BONIFICADO GRATIS</span>
        </div>
      </div>

      <div class="service-row">
        <div class="service-info">
          <strong>Dominio Web Propio Oficial (cangallosenorial.com)</strong>
          <span>Enlace institucional personalizado con certificado de seguridad SSL candado verde.</span>
        </div>
        <div class="service-price">
          <span class="amount">S/ 120.00 / año</span>
          <span class="sub" style="color: #64748B;">OPCIONAL</span>
        </div>
      </div>

      <!-- Resumen Cuota Autofinanciada -->
      <div class="final-summary">
        <div class="final-left">
          <h4>RESUMEN DEL PLAN SEÑORIAL (1,000 INTEGRANTES)</h4>
          <p>
            • Plataforma y Sistema Web: 100% Desarrollado y Listo<br>
            • Servidores Cloud 24/7 + Base de Datos Blindada: Incluidos<br>
            • Capacitación + Soporte Presencial Inicial: Incluidos Gratis<br>
            • Dominio Personalizado Web (1 Año): S/ 120.00
          </p>
        </div>
        <div class="final-right">
          <div class="final-cost">S/ 2.50</div>
          <div class="final-per-user">por socio al año</div>
        </div>
      </div>

      <!-- SLA y Compromiso -->
      <div style="margin-top: 10px; padding: 8px 12px; background: #FAF7F2; border: 1px solid var(--border); border-radius: 8px; font-size: 9px; color: var(--muted);">
        <strong>COMPROMISO DE CALIDAD (SLA):</strong> 99.9% de disponibilidad en la nube, respaldo automático continuo, protección de datos de los integrantes y exportación libre de la información a Excel en cualquier momento.
      </div>
    </div>

    <!-- Firma & Footer Pág 3 -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px;">
        <div>
          <strong style="font-size: 11px; color: var(--dark);">Jhoan Taboada</strong><br>
          <span style="font-size: 9px; color: var(--muted);">Especialista en Implementación de Negocios & Soluciones Tecnológicas</span>
        </div>
        <div style="text-align: right; font-size: 9px; color: var(--muted);">
          <span>WhatsApp / Contacto: +51 988 888 888</span><br>
          <span>Email: jhoan.taboada@comparsa.pe</span>
        </div>
      </div>

      <div class="page-footer">
        <span>Comparsa Cangallo Señorial — Propuesta Técnica & Económica 2027</span>
        <span>Página 3 de 3</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, '..', 'public', 'dossier_propuesta.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const pdfOutputPath1 = path.join(__dirname, '..', 'public', 'Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf');
const pdfOutputPath2 = 'C:\\Users\\jhoan\\.gemini\\antigravity\\brain\\03e53288-970f-4e84-abdf-a8ce111ba82e\\Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath1}" --no-pdf-header-footer "file:///${htmlPath.replace(/\\/g, '/')}"`;

execSync(cmd);

if (fs.existsSync(pdfOutputPath1)) {
  fs.copyFileSync(pdfOutputPath1, pdfOutputPath2);
  console.log('PDF actualizado con terminología de Implementación de Negocios y sin nombres de proveedores.');
}
