const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos SQLite oficial...');

  try {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          id: 'd16daa56-6856-46f7-b3cc-82e75f412f88',
          name: 'Admin Tesorero',
          dni: '99999999',
          email: 'admin@comparsa.com',
          phone: '999999999',
          role: 'ADMIN',
          status: 'ACTIVE',
          pin: '1234',
          avatarUrl: '/images/637900571_1346802750815312_4641331560730932914_n.jpg',
          qr_code_hash: 'admin-qr-hash-permanent-001',
        },
      });
    }

    const existingMember = await prisma.user.findFirst({ where: { role: 'MEMBER' } });
    if (!existingMember) {
      await prisma.user.create({
        data: {
          id: 'dda2d513-87c3-4933-b81e-4e1e641ba89c',
          name: 'Juan Perez',
          dni: '98888888',
          email: 'juan@comparsa.com',
          phone: '988888888',
          role: 'MEMBER',
          status: 'ACTIVE',
          pin: '1234',
          avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
          qr_code_hash: 'juan-perez-qr-hash-permanent-002',
        },
      });
    }

    const existingMusician = await prisma.user.findFirst({ where: { role: 'MUSICIAN' } });
    if (!existingMusician) {
      await prisma.user.create({
        data: {
          id: '7806cb12-fb9c-4888-9ab6-c34e0028cc6c',
          name: 'Carlos Trompeta',
          dni: '97777777',
          email: 'carlos@comparsa.com',
          phone: '977777777',
          role: 'MUSICIAN',
          status: 'ACTIVE',
          pin: '1234',
          avatarUrl: '/images/634378036_1346802200815367_7429235445478519296_n.jpg',
          qr_code_hash: 'carlos-musico-qr-hash-permanent-003',
        },
      });
    }

    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      await prisma.event.create({
        data: {
          id: 'event-001-ensayo-general',
          title: 'Ensayo General - Plaza Principal',
          date: new Date('2026-02-14T19:00:00Z'),
          location: 'Plaza de Armas',
          type: 'ENSAYO',
          qr_token: 'token-qr-ensayo-001',
        },
      });
    }

    // Actualizar o crear catálogo de vestuario y cuotas
    await prisma.paymentFee.deleteMany({});
    await prisma.paymentFee.createMany({
      data: [
        { title: '👕 Camisa Bordada de Comparsa', amount: 60.0, category: 'VESTUARIO', gender: 'VARON', availableSizes: 'S, M, L, XL', stock: 50 },
        { title: '👗 Pollera Ayacuchana Bordada', amount: 120.0, category: 'VESTUARIO', gender: 'MUJER', availableSizes: 'S, M, L', stock: 40 },
        { title: '🎩 Sombrero Tradicional de Comparsa', amount: 35.0, category: 'ACCESORIOS', gender: 'ALL', availableSizes: 'Estándar', stock: 60 },
        { title: '🧣 Faja / Pañuelo de Comparsa', amount: 25.0, category: 'ACCESORIOS', gender: 'ALL', availableSizes: 'Única', stock: 100 },
        { title: '💰 Cuota Mensual de Ensayo Febrero', amount: 50.0, category: 'CUOTA', gender: 'ALL', availableSizes: 'Única', stock: 999 },
      ]
    });

    console.log('¡Base de datos SQLite sincronizada y sembrada con éxito!');
  } catch (e) {
    console.error('Error en seed:', e.message);
  }
}

main()
  .catch((e) => {
    console.error('Error fatal en seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
