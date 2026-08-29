const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath1 = path.join(__dirname, '..', 'public', 'Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf');
const outputPath2 = 'C:\\Users\\jhoan\\.gemini\\antigravity\\brain\\03e53288-970f-4e84-abdf-a8ce111ba82e\\Propuesta_Tecnica_Comercial_Cangallo_Senorial.pdf';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  info: {
    Title: 'Propuesta Técnica y Comercial - Comparsa Cangallo Señorial',
    Author: 'Jhoan Taboada',
    Subject: 'Digitalización y Plataforma de Gestión Integral',
    Keywords: 'Carnaval Ayacuchano, Cangallo Señorial, App, QR, Tesorería'
  }
});

const stream1 = fs.createWriteStream(outputPath1);
doc.pipe(stream1);

// Paleta de colores institucional
const C_GREEN = '#13603A';
const C_DARK_GREEN = '#0E472A';
const C_GOLD = '#D99B00';
const C_RED = '#B71C1C';
const C_TEXT = '#111827';
const C_MUTED = '#4B5563';
const C_BG_LIGHT = '#F9FAFB';
const C_BORDER = '#E5E7EB';

// ==================== PÁGINA 1: PORTADA & RESUMEN ====================

// Header Banner
doc.rect(0, 0, 595.28, 120).fill(C_GREEN);

doc.fillColor('#FCD34D')
   .fontSize(10)
   .font('Helvetica-Bold')
   .text('CARNAVAL AYACUCHANO 2027 • PROPUESTA OFICIAL', 45, 30, { letterSpacing: 1 });

doc.fillColor('#FFFFFF')
   .fontSize(22)
   .font('Helvetica-Bold')
   .text('COMPARSA CANGALLO SEÑORIAL', 45, 48);

doc.fillColor('#E5E7EB')
   .fontSize(11)
   .font('Helvetica')
   .text('Plataforma Digital de Gestión Integral, Asistencia QR & Tesorería', 45, 78);

doc.moveDown(4);

// Datos del documento
doc.rect(45, 135, 505.28, 48).fillAndStroke('#F4F0EA', C_GOLD);
doc.fillColor(C_TEXT).fontSize(9).font('Helvetica-Bold');
doc.text('PRESENTADO A:', 55, 145);
doc.font('Helvetica').text('Sr. Próspero Huayanay, Presidente & Junta Directiva', 160, 145);
doc.font('Helvetica-Bold').text('CONSULTOR / DESARROLLO:', 55, 160);
doc.font('Helvetica').text('Jhoan Taboada (Soluciones Tecnológicas & Eventos Masivos)', 215, 160);

// Sección 1: Resumen Ejecutivo
doc.y = 198;
doc.fillColor(C_GREEN).fontSize(14).font('Helvetica-Bold').text('1. RESUMEN EJECUTIVO & PROPÓSITO', 45, doc.y);
doc.rect(45, doc.y + 4, 505.28, 2).fill(C_GOLD);
doc.y += 12;

doc.fillColor(C_TEXT).fontSize(9.5).font('Helvetica').text(
  'La Comparsa Cangallo Señorial, como institución líder que convoca a más de 1,000 integrantes, afronta desafíos logísticos críticos durante la temporada de ensayos y presentaciones oficiales. ' +
  'Para superar los métodos manuales (listas en papel y comprobantes traspapelados en WhatsApp), se ha desarrollado una plataforma web moderna, segura y de alto rendimiento que opera 24/7 en cualquier celular.',
  45, doc.y, { width: 505.28, align: 'justify', lineGap: 3 }
);

// Destacado de Modelo Bonificado
doc.y += 10;
doc.rect(45, doc.y, 505.28, 45).fillAndStroke('#ECFDF5', '#10B981');
doc.fillColor(C_DARK_GREEN).fontSize(9.5).font('Helvetica-Bold').text(
  '★ MODELO DE ALIANZA E INNOVACIÓN: INVERSIÓN DE DESARROLLO S/ 0.00', 55, doc.y + 8
);
doc.fillColor(C_TEXT).fontSize(8.5).font('Helvetica').text(
  'El costo de ingeniería, arquitectura y desarrollo del software (valorizado en S/ 5,500.00) se otorga con una BONIFICACIÓN DEL 100% (Costo S/ 0.00). La institución únicamente cubre el mantenimiento por escala de usuarios, garantizando que el sistema se autofinancie con las cuotas.',
  55, doc.y + 20, { width: 485.28, lineGap: 2 }
);

