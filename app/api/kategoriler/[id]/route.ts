import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await prisma.kategori.findUnique({
      where: { id: params.id },
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json(kategori)
  } catch (error: any) {
    console.error('Kategori yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Kategori yüklenirken hata oluştu: ' + error.message },
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
    const { ad, aciklama, renk } = body

    const kategori = await prisma.kategori.update({
      where: { id: params.id },
      data: {
        ...(ad && { ad }),
        ...(aciklama !== undefined && { aciklama }),
        ...(renk && { renk }),
      },
    })

    return NextResponse.json(kategori)
  } catch (error: any) {
    console.error('Kategori güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Kategori güncellenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kategori.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Kategori silindi.' })
  } catch (error: any) {
    console.error('Kategori silinirken hata:', error)
    return NextResponse.json(
      { error: 'Kategori silinirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

