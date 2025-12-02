import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, smtpConfig: bodySmtpConfig } = body

    // Validasyon
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Ad, e-posta ve mesaj alanları zorunludur.' },
        { status: 400 }
      )
    }

    // SMTP ayarlarını önce body'den, yoksa environment variables'dan al
    let smtpConfig: any = {
      host: bodySmtpConfig?.host || process.env.SMTP_HOST || '',
      port: bodySmtpConfig?.port 
        ? parseInt(bodySmtpConfig.port) 
        : parseInt(process.env.SMTP_PORT || '587'),
      secure: bodySmtpConfig?.secure !== undefined
        ? bodySmtpConfig.secure === true || bodySmtpConfig.secure === 'true'
        : process.env.SMTP_SECURE === 'true',
      auth: {
        user: bodySmtpConfig?.user || process.env.SMTP_USER || '',
        pass: bodySmtpConfig?.pass || process.env.SMTP_PASS || '',
      },
    }

    // Eğer SMTP bilgileri yoksa hata döndür
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return NextResponse.json(
        { error: 'SMTP ayarları yapılandırılmamış. Lütfen admin panelinden SMTP ayarlarını yapın.' },
        { status: 500 }
      )
    }

    // Nodemailer transporter oluştur
    const transporter = nodemailer.createTransport(smtpConfig)

    // Alıcı e-posta (body'den, tasarım ayarlarından veya env'den)
    const recipientEmail = bodySmtpConfig?.recipientEmail || process.env.RECIPIENT_EMAIL || 'info@hastabakim.com'

    // E-posta içeriği
    const mailOptions = {
      from: `"${smtpConfig.auth.user}" <${smtpConfig.auth.user}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `Yeni İletişim Formu Mesajı - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yeni İletişim Formu Mesajı</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ad Soyad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
            <p><strong>Mesaj:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">Bu mesaj web sitenizin iletişim formundan gönderilmiştir.</p>
        </div>
      `,
      text: `
Yeni İletişim Formu Mesajı

Ad Soyad: ${name}
E-posta: ${email}
${phone ? `Telefon: ${phone}` : ''}

Mesaj:
${message}

---
Bu mesaj web sitenizin iletişim formundan gönderilmiştir.
      `,
    }

    // E-postayı gönder
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'E-posta başarıyla gönderildi.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Mail gönderme hatası:', error)
    return NextResponse.json(
      { error: 'E-posta gönderilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    )
  }
}

