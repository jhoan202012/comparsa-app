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
    qr_code_hash: 'admin-qr-hash-permanent-001',
    createdAt: new Date()
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
    qr_code_hash: 'juan-perez-qr-hash-permanent-002',
    createdAt: new Date()
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
    qr_code_hash: 'carlos-musico-qr-hash-permanent-003',
    createdAt: new Date()
  }
];

if (!globalForPrisma._comparsaMemoryStore) {
  globalForPrisma._comparsaMemoryStore = {
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
}

const memoryStore = globalForPrisma._comparsaMemoryStore;

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
            // Silencioso, pasar a memoryStore
          }
        }

        // 2. Operaciones CRUD en memoryStore
        if (modelName === 'user') {
          if (prop === 'create') {
            const data = args[0]?.data || {};
            const newUser = {
              id: data.id || `user-${Date.now()}`,
              name: data.name || 'Nuevo Socio',
              dni: data.dni || null,
              phone: data.phone || null,
              email: data.email || null,
              role: data.role || 'MEMBER',
              status: data.status || 'PENDING',
              pin: data.pin || '1234',
              avatarUrl: data.avatarUrl || '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
              qr_code_hash: data.qr_code_hash || `qr-${Date.now()}`,
              createdAt: new Date()
            };
            memoryStore.users.push(newUser);
            return newUser;
          }
          if (prop === 'update') {
            const { where = {}, data = {} } = args[0] || {};
            const idx = memoryStore.users.findIndex(u => (where.id && u.id === where.id) || (where.dni && u.dni === where.dni));
            if (idx !== -1) {
              memoryStore.users[idx] = { ...memoryStore.users[idx], ...data, updatedAt: new Date() };
              return memoryStore.users[idx];
            }
            return null;
          }
          if (prop === 'delete') {
            const where = args[0]?.where || {};
            const idx = memoryStore.users.findIndex(u => where.id && u.id === where.id);
            if (idx !== -1) {
              return memoryStore.users.splice(idx, 1)[0];
            }
            return null;
          }
          if (prop === 'findUnique' || prop === 'findFirst') {
            const where = args[0]?.where || {};
            return memoryStore.users.find(u =>
              (where.id && u.id === where.id) ||
              (where.dni && u.dni === where.dni) ||
              (where.phone && u.phone === where.phone) ||
              (where.email && u.email === where.email)
            ) || null;
          }
          if (prop === 'findMany') {
            const where = args[0]?.where;
            if (where?.role?.in) {
              return memoryStore.users.filter(u => where.role.in.includes(u.role));
            }
            if (where?.status) {
              return memoryStore.users.filter(u => u.status === where.status);
            }
            return memoryStore.users;
          }
          if (prop === 'count') {
            const where = args[0]?.where;
            if (where?.role?.in) {
              return memoryStore.users.filter(u => where.role.in.includes(u.role)).length;
            }
            return memoryStore.users.length;
          }
        }

        if (modelName === 'feedback') {
          if (prop === 'create') {
            const data = args[0]?.data || {};
            const newFeedback = {
              id: `fb-${Date.now()}`,
              userId: data.userId || null,
              type: data.type || 'SUGERENCIA',
              message: data.message || '',
              isAnonymous: Boolean(data.isAnonymous),
              userName: data.userName || 'Socio',
              userRole: data.userRole || 'MEMBER',
              status: data.status || 'PENDIENTE',
              createdAt: new Date()
            };
            memoryStore.feedbacks.unshift(newFeedback);
            return newFeedback;
          }
          if (prop === 'update') {
            const { where = {}, data = {} } = args[0] || {};
            const idx = memoryStore.feedbacks.findIndex(f => f.id === where.id);
            if (idx !== -1) {
              memoryStore.feedbacks[idx] = { ...memoryStore.feedbacks[idx], ...data };
              return memoryStore.feedbacks[idx];
            }
          }
          if (prop === 'findMany') return memoryStore.feedbacks;
          if (prop === 'count') return memoryStore.feedbacks.length;
        }

        if (modelName === 'paymentRecord') {
          if (prop === 'create') {
            const data = args[0]?.data || {};
            const newPayment = {
              id: `pay-${Date.now()}`,
              userId: data.userId,
              feeId: data.feeId || null,
              amount: data.amount || 0,
              status: data.status || 'PENDING',
              receiptUrl: data.receiptUrl || null,
              itemsDetail: data.itemsDetail || 'Pedido de Ropa',
              deliveryStatus: data.deliveryStatus || 'PENDIENTE',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            memoryStore.payments.unshift(newPayment);
            return newPayment;
          }
          if (prop === 'update') {
            const { where = {}, data = {} } = args[0] || {};
            const idx = memoryStore.payments.findIndex(p => p.id === where.id);
            if (idx !== -1) {
              memoryStore.payments[idx] = { ...memoryStore.payments[idx], ...data, updatedAt: new Date() };
              return memoryStore.payments[idx];
            }
          }
          if (prop === 'findMany') {
            const where = args[0]?.where;
            if (where?.userId) {
              return memoryStore.payments.filter(p => p.userId === where.userId);
            }
            return memoryStore.payments;
          }
          if (prop === 'count') return memoryStore.payments.length;
        }

        if (modelName === 'attendance') {
          if (prop === 'create' || prop === 'upsert') {
            const data = args[0]?.create || args[0]?.data || {};
            const newAtt = {
              id: `att-${Date.now()}`,
              userId: data.userId,
              eventId: data.eventId,
              status: data.status || 'PRESENT',
              timestamp: new Date()
            };
            memoryStore.attendances.unshift(newAtt);
            return newAtt;
          }
          if (prop === 'findMany') {
            const where = args[0]?.where;
            if (where?.userId) {
              return memoryStore.attendances.filter(a => a.userId === where.userId);
            }
            return memoryStore.attendances;
          }
          if (prop === 'count') return memoryStore.attendances.length;
        }

        if (modelName === 'paymentFee') {
          if (prop === 'findMany') return memoryStore.fees;
          if (prop === 'findFirst' || prop === 'findUnique') return memoryStore.fees[0] || null;
          if (prop === 'count') return memoryStore.fees.length;
        }

        if (modelName === 'event') {
          if (prop === 'findFirst' || prop === 'findUnique') return memoryStore.events[0] || null;
          if (prop === 'findMany') return memoryStore.events;
          if (prop === 'count') return memoryStore.events.length;
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
  return memoryStore.users.find(u => u.id === userId || u.dni === userId) || memoryStore.users[0];
}

export default prisma;
