import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Build sırasında DATABASE_URL olmayabilir, bu durumda dummy client oluştur
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    // Bu durumda build sırasında hata vermesin
    return {} as PrismaClient
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

