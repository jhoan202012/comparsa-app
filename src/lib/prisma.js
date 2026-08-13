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

export { prisma };
export default prisma;
