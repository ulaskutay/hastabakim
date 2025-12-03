import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Sadece gerekli alanları seç - daha hızlı
    const kategoriler = await prisma.kategori.findMany({
      select: {
        id: true,
        ad: true,
        aciklama: true,
        renk: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    const queryTime = Date.now() - startTime
    console.log(`Kategoriler sorgusu ${queryTime}ms sürdü, ${kategoriler.length} kategori bulundu`)
    
    return NextResponse.json(kategoriler, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('Kategoriler yüklenirken hata:', error)
    
    // Daha detaylı hata mesajı
    let errorMessage = 'Kategoriler yüklenirken hata oluştu: ' + error.message
    
    if (error.code === 'P1001') {
      errorMessage = 'Veritabanı sunucusuna ulaşılamıyor. Lütfen bağlantı ayarlarını kontrol edin.'
    } else if (error.code === 'P1000') {
      errorMessage = 'Veritabanı kimlik doğrulama hatası. DATABASE_URL kontrol edin.'
    } else if (!process.env.DATABASE_URL) {
      errorMessage = 'DATABASE_URL environment variable tanımlı değil.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || null,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ad, aciklama, renk } = body

    if (!ad) {
      return NextResponse.json(
        { error: 'Kategori adı zorunludur.' },
        { status: 400 }
      )
    }

    const kategori = await prisma.kategori.create({
      data: {
        ad,
        aciklama: aciklama || null,
        renk: renk || '#3B82F6',
      },
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error: any) {
    console.error('Kategori eklenirken hata:', error)
    return NextResponse.json(
      { error: 'Kategori eklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

