import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // En Vercel o producción Serverless (entorno de solo lectura)
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const altSourceDbPath = path.join(process.cwd(), 'dev.db');

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } else if (fs.existsSync(altSourceDbPath)) {
          fs.copyFileSync(altSourceDbPath, tmpDbPath);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (e) {
      console.error('Error al preparar SQLite en /tmp:', e);
    }
  }

  // En desarrollo local
  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath}`;
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const fallbackUsers = [
  {
    id: 'd16daa56-6856-46f7-b3cc-82e75f412f88',
    name: 'Admin Tesorero',
    dni: '99999999',
    phone: '999999999',
    role: 'ADMIN',
    status: 'ACTIVE',
    pin: '1234',
    avatarUrl: '/images/637900571_1346802750815312_4641331560730932914_n.jpg',
    qr_code_hash: 'admin-qr-hash-permanent-001'
  },
  {
    id: 'dda2d513-87c3-4933-b81e-4e1e641ba89c',
    name: 'Juan Perez',
    dni: '98888888',
    phone: '988888888',
    role: 'MEMBER',
    status: 'ACTIVE',
    pin: '1234',
    avatarUrl: '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
    qr_code_hash: 'juan-perez-qr-hash-permanent-002'
  },
  {
    id: '7806cb12-fb9c-4888-9ab6-c34e0028cc6c',
    name: 'Carlos Trompeta',
    dni: '97777777',
    phone: '977777777',
    role: 'MUSICIAN',
    status: 'ACTIVE',
    pin: '1234',
    avatarUrl: '/images/634378036_1346802200815367_7429235445478519296_n.jpg',
    qr_code_hash: 'carlos-musico-qr-hash-permanent-003'
  }
];

export async function getDbUser(userId) {
  if (!userId) return null;
  try {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u) return u;
  } catch (e) {
    console.error('Error consultando usuario en prisma:', e?.message || e);
  }
  return fallbackUsers.find(u => u.id === userId || u.dni === userId) || fallbackUsers[0];
}

export { prisma };
export default prisma;
