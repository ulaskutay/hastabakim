import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    const hizmetler = await prisma.hizmet.findMany({
      select: {
        id: true,
        baslik: true,
        aciklama: true,
        ikon: true,
        sira: true,
        durum: true,
        createdAt: true,
        updatedAt: true,
      },
      where: all ? undefined : {
        durum: 'aktif',
      },
      orderBy: { sira: 'asc' },
    })
    
    const queryTime = Date.now() - startTime
    console.log(`Hizmetler sorgusu ${queryTime}ms sürdü, ${hizmetler.length} hizmet bulundu`)
    
    return NextResponse.json(hizmetler)
  } catch (error: any) {
    console.error('Hizmetler yüklenirken hata:', error)
    
    // Eğer tablo yoksa (migration çalıştırılmamışsa) boş array döndür
    if (error.code === 'P2021' || error.code === 'P2025' || error.message?.includes('does not exist')) {
      console.log('Hizmetler tablosu henüz oluşturulmamış, boş array döndürülüyor')
      return NextResponse.json([])
    }
    
    let errorMessage = 'Hizmetler yüklenirken hata oluştu: ' + error.message
    
    if (error.code === 'P1001') {
      errorMessage = 'Veritabanı sunucusuna ulaşılamıyor. Lütfen bağlantı ayarlarını kontrol edin.'
    } else if (error.code === 'P1000') {
      errorMessage = 'Veritabanı kimlik doğrulama hatası. DATABASE_URL kontrol edin.'
    } else if (!process.env.DATABASE_URL) {
      errorMessage = 'DATABASE_URL environment variable tanımlı değil.'
    }
    
    // Hata durumunda da boş array döndür ki sayfa çökmesin
    console.warn('Hizmetler yüklenirken hata oluştu, boş array döndürülüyor:', errorMessage)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baslik, aciklama, ikon, sira } = body

    if (!baslik) {
      return NextResponse.json(
        { error: 'Hizmet başlığı zorunludur.' },
        { status: 400 }
      )
    }

    if (!aciklama) {
      return NextResponse.json(
        { error: 'Hizmet açıklaması zorunludur.' },
        { status: 400 }
      )
    }

    // En yüksek sıra numarasını bul
    const maxSira = await prisma.hizmet.findFirst({
      orderBy: { sira: 'desc' },
      select: { sira: true },
    })

    const hizmet = await prisma.hizmet.create({
      data: {
        baslik,
        aciklama,
        ikon: ikon || 'FiUser',
        sira: sira !== undefined ? sira : (maxSira?.sira ?? 0) + 1,
      },
    })

    return NextResponse.json(hizmet, { status: 201 })
  } catch (error: any) {
    console.error('Hizmet eklenirken hata:', error)
    return NextResponse.json(
      { error: 'Hizmet eklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

