import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let prisma;

if (process.env.NODE_ENV === 'production') {
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(srcDbPath)) {
          fs.copyFileSync(srcDbPath, tmpDbPath);
        }
      }
    } catch (e) {
      console.error('Error al copiar SQLite a /tmp en Vercel:', e);
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: fs.existsSync('/tmp/dev.db') ? 'file:/tmp/dev.db' : 'file:./prisma/dev.db',
        },
      },
    });
  } else {
    prisma = new PrismaClient();
  }
} else {
  const globalForPrisma = globalThis;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
