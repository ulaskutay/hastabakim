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
  // Supabase Connection Pooling için optimize edilmiş ayarlar
  if (!databaseUrl.includes('connection_limit')) {
    const separator = databaseUrl.includes('?') ? '&' : '?'
    // Connection pool ayarları - Vercel/serverless için optimize
    databaseUrl = `${databaseUrl}${separator}connection_limit=5&pool_timeout=5&connect_timeout=5`
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma: PrismaClient = 
  globalForPrisma.prisma ?? createPrismaClient()

// Her zaman singleton kullan (production ve development)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

