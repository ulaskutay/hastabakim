import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const kategoriler = await prisma.kategori.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(kategoriler)
  } catch (error: any) {
    console.error('Kategoriler yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Kategoriler yüklenirken hata oluştu: ' + error.message },
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

