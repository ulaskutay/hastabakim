import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    const where = search
      ? {
          OR: [
            { ad: { contains: search, mode: 'insensitive' as const } },
            { soyad: { contains: search, mode: 'insensitive' as const } },
            { telefon: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const hastalar = await prisma.hasta.findMany({
      where,
      include: {
        kategori: {
          select: {
            id: true,
            ad: true,
            renk: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const queryTime = Date.now() - startTime
    console.log(`Hastalar sorgusu ${queryTime}ms sürdü, ${hastalar.length} hasta bulundu`)

    return NextResponse.json(hastalar)
  } catch (error: any) {
    console.error('Hastalar yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Hastalar yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ad, soyad, telefon, email, yas, adres, kategoriId, durum } = body

    if (!ad || !soyad || !telefon || !kategoriId) {
      return NextResponse.json(
        { error: 'Ad, soyad, telefon ve kategori zorunludur.' },
        { status: 400 }
      )
    }

    const hasta = await prisma.hasta.create({
      data: {
        ad,
        soyad,
        telefon,
        email: email || null,
        yas: parseInt(yas),
        adres: adres || null,
        kategoriId,
        durum: durum || 'aktif',
      },
      include: {
        kategori: true,
      },
    })

    return NextResponse.json(hasta, { status: 201 })
  } catch (error: any) {
    console.error('Hasta eklenirken hata:', error)
    return NextResponse.json(
      { error: 'Hasta eklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

