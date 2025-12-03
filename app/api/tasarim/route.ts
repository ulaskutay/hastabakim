import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TASARIM_DEFAULTLARI, TasarimAyarlari } from '@/lib/tasarim-defaults'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const TASARIM_ID = 'default'

const sanitizePayload = (body: Partial<TasarimAyarlari>): TasarimAyarlari => ({
  ...TASARIM_DEFAULTLARI,
  ...body,
})

const parseTasarimData = (data: unknown): TasarimAyarlari => {
  if (data && typeof data === 'object') {
    return sanitizePayload(data as Partial<TasarimAyarlari>)
  }
  return { ...TASARIM_DEFAULTLARI }
}

const toJsonObject = (value: TasarimAyarlari): Prisma.JsonObject =>
  value as unknown as Prisma.JsonObject

async function ensureTasarimKaydi(): Promise<TasarimAyarlari> {
  const existing = await prisma.tasarimAyari.findUnique({
    where: { id: TASARIM_ID },
  })

  if (existing) {
    return parseTasarimData(existing.data)
  }

  const created = await prisma.tasarimAyari.create({
    data: {
      id: TASARIM_ID,
      data: toJsonObject(TASARIM_DEFAULTLARI),
    },
  })

  return parseTasarimData(created.data)
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
      update: { data: toJsonObject(merged) },
      create: { id: TASARIM_ID, data: toJsonObject(merged) },
    })

    return NextResponse.json(parseTasarimData(updated.data))
  } catch (error: any) {
    console.error('Tasarım ayarları güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Tasarım ayarları kaydedilemedi.' },
      { status: 500 }
    )
  }
}

