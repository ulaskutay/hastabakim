import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const personel = await prisma.personel.findUnique({
      where: { id },
    })

    if (!personel) {
      return NextResponse.json(
        { error: 'Personel bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json(personel)
  } catch (error: any) {
    console.error('Personel yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Personel yüklenirken hata oluştu: ' + error.message },
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
    const { ad, soyad, telefon, email, pozisyon, sertifika, durum } = body

    const personel = await prisma.personel.update({
      where: { id },
      data: {
        ...(ad && { ad }),
        ...(soyad && { soyad }),
        ...(telefon && { telefon }),
        ...(email !== undefined && { email: email || null }),
        ...(pozisyon && { pozisyon }),
        ...(sertifika !== undefined && { sertifika: sertifika || null }),
        ...(durum && { durum }),
      },
    })

    return NextResponse.json(personel)
  } catch (error: any) {
    console.error('Personel güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Personel güncellenirken hata oluştu: ' + error.message },
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
    await prisma.personel.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Personel silindi.' })
  } catch (error: any) {
    console.error('Personel silinirken hata:', error)
    return NextResponse.json(
      { error: 'Personel silinirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

