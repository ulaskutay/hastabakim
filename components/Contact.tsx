'use client'

import { useState, useEffect, FormEvent } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [ayarlar, setAyarlar] = useState({
    telefon: '+90 (555) 123 45 67',
    whatsapp: '',
    email: 'info@hastabakim.com',
    email2: 'destek@hastabakim.com',
    adres: 'Örnek Mahallesi, Bakım Sokak No:123\nŞişli, İstanbul, Türkiye',
    primaryColor: '#0ea5e9',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 14, g: 165, b: 233 }
  }

  useEffect(() => {
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setAyarlar(parsed)
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // SMTP ayarlarını localStorage'dan al
      let smtpConfig = null
      const storedSmtp = localStorage.getItem('smtpConfig')
      if (storedSmtp) {
        smtpConfig = JSON.parse(storedSmtp)
      }

      // Mail gönderme API'sine istek gönder
      const response = await fetch('/api/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          smtpConfig,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
        })
    setFormData({ name: '', email: '', phone: '', message: '' })
        
        // 5 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' })
        }, 5000)
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        })
      }
    } catch (error: any) {
      console.error('Form gönderme hatası:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="iletisim" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h2>
          <p className="text-xl text-gray-600">
            Sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">İletişim Bilgileri</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ayarlar.primaryColor + '20' }}
                >
                  <FiPhone style={{ color: ayarlar.primaryColor }} className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Telefon</h4>
                  <a
                    href={`tel:${ayarlar.telefon.replace(/[^0-9+]/g, '')}`}
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    {ayarlar.telefon}
                  </a>
                </div>
              </div>

              {ayarlar.whatsapp && (
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#25D36620' }}
                  >
                    <FaWhatsapp style={{ color: '#25D366' }} className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                    <a
                      href={`https://wa.me/${ayarlar.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#25D366] transition"
                    >
                      {ayarlar.whatsapp}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ayarlar.primaryColor + '20' }}
                >
                  <FiMail style={{ color: ayarlar.primaryColor }} className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">E-posta</h4>
                  <a
                    href={`mailto:${ayarlar.email}`}
                    className="text-gray-600 hover:text-gray-900 transition block"
                  >
                    {ayarlar.email}
                  </a>
                  {ayarlar.email2 && (
                    <a
                      href={`mailto:${ayarlar.email2}`}
                      className="text-gray-600 hover:text-gray-900 transition block"
                    >
                      {ayarlar.email2}
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ayarlar.primaryColor + '20' }}
                >
                  <FiMapPin style={{ color: ayarlar.primaryColor }} className="text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Adres</h4>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ayarlar.adres)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition block"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {ayarlar.adres}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Bize Ulaşın</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: ayarlar.primaryColor }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                  const rgb = hexToRgb(ayarlar.primaryColor)
                  e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                  e.currentTarget.style.backgroundColor = ayarlar.primaryColor
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span>Gönderiliyor...</span>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                <span>Gönder</span>
                <FiSend />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

