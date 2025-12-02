import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // DATABASE_URL kontrolü
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const databaseUrlPreview = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
      : 'YOK'

    // Prisma bağlantı testi
    let dbConnection = false
    let dbError = null
    
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      dbConnection = true
      await prisma.$disconnect()
    } catch (error: any) {
      dbError = error.message
      dbConnection = false
    }

    return NextResponse.json({
      status: 'ok',
      database: {
        urlConfigured: hasDatabaseUrl,
        urlPreview: databaseUrlPreview,
        connected: dbConnection,
        error: dbError,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

