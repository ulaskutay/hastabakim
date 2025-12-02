import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    throw new Error('DATABASE_URL environment variable is not set')
  }

  console.log('Creating Prisma Client...')
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma: PrismaClient = 
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // Production'da da singleton kullan
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}

