import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const searchParams = request.nextUrl.searchParams
    const hastaId = searchParams.get('hastaId')
    const personelId = searchParams.get('personelId')
    const tarih = searchParams.get('tarih')

    const where: any = {}

    if (hastaId) {
      where.hastaId = hastaId
    }

    if (personelId) {
      where.personelId = personelId
    }

    if (tarih) {
      const tarihBaslangic = new Date(tarih)
      tarihBaslangic.setHours(0, 0, 0, 0)
      const tarihBitis = new Date(tarih)
      tarihBitis.setHours(23, 59, 59, 999)

      where.tarih = {
        gte: tarihBaslangic,
        lte: tarihBitis,
      }
    }

    const randevular = await prisma.randevu.findMany({
      where,
      include: {
        hasta: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            kategori: {
              select: {
                id: true,
                ad: true,
                renk: true,
              },
            },
          },
        },
        personel: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
      orderBy: [
        { tarih: 'asc' },
        { saat: 'asc' },
      ],
    })

    const queryTime = Date.now() - startTime
    console.log(`Randevular sorgusu ${queryTime}ms sürdü, ${randevular.length} randevu bulundu`)

    // Frontend'deki format'a uygun hale getir
    const formattedRandevular = randevular.map((r: {
      id: string
      hastaId: string
      hasta: { ad: string; soyad: string }
      personelId: string
      personel: { ad: string; soyad: string }
      tarih: Date
      saat: string
      durum: string
      notlar: string | null
      createdAt: Date
      updatedAt: Date
    }) => ({
      id: r.id,
      hastaId: r.hastaId,
      hastaAd: `${r.hasta.ad} ${r.hasta.soyad}`,
      personelId: r.personelId,
      personelAd: `${r.personel.ad} ${r.personel.soyad}`,
      tarih: r.tarih.toISOString().split('T')[0],
      saat: r.saat,
      durum: r.durum,
      notlar: r.notlar,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    return NextResponse.json(formattedRandevular, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('Randevular yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Randevular yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hastaId, personelId, tarih, saat, durum, notlar } = body

    if (!hastaId || !personelId || !tarih || !saat) {
      return NextResponse.json(
        { error: 'Hasta, personel, tarih ve saat zorunludur.' },
        { status: 400 }
      )
    }

    // Tarih formatını düzelt
    const tarihObj = new Date(tarih)
    if (isNaN(tarihObj.getTime())) {
      return NextResponse.json(
        { error: 'Geçersiz tarih formatı.' },
        { status: 400 }
      )
    }

    const randevu = await prisma.randevu.create({
      data: {
        hastaId,
        personelId,
        tarih: tarihObj,
        saat,
        durum: durum || 'planlandi',
        notlar: notlar || null,
      },
      include: {
        hasta: {
          include: {
            kategori: true,
          },
        },
        personel: true,
      },
    })

    // Frontend formatına çevir
    const formattedRandevu = {
      id: randevu.id,
      hastaId: randevu.hastaId,
      hastaAd: `${randevu.hasta.ad} ${randevu.hasta.soyad}`,
      personelId: randevu.personelId,
      personelAd: `${randevu.personel.ad} ${randevu.personel.soyad}`,
      tarih: randevu.tarih.toISOString().split('T')[0],
      saat: randevu.saat,
      durum: randevu.durum,
      notlar: randevu.notlar,
      createdAt: randevu.createdAt,
      updatedAt: randevu.updatedAt,
    }

    return NextResponse.json(formattedRandevu, { status: 201 })
  } catch (error: any) {
    console.error('Randevu eklenirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu eklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

