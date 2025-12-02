import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Connection string'i optimize et
  let databaseUrl = process.env.DATABASE_URL
  
  // Connection pool parametrelerini ekle (eğer yoksa)
  if (!databaseUrl.includes('?') && !databaseUrl.includes('connection_limit')) {
    // Eğer pooling URL ise pgbouncer parametresini koru, değilse ekle
    const separator = databaseUrl.includes('pgbouncer=true') ? '&' : '?'
    databaseUrl = `${databaseUrl}${separator}connection_limit=10&pool_timeout=10`
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

export const prisma: PrismaClient = 
  globalForPrisma.prisma ?? createPrismaClient()

// Her zaman singleton kullan (production ve development)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

