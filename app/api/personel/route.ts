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
            { pozisyon: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const personel = await prisma.personel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const queryTime = Date.now() - startTime
    console.log(`Personel sorgusu ${queryTime}ms sürdü, ${personel.length} personel bulundu`)

    return NextResponse.json(personel)
  } catch (error: any) {
    console.error('Personel yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Personel yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ad, soyad, telefon, email, pozisyon, sertifika, durum } = body

    if (!ad || !soyad || !telefon || !pozisyon) {
      return NextResponse.json(
        { error: 'Ad, soyad, telefon ve pozisyon zorunludur.' },
        { status: 400 }
      )
    }

    const personel = await prisma.personel.create({
      data: {
        ad,
        soyad,
        telefon,
        email: email || null,
        pozisyon,
        sertifika: sertifika || null,
        durum: durum || 'aktif',
      },
    })

    return NextResponse.json(personel, { status: 201 })
  } catch (error: any) {
    console.error('Personel eklenirken hata:', error)
    return NextResponse.json(
      { error: 'Personel eklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