// Sección 2: Módulos Operativos
doc.y += 58;
doc.fillColor(C_GREEN).fontSize(13).font('Helvetica-Bold').text('2. MÓDULOS DE LA PLATAFORMA INTEGRADA', 45, doc.y);
doc.rect(45, doc.y + 4, 505.28, 2).fill(C_GOLD);
doc.y += 12;

const modules = [
  {
    title: '• Módulo de Asistencia QR en Tiempo Real',
    desc: 'Escaneo con cámara de celular en 0.2 segundos por socio. Alternativa de marcado manual para delegados y métricas automáticas de puntualidad y asistencia.'
  },
  {
    title: '• Tienda de Vestuario & Gestión de Tallas',
    desc: 'Catálogo de camisas bordadas, polleras y accesorios. Registro estricto de tallas solicitadas (S, M, L, XL) y control de prendas entregadas para evitar pérdidas.'
  },
  {
    title: '• Tesorería Transparente & Validación Yape/Plin',
    desc: 'Los socios suben su captura de pago en HD. La directiva valida o revierte aportes con 1 toque. Reportes instantáneos exportables a Microsoft Excel.'
  },
  {
    title: '• Identidad, Cancionero Oficial & Buzón Directivo',
    desc: 'Letras oficiales de huaynos y carnavales al alcance de todos los integrantes, calendario de ensayos y canal confidencial para opiniones de los socios.'
  }
];

modules.forEach(m => {
  doc.fillColor(C_GREEN).fontSize(9.5).font('Helvetica-Bold').text(m.title, 45, doc.y);
  doc.fillColor(C_MUTED).fontSize(8.5).font('Helvetica').text(m.desc, 55, doc.y + 2, { width: 495.28, lineGap: 2 });
  doc.y += 12;
});

// Footer Página 1
doc.fontSize(8).fillColor(C_MUTED).text('Página 1 de 2 • Comparsa Cangallo Señorial — Plataforma Digital 2027', 45, 785, { align: 'center', width: 505.28 });

// ==================== PÁGINA 2: COTIZACIÓN & PLANES ====================
doc.addPage();

// Header Página 2
doc.rect(0, 0, 595.28, 45).fill(C_GREEN);
doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('COTIZACIÓN ECONÓMICA & PLANES DE MANTENIMIENTO', 45, 16);
doc.fillColor('#FCD34D').fontSize(9).font('Helvetica').text('TEMPORADA CARNAVAL AYACUCHANO 2027', 400, 18, { align: 'right' });

// Sección 3: Estructura de Costos
doc.y = 65;
doc.fillColor(C_GREEN).fontSize(13).font('Helvetica-Bold').text('3. COTIZACIÓN POR NÚMERO DE USUARIOS & INFRAESTRUCTURA', 45, doc.y);
doc.rect(45, doc.y + 4, 505.28, 2).fill(C_GOLD);
doc.y += 14;

doc.fillColor(C_TEXT).fontSize(8.5).font('Helvetica').text(
  'El costo de mantenimiento cubre: servidores en la nube de alta velocidad (Vercel Edge), base de datos redundante (Supabase PostgreSQL), copias de seguridad continuas, soporte contra caídas y disponibilidad del 99.9%.',
  45, doc.y, { width: 505.28, lineGap: 2 }
);

doc.y += 26;

// Tabla de Planes
const tableTop = doc.y;
const rowHeight = 26;

// Encabezado de tabla
doc.rect(45, tableTop, 505.28, 22).fill(C_GREEN);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
doc.text('PLAN / CAPACIDAD', 55, tableTop + 6);
doc.text('COBERTURA DE SOCIOS', 185, tableTop + 6);
doc.text('COSTO TEMPORADA', 345, tableTop + 6);
doc.text('COSTO / SOCIO AÑO', 455, tableTop + 6);

const plans = [
  { name: 'Plan Base', range: 'Hasta 500 integrantes', cost: 'S/ 1,800.00', perUser: 'S/ 3.60 / socio al año', bg: '#FFFFFF' },
  { name: '★ Plan Señorial (Recomendado)', range: 'Hasta 1,000 integrantes', cost: 'S/ 2,400.00', perUser: 'S/ 2.40 / socio al año', bg: '#FEF3C7', isHighlight: true },
  { name: 'Plan Élite / Masivo', range: 'Hasta 1,500 integrantes', cost: 'S/ 3,000.00', perUser: 'S/ 2.00 / socio al año', bg: '#FFFFFF' }
];

