import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Build sırasında DATABASE_URL olmayabilir, bu durumda hata verme
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === 'phase-production-build') {
    // Build sırasında dummy client döndür (asla kullanılmayacak)
    return {} as PrismaClient
  }

  const client = new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

export const prisma = getPrismaClient()

