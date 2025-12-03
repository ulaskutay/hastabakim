import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const hizmet = await prisma.hizmet.findUnique({
      where: { id },
    })

    if (!hizmet) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json(hizmet)
  } catch (error: any) {
    console.error('Hizmet yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Hizmet yüklenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { baslik, aciklama, ikon, sira, durum } = body

    const hizmet = await prisma.hizmet.update({
      where: { id },
      data: {
        ...(baslik && { baslik }),
        ...(aciklama !== undefined && { aciklama }),
        ...(ikon && { ikon }),
        ...(sira !== undefined && { sira }),
        ...(durum !== undefined && { durum }),
      },
    })

    return NextResponse.json(hizmet)
  } catch (error: any) {
    console.error('Hizmet güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Hizmet güncellenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    await prisma.hizmet.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Hizmet silindi.' })
  } catch (error: any) {
    console.error('Hizmet silinirken hata:', error)
    return NextResponse.json(
      { error: 'Hizmet silinirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

