const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando fotos de perfil de los usuarios...');

  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { avatarUrl: '/images/637900571_1346802750815312_4641331560730932914_n.jpg' }
  });

  await prisma.user.updateMany({
    where: { role: 'MEMBER' },
    data: { avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg' }
  });

  await prisma.user.updateMany({
    where: { role: 'MUSICIAN' },
    data: { avatarUrl: '/images/634378036_1346802200815367_7429235445478519296_n.jpg' }
  });

  console.log('¡Fotos de perfil actualizadas con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
