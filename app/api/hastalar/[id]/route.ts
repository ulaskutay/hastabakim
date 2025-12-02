import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hasta = await prisma.hasta.findUnique({
      where: { id: params.id },
      include: {
        kategori: true,
      },
    })

    if (!hasta) {
      return NextResponse.json(
        { error: 'Hasta bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json(hasta)
  } catch (error: any) {
    console.error('Hasta yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Hasta yüklenirken hata oluştu: ' + error.message },
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
    const { ad, soyad, telefon, email, yas, adres, kategoriId, durum } = body

    const hasta = await prisma.hasta.update({
      where: { id: params.id },
      data: {
        ...(ad && { ad }),
        ...(soyad && { soyad }),
        ...(telefon && { telefon }),
        ...(email !== undefined && { email: email || null }),
        ...(yas && { yas: parseInt(yas) }),
        ...(adres !== undefined && { adres: adres || null }),
        ...(kategoriId && { kategoriId }),
        ...(durum && { durum }),
      },
      include: {
        kategori: true,
      },
    })

    return NextResponse.json(hasta)
  } catch (error: any) {
    console.error('Hasta güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Hasta güncellenirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.hasta.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Hasta silindi.' })
  } catch (error: any) {
    console.error('Hasta silinirken hata:', error)
    return NextResponse.json(
      { error: 'Hasta silinirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

