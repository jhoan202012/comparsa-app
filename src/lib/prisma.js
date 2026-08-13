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

// Auto-creador auto-recuperable de tablas e inicio de usuarios en Vercel
let tablesInitialized = false;
async function initTables() {
  if (tablesInitialized) return;
  tablesInitialized = true;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "dni" TEXT UNIQUE,
        "email" TEXT UNIQUE,
        "phone" TEXT UNIQUE,
        "role" TEXT NOT NULL DEFAULT 'MEMBER',
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "pin" TEXT DEFAULT '1234',
        "avatarUrl" TEXT,
        "qr_code_hash" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "date" DATETIME NOT NULL,
        "location" TEXT NOT NULL,
        "qr_token" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PaymentFee" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'OTRO',
        "description" TEXT,
        "stock" INTEGER DEFAULT 100,
        "gender" TEXT DEFAULT 'UNISEX',
        "availableSizes" TEXT DEFAULT 'S,M,L,XL',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PaymentRecord" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "feeId" TEXT,
        "amount" REAL NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "receiptUrl" TEXT,
        "validatedById" TEXT,
        "validatedAt" DATETIME,
        "itemsDetail" TEXT,
        "deliveryStatus" TEXT DEFAULT 'PENDIENTE',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Feedback" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "type" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isAnonymous" BOOLEAN NOT NULL DEFAULT 0,
        "userName" TEXT,
        "userRole" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "User" ("id", "name", "dni", "phone", "role", "status", "pin", "avatarUrl", "qr_code_hash")
      VALUES 
      ('d16daa56-6856-46f7-b3cc-82e75f412f88', 'Admin Tesorero', '99999999', '999999999', 'ADMIN', 'ACTIVE', '1234', '/images/637900571_1346802750815312_4641331560730932914_n.jpg', 'admin-qr-hash-permanent-001'),
      ('dda2d513-87c3-4933-b81e-4e1e641ba89c', 'Juan Perez', '98888888', '988888888', 'MEMBER', 'ACTIVE', '1234', '/images/634076865_1346800880815499_5762101862002171797_n.jpg', 'juan-perez-qr-hash-permanent-002'),
      ('7806cb12-fb9c-4888-9ab6-c34e0028cc6c', 'Carlos Trompeta', '97777777', '977777777', 'MUSICIAN', 'ACTIVE', '1234', '/images/634378036_1346802200815367_7429235445478519296_n.jpg', 'carlos-musico-qr-hash-permanent-003');
    `);

    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "Event" ("id", "title", "type", "date", "location", "qr_token")
      VALUES
      ('event-001-ensayo-general', 'Ensayo General - Plaza Principal', 'ENSAYO', '2026-02-14 19:00:00', 'Plaza de Armas', 'token-qr-ensayo-001');
    `);
  } catch (e) {
    console.error('Info initTables:', e?.message || e);
  }
}

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  initTables();
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
export default prisma;
