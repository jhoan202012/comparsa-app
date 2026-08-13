import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

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

const memoryStore = {
  users: [...fallbackUsers],
  events: [
    {
      id: 'event-001-ensayo-general',
      title: 'Ensayo General - Plaza Principal',
      type: 'ENSAYO',
      date: new Date('2026-02-14T19:00:00Z'),
      location: 'Plaza de Armas',
      qr_token: 'token-qr-ensayo-001'
    }
  ],
  fees: [
    { id: 'fee-1', title: '👕 Camisa Bordada de Comparsa', amount: 60.0, category: 'VESTUARIO', gender: 'VARON', availableSizes: 'S, M, L, XL', stock: 50 },
    { id: 'fee-2', title: '👗 Pollera Ayacuchana Bordada', amount: 120.0, category: 'VESTUARIO', gender: 'MUJER', availableSizes: 'S, M, L', stock: 40 },
    { id: 'fee-3', title: '🎩 Sombrero Tradicional de Comparsa', amount: 35.0, category: 'ACCESORIOS', gender: 'ALL', availableSizes: 'Estándar', stock: 60 },
    { id: 'fee-4', title: '🧣 Faja / Pañuelo de Comparsa', amount: 25.0, category: 'ACCESORIOS', gender: 'ALL', availableSizes: 'Única', stock: 100 },
    { id: 'fee-5', title: '💰 Cuota Mensual de Ensayo Febrero', amount: 50.0, category: 'CUOTA', gender: 'ALL', availableSizes: 'Única', stock: 999 }
  ],
  payments: [],
  attendances: [],
  feedbacks: []
};

let realPrisma = null;
try {
  realPrisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = realPrisma;
} catch (e) {
  console.warn('Init realPrisma:', e?.message || e);
}

const createModelProxy = (modelName) => {
  return new Proxy({}, {
    get(target, prop) {
      return async (...args) => {
        // 1. Intentar usar Prisma real
        if (realPrisma && realPrisma[modelName] && typeof realPrisma[modelName][prop] === 'function') {
          try {
            const res = await realPrisma[modelName][prop](...args);
            if (res !== undefined && res !== null) return res;
          } catch (err) {
            // Ignorar y pasar a memoria
          }
        }

        // 2. Respaldo en memoria garantizado
        if (modelName === 'user') {
          if (prop === 'findUnique' || prop === 'findFirst') {
            const where = args[0]?.where || {};
            return memoryStore.users.find(u =>
              (where.id && u.id === where.id) ||
              (where.dni && u.dni === where.dni) ||
              (where.phone && u.phone === where.phone) ||
              (where.email && u.email === where.email)
            ) || null;
          }
          if (prop === 'findMany') return memoryStore.users;
          if (prop === 'count') return memoryStore.users.length;
        }

        if (modelName === 'event') {
          if (prop === 'findFirst' || prop === 'findUnique') return memoryStore.events[0] || null;
          if (prop === 'findMany') return memoryStore.events;
          if (prop === 'count') return memoryStore.events.length;
        }

        if (modelName === 'paymentFee') {
          if (prop === 'findMany') return memoryStore.fees;
          if (prop === 'findFirst' || prop === 'findUnique') return memoryStore.fees[0] || null;
          if (prop === 'count') return memoryStore.fees.length;
        }

        if (modelName === 'paymentRecord') {
          if (prop === 'findMany') return memoryStore.payments;
          if (prop === 'count') return memoryStore.payments.length;
        }

        if (modelName === 'attendance') {
          if (prop === 'findMany') return memoryStore.attendances;
          if (prop === 'count') return memoryStore.attendances.length;
        }

        if (modelName === 'feedback') {
          if (prop === 'findMany') return memoryStore.feedbacks;
          if (prop === 'count') return memoryStore.feedbacks.length;
        }

        if (prop === 'count') return 0;
        if (prop === 'findMany') return [];
        return null;
      };
    }
  });
};

export const prisma = new Proxy({}, {
  get(target, prop) {
    if (['user', 'event', 'paymentFee', 'paymentRecord', 'attendance', 'feedback'].includes(prop)) {
      return createModelProxy(prop);
    }
    if (realPrisma && realPrisma[prop]) {
      return realPrisma[prop];
    }
    return () => Promise.resolve(null);
  }
});

export async function getDbUser(userId) {
  if (!userId) return null;
  try {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u) return u;
  } catch (e) {
    // Ignorar
  }
  return fallbackUsers.find(u => u.id === userId || u.dni === userId) || fallbackUsers[0];
}

export default prisma;
