const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos con datos de prueba...');

  // Crear Usuarios
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Tesorero',
      email: 'admin@comparsa.com',
      phone: '999999999',
      role: 'ADMIN',
      avatarUrl: '/images/637900571_1346802750815312_4641331560730932914_n.jpg',
      qr_code_hash: crypto.randomBytes(16).toString('hex'),
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Juan Perez',
      email: 'juan@comparsa.com',
      phone: '988888888',
      role: 'MEMBER',
      avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
      qr_code_hash: crypto.randomBytes(16).toString('hex'),
    },
  });

  const musician = await prisma.user.create({
    data: {
      name: 'Carlos Trompeta',
      email: 'carlos@comparsa.com',
      phone: '977777777',
      role: 'MUSICIAN',
      avatarUrl: '/images/634378036_1346802200815367_7429235445478519296_n.jpg',
      qr_code_hash: crypto.randomBytes(16).toString('hex'),
    },
  });

  // Crear Ensayo
  const event = await prisma.event.create({
    data: {
      title: 'Ensayo General - Plaza Principal',
      date: new Date('2026-02-14T19:00:00Z'),
      location: 'Plaza de Armas',
      type: 'ENSAYO',
    },
  });

  // Crear Cuota
  const fee = await prisma.paymentFee.create({
    data: {
      title: 'Cuota de Febrero',
      amount: 50.00,
      dueDate: new Date('2026-02-20T00:00:00Z'),
    },
  });

  // Crear Registro de Pago PENDIENTE para el Miembro
  // (Omitimos al músico ya que no paga)
  await prisma.paymentRecord.create({
    data: {
      userId: member.id,
      feeId: fee.id,
      status: 'PENDING',
    },
  });

  // Crear Canción
  await prisma.song.create({
    data: {
      title: 'Carnaval Ayacuchano',
      lyrics: 'Este es el carnaval, ayacuchano...\nCon sus comparsas y sus guitarras...\n¡A cantar y bailar todos!',
    },
  });

  console.log('¡Base de datos inicializada exitosamente con 3 perfiles (Admin, Miembro, Músico)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
