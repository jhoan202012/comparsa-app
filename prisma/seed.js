const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos en Supabase...');

  try {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
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
          title: 'Ensayo General - Plaza Principal',
          date: new Date('2026-02-14T19:00:00Z'),
          location: 'Plaza de Armas',
          type: 'ENSAYO',
        },
      });
    }

    // Actualizar o crear catálogo con Varón, Mujer y Todos
    await prisma.paymentFee.deleteMany({});
    await prisma.paymentFee.createMany({
      data: [
        { title: '👕 Camisa Bordada de Comparsa', amount: 60.0, category: 'VESTUARIO', targetGender: 'VARON', sizes: 'S, M, L, XL', stock: 50 },
        { title: '👗 Pollera Ayacuchana Bordada', amount: 120.0, category: 'VESTUARIO', targetGender: 'MUJER', sizes: 'S, M, L', stock: 40 },
        { title: '🎩 Sombrero Tradicional de Comparsa', amount: 35.0, category: 'ACCESORIOS', targetGender: 'ALL', sizes: 'Estándar', stock: 60 },
        { title: '🧣 Faja / Pañuelo de Comparsa', amount: 25.0, category: 'ACCESORIOS', targetGender: 'ALL', sizes: 'Única', stock: 100 },
        { title: '💰 Cuota Mensual de Ensayo Febrero', amount: 50.0, category: 'CUOTA', targetGender: 'ALL', sizes: 'Única', stock: 999 },
      ]
    });

    console.log('¡Base de datos verificada y catálogo actualizado!');
  } catch (e) {
    console.log('Modo de compatibilidad de seed activo:', e.message);
  }
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
