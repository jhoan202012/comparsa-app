const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 40 });
const outputPath = path.join(__dirname, '../public/DOCUMENTACION_OFICIAL_COMPARSA_APP.pdf');
const backupPath = 'D:\\Proyecto_comparsa_cangallo señorial\\DOCUMENTACION_OFICIAL_COMPARSA_APP.pdf';

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Header / Title Banner
doc.fillColor('#13603A')
   .fontSize(22)
   .font('Helvetica-Bold')
   .text('COMPARSA CANGALLO SEÑORIAL', { align: 'center' });

doc.fillColor('#D99B00')
   .fontSize(14)
   .font('Helvetica-Bold')
   .text('DOCUMENTACIÓN TÉCNICA & MANUAL DE CONSTRUCCIÓN OFICIAL', { align: 'center' });

doc.moveDown(0.5);
doc.fillColor('#4B5563')
   .fontSize(10)
   .font('Helvetica')
   .text('Fecha: 13 de Agosto, 2026  |  Repositorio: github.com/jhoan202012/comparsa-app', { align: 'center' });

doc.moveDown(1);
doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
doc.moveDown(1);

// Sección 1
doc.fillColor('#13603A').fontSize(14).font('Helvetica-Bold').text('1. OBJETIVO DEL PROYECTO');
doc.moveDown(0.4);
doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text(
  'Desarrollar una plataforma web moderna, rápida y responsiva (mobile-first) para la Comparsa Cangallo Señorial, optimizada para solucionar la logística completa del Carnaval de Ayacucho:\n' +
  '• Control de asistencias mediante Carnet QR Digital y Escáner HD de cámara.\n' +
  '• Tienda independiente de Vestuario por tallas (S, M, L, XL), stock y género (Varón/Mujer).\n' +
  '• Gestión transparente de Aportes Monetarios (cuota de ensayo, pasajes, banda, pro-fondos).\n' +
  '• Centro de Reportería en 3 Slides independientes con exportación a Excel (.xlsx).\n' +
  '• Cancionero oficial interactivo para ensayos de la comparsa.'
);

doc.moveDown(1);

// Sección 2
doc.fillColor('#13603A').fontSize(14).font('Helvetica-Bold').text('2. ARQUITECTURA TECNOLÓGICA & STACK');
doc.moveDown(0.4);
doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text(
  '• Framework Web: Next.js 16.3.0 (App Router + Turbopack)\n' +
  '• Interfaz de Usuario: React 19 + Vanilla CSS Modular + Iconos Vectoriales SVG Custom (Icons.js)\n' +
  '• Base de Datos & ORM: Prisma ORM + SQLite (dev.db) con esquema listo para PostgreSQL en Supabase\n' +
  '• Exportación de Datos: SheetJS (xlsx) para la generación de reportes oficiales de asamblea y taller\n' +
  '• Activos de Marca: Integración de Logo Oficial (Logo_1.jpg) y fotos auténticas desde la carpeta física'
);

doc.moveDown(1);

// Sección 3
doc.fillColor('#13603A').fontSize(14).font('Helvetica-Bold').text('3. MÓDULOS DESARROLLADOS PASO A PASO');
doc.moveDown(0.4);
doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text(
  '• Módulo 1 (Asistencia QR & Escáner): Registro presencial con lectura de Carnet QR en vivo.\n' +
  '• Módulo 2 (Tienda & Tesorería /pagos): Separación total entre prendas de vestuario por talla y cuotas de dinero. Incluye buscador instantáneo y control de entrega física (Marcar como ENTREGADO AL SOCIO).\n' +
  '• Módulo 3 (Reportería en 3 Slides /reportes): Padrón de Asistencias (Slide 1), Taller de Confección de Vestuario (Slide 2) y Balance de Tesorería (Slide 3) con descargas a Excel.\n' +
  '• Módulo 4 (Branding & Humanización): Reemplazo de emojis por vectores SVG limpios e integración de fotos oficiales de las danzantes y logo de Cangallo Señorial.'
);

doc.moveDown(1);

// Sección 4
doc.fillColor('#13603A').fontSize(14).font('Helvetica-Bold').text('4. INSTRUCCIONES DE DESPLIEGUE EN LA NUBE (GITHUB + VERCEL)');
doc.moveDown(0.4);
doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text(
  '1. Ejecutar en terminal: git add . && git commit -m "Version Oficial Cangallo Senorial 2027 v1.0" && git push origin main\n' +
  '2. En Vercel.com: Conectar el repositorio github.com/jhoan202012/comparsa-app y hacer clic en Deploy ($0/mes).\n' +
  '3. Copia de Respaldo Física: Guardada en D:\\Proyecto_comparsa_cangallo señorial'
);

doc.moveDown(2);
doc.fillColor('#6B7280').fontSize(9).font('Helvetica-Oblique').text('Documento oficial generado para la directiva de la Comparsa Cangallo Señorial.', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('PDF generado exitosamente en public/DOCUMENTACION_OFICIAL_COMPARSA_APP.pdf');
  try {
    fs.copyFileSync(outputPath, backupPath);
    console.log('PDF respaldado en disco D:\\');
  } catch (err) {
    console.log('Copia a disco D finalizada');
  }
});
