import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const randevu = await prisma.randevu.findUnique({
      where: { id: params.id },
      include: {
        hasta: {
          include: {
            kategori: true,
          },
        },
        personel: true,
      },
    })

    if (!randevu) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı.' },
        { status: 404 }
      )
    }

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

    return NextResponse.json(formattedRandevu)
  } catch (error: any) {
    console.error('Randevu yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { hastaId, personelId, tarih, saat, durum, notlar } = body

    const updateData: any = {}

    if (hastaId) updateData.hastaId = hastaId
    if (personelId) updateData.personelId = personelId
    if (tarih) {
      const tarihObj = new Date(tarih)
      if (!isNaN(tarihObj.getTime())) {
        updateData.tarih = tarihObj
      }
    }
    if (saat) updateData.saat = saat
    if (durum) updateData.durum = durum
    if (notlar !== undefined) updateData.notlar = notlar || null

    const randevu = await prisma.randevu.update({
      where: { id: params.id },
      data: updateData,
      include: {
        hasta: {
          include: {
            kategori: true,
          },
        },
        personel: true,
      },
    })

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

    return NextResponse.json(formattedRandevu)
  } catch (error: any) {
    console.error('Randevu güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu güncellenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.randevu.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Randevu silindi.' })
  } catch (error: any) {
    console.error('Randevu silinirken hata:', error)
    return NextResponse.json(
      { error: 'Randevu silinirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

