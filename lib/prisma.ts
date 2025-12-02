import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Connection string zaten optimize edilmiş (Connection Pooling URL)
  // Supabase Connection Pooling otomatik olarak connection pool yönetir
  // Ekstra parametre eklemeye gerek yok, Supabase'in kendi pooler'ı var

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

