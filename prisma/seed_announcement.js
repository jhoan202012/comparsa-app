const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    const existing = await prisma.announcement.findFirst();
    if (!existing) {
      await prisma.announcement.create({
        data: {
          title: '¡Atención Comparsa! Fotos Oficiales de Traje',
          content: 'Estimados socios y músicos, este domingo 16 de agosto se realizarán las tomas de fotos oficiales para la comparsa. Favor de acudir con el vestuario completo.',
          category: 'VESTUARIO',
          authorId: admin.id
        }
      });
      console.log('Comunicado inicial creado exitosamente');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