let currentY = tableTop + 22;
plans.forEach(p => {
  doc.rect(45, currentY, 505.28, rowHeight).fillAndStroke(p.bg, C_BORDER);
  doc.fillColor(p.isHighlight ? C_DARK_GREEN : C_TEXT).fontSize(8.5).font(p.isHighlight ? 'Helvetica-Bold' : 'Helvetica');
  doc.text(p.name, 55, currentY + 8);
  doc.text(p.range, 185, currentY + 8);
  doc.text(p.cost, 345, currentY + 8);
  doc.text(p.perUser, 455, currentY + 8);
  currentY += rowHeight;
});

// Sección 4: Servicios Adicionales (Capacitación y Soporte)
doc.y = currentY + 18;
doc.fillColor(C_GREEN).fontSize(13).font('Helvetica-Bold').text('4. SERVICIOS DE CAPACITACIÓN & SOPORTE TÉCNICO', 45, doc.y);
doc.rect(45, doc.y + 4, 505.28, 2).fill(C_GOLD);
doc.y += 12;

const services = [
  {
    name: 'Taller de Capacitación Directiva & Delegados',
    desc: 'Inducción de 1.5 horas para el uso del escáner QR, validación de pagos y reportes. Incluye manuales PDF.',
    price: 'S/ 350.00',
    note: '(BONIFICADO AL 100% con Plan Señorial)'
  },
  {
    name: 'Soporte Técnico Presencial en Ensayos Clave',
    desc: 'Acompañamiento en puerta en el primer ensayo oficial para garantizar 0 fallas y máxima velocidad.',
    price: 'S/ 200.00 / fecha',
    note: '(Paquete 3 ensayos: S/ 500.00)'
  },
  {
    name: 'Dominio Oficial Propio (cangallosenorial.com)',
    desc: 'Enlace web personalizado con certificado de seguridad SSL y candado verde de navegación protegida.',
    price: 'S/ 120.00 / año',
    note: '(Opcional)'
  }
];

services.forEach(s => {
  doc.rect(45, doc.y, 505.28, 38).fillAndStroke(C_BG_LIGHT, C_BORDER);
  doc.fillColor(C_GREEN).fontSize(9).font('Helvetica-Bold').text(s.name, 55, doc.y + 6);
  doc.fillColor(C_GOLD).fontSize(9).font('Helvetica-Bold').text(s.price, 440, doc.y + 6, { width: 100, align: 'right' });
  doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text(s.desc, 55, doc.y + 18, { width: 370 });
  doc.fillColor(C_DARK_GREEN).fontSize(7.5).font('Helvetica-Bold').text(s.note, 420, doc.y + 18, { width: 120, align: 'right' });
  doc.y += 44;
});

// Sección 5: Cuadro Resumen de Inversión Sugerida
doc.y += 6;
doc.rect(45, doc.y, 505.28, 62).fillAndStroke('#1C1917', C_GOLD);
doc.fillColor('#FCD34D').fontSize(10).font('Helvetica-Bold').text('RESUMEN PAQUETE INTEGRAL RECOMENDADO (TEMPORADA 2027)', 55, doc.y + 8);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica').text(
  '• Desarrollo & Software: S/ 0.00 (Bonificado)    • Plan Señorial Cloud (1,000 socios): S/ 2,400.00\n' +
  '• Taller de Capacitación a Delegados: INCLUIDO GRATIS    • Soporte en Ensayo Inicial: INCLUIDO GRATIS\n' +
  '• Dominio Personalizado Web (1 Año): S/ 120.00',
  55, doc.y + 22, { lineGap: 3 }
);
doc.fillColor('#34D399').fontSize(11).font('Helvetica-Bold').text('TOTAL TEMPORADA: S/ 2,520.00 (S/ 2.50 por socio)', 55, doc.y + 48);

// Firma
doc.y += 75;
doc.fillColor(C_TEXT).fontSize(9).font('Helvetica-Bold').text('Jhoan Taboada', 45, doc.y);
doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('Consultor de Soluciones Tecnológicas & Digitalización • Contacto: jhoan.taboada@comparsa.pe', 45, doc.y + 11);

// Footer Página 2
doc.fontSize(8).fillColor(C_MUTED).text('Página 2 de 2 • Comparsa Cangallo Señorial — Propuesta Técnica & Económica 2027', 45, 785, { align: 'center', width: 505.28 });

doc.end();

stream1.on('finish', () => {
  try {
    fs.copyFileSync(outputPath1, outputPath2);
    console.log('PDF generado exitosamente en ambas ubicaciones:');
    console.log('1.', outputPath1);
    console.log('2.', outputPath2);
  } catch (err) {
    console.error('Error al copiar a la segunda ubicación:', err);
  }
});
