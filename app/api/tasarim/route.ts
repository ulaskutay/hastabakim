import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TASARIM_DEFAULTLARI, TasarimAyarlari } from '@/lib/tasarim-defaults'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const TASARIM_ID = 'default'

const sanitizePayload = (body: Partial<TasarimAyarlari>): TasarimAyarlari => {
  return {
    ...TASARIM_DEFAULTLARI,
    ...body,
  }
}

async function ensureTasarimKaydi(): Promise<TasarimAyarlari> {
  const existing = await prisma.tasarimAyari.findUnique({
    where: { id: TASARIM_ID },
  })

  if (existing) {
    return existing.data as TasarimAyarlari
  }

  const created = await prisma.tasarimAyari.create({
    data: {
      id: TASARIM_ID,
      data: TASARIM_DEFAULTLARI,
    },
  })

  return created.data as TasarimAyarlari
}

export async function GET() {
  try {
    const ayarlar = await ensureTasarimKaydi()
    return NextResponse.json(ayarlar)
  } catch (error: any) {
    console.error('Tasarım ayarları alınırken hata:', error)
    return NextResponse.json(
      { error: 'Tasarım ayarları yüklenemedi.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TasarimAyarlari>
    const merged = sanitizePayload(body)

    const updated = await prisma.tasarimAyari.upsert({
      where: { id: TASARIM_ID },
      update: { data: merged },
      create: { id: TASARIM_ID, data: merged },
    })

    return NextResponse.json(updated.data)
  } catch (error: any) {
    console.error('Tasarım ayarları güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Tasarım ayarları kaydedilemedi.' },
      { status: 500 }
    )
  }
}

