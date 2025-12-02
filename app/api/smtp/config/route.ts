import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const configPath = path.join(process.cwd(), '.env.local')

export async function GET() {
  try {
    // Environment variables'dan SMTP ayarlarını oku
    const config = {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: '', // Güvenlik nedeniyle şifre gönderilmez
      recipientEmail: process.env.RECIPIENT_EMAIL || '',
    }

    return NextResponse.json(config, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Ayarlar okunurken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, secure, user, pass, recipientEmail } = body

    // Validasyon
    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { error: 'Host, Port, Kullanıcı Adı ve Şifre alanları zorunludur.' },
        { status: 400 }
      )
    }

    // .env.local dosyasını oku veya oluştur
    let envContent = ''
    if (fs.existsSync(configPath)) {
      envContent = fs.readFileSync(configPath, 'utf8')
    }

    // SMTP ayarlarını güncelle
    const updates: { [key: string]: string } = {
      SMTP_HOST: host,
      SMTP_PORT: port.toString(),
      SMTP_SECURE: secure === true || secure === 'true' ? 'true' : 'false',
      SMTP_USER: user,
      SMTP_PASS: pass,
    }

    if (recipientEmail) {
      updates.RECIPIENT_EMAIL = recipientEmail
    }

    // Mevcut satırları parse et ve güncelle
    const lines = envContent.split('\n')
    const newLines: string[] = []
    const updatedKeys = new Set<string>()

    // Mevcut satırları işle
    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        newLines.push(line)
        return
      }

      const [key] = trimmedLine.split('=')
      if (key && updates[key.trim()]) {
        newLines.push(`${key.trim()}=${updates[key.trim()]}`)
        updatedKeys.add(key.trim())
      } else {
        newLines.push(line)
      }
    })

    // Yeni değişkenleri ekle
    Object.keys(updates).forEach((key) => {
      if (!updatedKeys.has(key)) {
        newLines.push(`${key}=${updates[key]}`)
      }
    })

    // Dosyayı yaz
    fs.writeFileSync(configPath, newLines.join('\n'), 'utf8')

    return NextResponse.json(
      { message: 'SMTP ayarları başarıyla kaydedildi.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('SMTP ayarları kaydetme hatası:', error)
    return NextResponse.json(
      { error: 'Ayarlar kaydedilirken hata oluştu: ' + error.message },
      { status: 500 }
    )
  }
}

