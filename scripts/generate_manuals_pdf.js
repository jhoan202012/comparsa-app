const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createPdf(title, subtitle, sections, filename) {
  const doc = new PDFDocument({ margin: 40 });
  const outputPath = path.join(__dirname, '../public', filename);
  const backupPath = path.join('D:\\Proyecto_comparsa_cangallo señorial', filename);

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Header Banner
  doc.fillColor('#13603A').fontSize(20).font('Helvetica-Bold').text('COMPARSA CANGALLO SEÑORIAL', { align: 'center' });
  doc.fillColor('#D99B00').fontSize(14).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown(0.3);
  doc.fillColor('#4B5563').fontSize(10).font('Helvetica').text(subtitle, { align: 'center' });

  doc.moveDown(0.8);
  doc.strokeColor('#CBD5E1').lineWidth(1.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(1);

  sections.forEach(sec => {
    doc.fillColor('#13603A').fontSize(12).font('Helvetica-Bold').text(sec.heading);
    doc.moveDown(0.3);
    doc.fillColor('#1F2937').fontSize(9.5).font('Helvetica').text(sec.content, { lineHeight: 1.4 });
    doc.moveDown(0.8);
  });

  doc.moveDown(1);
  doc.fillColor('#6B7280').fontSize(8.5).font('Helvetica-Oblique').text('Manual de Uso Oficial - Carnaval Ayacuchano 2027.', { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log(`PDF generado: ${outputPath}`);
    try {
      fs.copyFileSync(outputPath, backupPath);
      console.log(`Respaldo generado: ${backupPath}`);
    } catch (e) {
      console.log(`Guardado local completado`);
    }
  });
}

// 1. MANUAL INTEGRANTES Y MÚSICOS
createPdf(
  'MANUAL DE USUARIO: INTEGRANTES & MÚSICOS',
  'Guía paso a paso para Bailarines y Músicos de la Comparsa (Carnaval 2027)',
  [
    {
      heading: 'PASO 1: Ingreso a la Plataforma',
      content: '1. Inicia sesión en la web http://localhost:3000/login con tu DNI o celular.\n2. Ingresa tu PIN de 4 dígitos (PIN inicial por defecto: 1234).\n3. En ensayaderos puedes usar el botón "¿En ensayo? Selecciona tu perfil rápido aquí" para un acceso inmediato.'
    },
    {
      heading: 'PASO 2: Mostrar tu Carnet QR para Asistencias',
      content: '1. Haz clic en "Mostrar mi Código QR" en tu inicio.\n2. Muestra la pantalla al Administrador en el ensayo.\n3. Al escanearlo, tu asistencia quedará registrada inmediatamente en la base de datos.'
    },
    {
      heading: 'PASO 3: Solicitar Vestuario por Talla (S, M, L, XL)',
      content: '1. Entra a "Mis Pagos & Vestuario" y presiona la pestaña "Pedir Vestuario".\n2. Filtra por género (Varones / Mujeres) y selecciona tu prenda.\n3. Elige tu talla (S, M, L, XL), escanea el QR Yape y adjunta tu comprobante de pago.\n4. Estado: Cambiará de "Por Validar" a "ENTREGADO Y RECIBIDO" cuando el taller te entregue la ropa.'
    },
    {
      heading: 'PASO 4: Registrar Aportes Monetarios (Ensayos / Pasajes / Banda)',
      content: '1. En la pestaña "Pagar Aporte", selecciona la cuota a cancelar.\n2. Adjunta tu voucher de Yape/Plin y confirma el pago sin necesidad de solicitar tallas.'
    },
    {
      heading: 'PASO 5: Enviar Mensajes en el Buzón Directivo (Oficial o Anónimo)',
      content: '1. Entra a "Buzón Directivo" para enviar Sugerencias, Reclamos o Consultas.\n2. Puedes dejar tu nombre o marcar "Enviar como Anónimo" para opinar con 100% de reserva.'
    }
  ],
  'MANUAL_USUARIO_INTEGRANTE_Y_MUSICOS.pdf'
);

// 2. MANUAL ADMINISTRADOR Y JUNTA DIRECTIVA
createPdf(
  'MANUAL OPERATIVO: ADMINISTRADOR & JUNTA DIRECTIVA',
  'Guía completa para la Directiva, Tesorería y Logística de la Comparsa',
  [
    {
      heading: 'PASO 1: Control de Asistencias por Cámara (Escáner HD)',
      content: '1. En el menú presiona "Escáner" y concede permisos de cámara en tu celular.\n2. Apunta la cámara al Carnet QR del socio para registrar la asistencia presencial al instante.\n3. Para registros manuales sin celular, usa el Padrón de Integrantes.'
    },
    {
      heading: 'PASO 2: Validación de Vouchers Yape & Publicación de Cuotas',
      content: '1. En "Validar Aportes & Pedidos", publica prendas con "+ Agregar Vestuario" (tallas S/M/L/XL, stock, género) o cuotas con "+ Crear Aporte".\n2. Revisa las capturas Yape en HD y presiona "Aprobar Pago" o "Rechazar".'
    },
    {
      heading: 'PASO 3: Control Logístico de Entrega Física de Vestuario',
      content: '1. Cuando el taller confeccione la ropa y el socio la recoja, búscalo por nombre o DNI en la barra de búsqueda.\n2. Presiona el botón azul "Marcar como ENTREGADO AL SOCIO".\n3. Su estado cambiará a "ENTREGADO Y RECIBIDO", evitando reclamos duplicados.'
    },
    {
      heading: 'PASO 4: Reportería en 3 Slides con Exportación a Excel (.xlsx)',
      content: '1. En "Reportes", navega por los 3 slides independientes.\n2. Slide 1 (Asistencias): Exportar planilla de puntualidad en Excel.\n3. Slide 2 (Vestuario): Exportar resumen exacto de prendas por talla para el taller.\n4. Slide 3 (Tesorería): Exportar balance contable de recaudación en Soles para asamblea.'
    },
    {
      heading: 'PASO 5: Revisión de Sugerencias y Reclamos en Buzón',
      content: '1. En "Buzón Directivo", revisa los mensajes clasificados por Sugerencia, Reclamo o Consulta.\n2. Filtra mensajes identificados o enviados en modo "Socio Anónimo".'
    }
  ],
  'MANUAL_ADMINISTRADOR_JUNTA_DIRECTIVA.pdf'
);
