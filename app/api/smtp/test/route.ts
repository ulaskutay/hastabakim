import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, secure, user, pass, testEmail } = body

    // Validasyon
    if (!host || !port || !user || !pass || !testEmail) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      )
    }

    // SMTP ayarları
    const smtpConfig = {
      host,
      port: parseInt(port),
      secure: secure === true || secure === 'true',
      auth: {
        user,
        pass,
      },
    }

    // Nodemailer transporter oluştur
    const transporter = nodemailer.createTransport(smtpConfig)

    // Bağlantıyı test et
    await transporter.verify()

    // Test e-postası gönder
    const mailOptions = {
      from: `"${user}" <${user}>`,
      to: testEmail,
      subject: 'SMTP Test E-postası',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Bağlantı Testi Başarılı!</h2>
          <p>Bu bir test e-postasıdır. SMTP ayarlarınız doğru çalışıyor.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Gönderim zamanı: ${new Date().toLocaleString('tr-TR')}
          </p>
        </div>
      `,
      text: 'SMTP Bağlantı Testi Başarılı! Bu bir test e-postasıdır. SMTP ayarlarınız doğru çalışıyor.',
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'SMTP bağlantısı başarılı ve test e-postası gönderildi!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('SMTP test hatası:', error)
    return NextResponse.json(
      { error: 'SMTP bağlantısı başarısız: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    )
  }
}

