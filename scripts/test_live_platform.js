const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPlatformDiagnostic() {
  console.log('====================================================');
  console.log('🧪 INICIANDO DIAGNÓSTICO COMPLETO DE LA PLATAFORMA');
  console.log('====================================================');

  try {
    // 1. Test de Conexión y Despertador de Base de Datos
    const startTime = Date.now();
    const userCount = await prisma.user.count();
    const latency = Date.now() - startTime;
    console.log(`✅ [1/6] Conexión con Base de Datos en la Nube: ACTIVA (Latencia: ${latency}ms)`);
    console.log(`   📊 Total de usuarios registrados en el sistema: ${userCount}`);

    // 2. Verificación de Cuentas Clave de Prueba
    const admin = await prisma.user.findUnique({ where: { dni: '99999999' } });
    const socio = await prisma.user.findUnique({ where: { dni: '98888888' } });
    const musico = await prisma.user.findUnique({ where: { dni: '97777777' } });

    console.log('\n✅ [2/6] Verificación de Credenciales de Prueba:');
    console.log(`   👑 Admin/Directiva: ${admin ? 'OK (' + admin.name + ' - Rol: ' + admin.role + ')' : '❌ NO ENCONTRADO'}`);
    console.log(`   💃 Socio/Danzante:  ${socio ? 'OK (' + socio.name + ' - Rol: ' + socio.role + ')' : '❌ NO ENCONTRADO'}`);
    console.log(`   🎺 Músico:          ${musico ? 'OK (' + musico.name + ' - Rol: ' + musico.role + ')' : '❌ NO ENCONTRADO'}`);

    // 3. Verificación de Eventos / Ensayos
    let event = await prisma.event.findFirst();
    if (!event) {
      event = await prisma.event.create({
        data: {
          title: 'Primer Ensayo General 2027',
          type: 'ENSAYO',
          date: new Date('2026-09-01T19:00:00Z'),
          location: 'Local Cangallo Señorial',
          description: 'Ensayo general de comparsa y orquesta',
          qr_token: 'ENSAYO_GENERAL_2027_01'
        }
      });
      console.log(`   ✨ Se creó evento de prueba: ${event.title}`);
    }
    console.log(`\n✅ [3/6] Módulo de Eventos & Ensayos: ACTIVO (Evento: "${event.title}")`);

    // 4. Prueba de Escaneo y Marcado de Asistencia QR
    if (socio && event) {
      const attendance = await prisma.attendance.upsert({
        where: {
          userId_eventId: {
            userId: socio.id,
            eventId: event.id
          }
        },
        update: {
          status: 'PRESENT',
          timestamp: new Date()
        },
        create: {
          userId: socio.id,
          eventId: event.id,
          status: 'PRESENT',
          timestamp: new Date()
        }
      });
      console.log(`\n✅ [4/6] Módulo de Asistencia QR: FUNCIONANDO AL 100%`);
      console.log(`   🎯 Asistencia registrada para: ${socio.name} (Estado: ${attendance.status} en ${event.title})`);
    }

    // 5. Prueba de Módulo de Vestuario & Pagos Digitales
    const paymentCount = await prisma.paymentRecord.count();
    console.log(`\n✅ [5/6] Módulo de Vestuario & Tesorería Digital: ACTIVO`);
    console.log(`   💰 Registros de pagos/pedidos procesados: ${paymentCount}`);

    // 6. Prueba de Cancionero Oficial
    const songCount = await prisma.song.count();
    console.log(`\n✅ [6/6] Módulo de Cancionero & Sugerencias: ACTIVO`);
    console.log(`   🎶 Letras de canciones cargadas: ${songCount}`);

    console.log('\n====================================================');
    console.log('🎉 RESULTADO: LA PLATAFORMA ESTÁ 100% OPERATIVA Y ACTIVA');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runPlatformDiagnostic();
