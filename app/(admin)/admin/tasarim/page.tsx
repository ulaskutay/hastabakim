'use client'

import { useEffect, useState } from 'react'
import { FiSave, FiRefreshCw, FiEye } from 'react-icons/fi'

interface TasarimAyarlari {
  siteBaslik: string
  siteAciklama: string
  primaryColor: string
  heroBaslik: string
  heroAltBaslik: string
  heroButon1: string
  heroButon2: string
  telefon: string
  whatsapp: string
  email: string
  email2: string
  adres: string
  footerMetin: string
  logo: string
  favicon: string
}

export default function TasarimPage() {
  const [ayarlar, setAyarlar] = useState<TasarimAyarlari>({
    siteBaslik: 'Hasta Bakım',
    siteAciklama: 'Profesyonel hasta bakım ve yaşlı bakım hizmetleri',
    primaryColor: '#0ea5e9',
    heroBaslik: 'Profesyonel Hasta & Yaşlı Bakım Hizmetleri',
    heroAltBaslik: 'Sevdikleriniz için en iyi bakım hizmetini sunuyoruz. Deneyimli ve güvenilir ekibimizle yanınızdayız.',
    heroButon1: 'İletişime Geç',
    heroButon2: 'Hizmetlerimiz',
    telefon: '+90 (555) 123 45 67',
    whatsapp: '',
    email: 'info@hastabakim.com',
    email2: 'destek@hastabakim.com',
    adres: 'Örnek Mahallesi, Bakım Sokak No:123\nŞişli, İstanbul, Türkiye',
    footerMetin: 'Profesyonel hasta bakım ve yaşlı bakım hizmetleri ile yanınızdayız.',
    logo: '',
    favicon: '',
  })

  const [previewColor, setPreviewColor] = useState('#0ea5e9')

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
    // localStorage'dan ayarları yükle
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setAyarlar(parsed)
      setPreviewColor(parsed.primaryColor)
    }
  }, [])

  const handleChange = (key: keyof TasarimAyarlari, value: string) => {
    setAyarlar((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'primaryColor') {
        setPreviewColor(value)
      }
      return updated
    })
  }

  const handleSave = () => {
    localStorage.setItem('tasarimAyarlari', JSON.stringify(ayarlar))
    // CSS değişkenlerini güncelle
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-color', ayarlar.primaryColor)
      
      // Favicon'u güncelle
      if (ayarlar.favicon) {
        const existingLinks = document.querySelectorAll("link[rel*='icon']")
        existingLinks.forEach((link) => link.remove())
        
        const link = document.createElement('link')
        link.rel = 'icon'
        link.type = ayarlar.favicon.startsWith('data:image/svg') 
          ? 'image/svg+xml' 
          : ayarlar.favicon.startsWith('data:image/png')
          ? 'image/png'
          : ayarlar.favicon.startsWith('data:image/jpeg') || ayarlar.favicon.startsWith('data:image/jpg')
          ? 'image/jpeg'
          : ayarlar.favicon.startsWith('data:image/x-icon') || ayarlar.favicon.startsWith('data:image/vnd.microsoft.icon')
          ? 'image/x-icon'
          : 'image/png'
        link.href = ayarlar.favicon
        document.head.appendChild(link)
      }
    }
    alert('Tasarım ayarları kaydedildi! Logo ve favicon değişikliklerini görmek için ana sayfayı yenileyin.')
  }

  const handleReset = () => {
    if (confirm('Tüm tasarım ayarlarını varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      const defaultAyarlar: TasarimAyarlari = {
        siteBaslik: 'Hasta Bakım',
        siteAciklama: 'Profesyonel hasta bakım ve yaşlı bakım hizmetleri',
        primaryColor: '#0ea5e9',
        heroBaslik: 'Profesyonel Hasta & Yaşlı Bakım Hizmetleri',
        heroAltBaslik: 'Sevdikleriniz için en iyi bakım hizmetini sunuyoruz. Deneyimli ve güvenilir ekibimizle yanınızdayız.',
        heroButon1: 'İletişime Geç',
        heroButon2: 'Hizmetlerimiz',
        telefon: '+90 (555) 123 45 67',
        whatsapp: '',
        email: 'info@hastabakim.com',
        email2: 'destek@hastabakim.com',
        adres: 'Örnek Mahallesi, Bakım Sokak No:123\nŞişli, İstanbul, Türkiye',
        footerMetin: 'Profesyonel hasta bakım ve yaşlı bakım hizmetleri ile yanınızdayız.',
        logo: '',
        favicon: '',
      }
      setAyarlar(defaultAyarlar)
      setPreviewColor(defaultAyarlar.primaryColor)
      localStorage.setItem('tasarimAyarlari', JSON.stringify(defaultAyarlar))
    }
  }

  const handleImageUpload = (key: 'logo' | 'favicon', file: File | null) => {
    if (!file) return

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan küçük olmalıdır.')
      return
    }

    // Dosya tipi kontrolü
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!validImageTypes.includes(file.type)) {
      alert('Geçerli bir görsel dosyası seçin (PNG, JPG, GIF, SVG, ICO)')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setAyarlar((prev) => ({ ...prev, [key]: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (key: 'logo' | 'favicon') => {
    setAyarlar((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasarım Ayarları</h1>
        <div className="flex space-x-4">
          <a
            href="/"
            target="_blank"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
          >
            <FiEye />
            <span>Önizleme</span>
          </a>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
          >
            <FiRefreshCw />
            <span>Sıfırla</span>
          </button>
          <button
            onClick={handleSave}
            className="text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
            style={{ backgroundColor: previewColor }}
            onMouseEnter={(e) => {
              const rgb = hexToRgb(previewColor)
              e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = previewColor
            }}
          >
            <FiSave />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Genel Ayarlar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Genel Ayarlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Yükleme */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                    onChange={(e) => handleImageUpload('logo', e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = previewColor
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF veya SVG formatında, maksimum 2MB
                  </p>
                </div>
                {ayarlar.logo && (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={ayarlar.logo} alt="Logo önizleme" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('logo')}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Favicon Yükleme */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                    onChange={(e) => handleImageUpload('favicon', e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = previewColor
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, SVG veya ICO formatında, maksimum 2MB (32x32 veya 16x16 önerilir)
                  </p>
                </div>
                {ayarlar.favicon && (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-16 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={ayarlar.favicon} alt="Favicon önizleme" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('favicon')}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Başlığı
              </label>
              <input
                type="text"
                value={ayarlar.siteBaslik}
                onChange={(e) => handleChange('siteBaslik', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Açıklaması
              </label>
              <input
                type="text"
                value={ayarlar.siteAciklama}
                onChange={(e) => handleChange('siteAciklama', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Renk (Primary Color)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={ayarlar.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={ayarlar.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#0ea5e9"
                />
                <div
                  className="w-12 h-12 rounded-lg border border-gray-300"
                  style={{ backgroundColor: previewColor }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Bu renk butonlar, linkler ve vurgu alanlarında kullanılacaktır.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Bölümü */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hero Bölümü</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Başlık
              </label>
              <input
                type="text"
                value={ayarlar.heroBaslik}
                onChange={(e) => handleChange('heroBaslik', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Başlık / Açıklama
              </label>
              <textarea
                value={ayarlar.heroAltBaslik}
                onChange={(e) => handleChange('heroAltBaslik', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birinci Buton Metni
                </label>
                <input
                  type="text"
                  value={ayarlar.heroButon1}
                  onChange={(e) => handleChange('heroButon1', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkinci Buton Metni
                </label>
                <input
                  type="text"
                  value={ayarlar.heroButon2}
                  onChange={(e) => handleChange('heroButon2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon 1
              </label>
              <input
                type="text"
                value={ayarlar.telefon}
                onChange={(e) => handleChange('telefon', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Numarası
              </label>
              <input
                type="text"
                value={ayarlar.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+90 555 123 45 67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                WhatsApp numarası girildiğinde web sitesinde WhatsApp butonu görünecektir.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta 1
              </label>
              <input
                type="email"
                value={ayarlar.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta 2
              </label>
              <input
                type="email"
                value={ayarlar.email2}
                onChange={(e) => handleChange('email2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres
              </label>
              <textarea
                value={ayarlar.adres}
                onChange={(e) => handleChange('adres', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': previewColor } as React.CSSProperties & { '--tw-ring-color': string }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = previewColor
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${previewColor}40`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
                placeholder="Satırlar arası geçiş için Enter kullanın"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Footer Ayarları</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Açıklama Metni
            </label>
            <textarea
              value={ayarlar.footerMetin}
              onChange={(e) => handleChange('footerMetin', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Önizleme */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Renk Önizleme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div
                className="h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: previewColor }}
              >
                Buton
              </div>
              <p className="text-sm text-gray-600 text-center">Buton Rengi</p>
            </div>
            <div>
              <div
                className="h-20 rounded-lg mb-2 flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: previewColor + '80' }}
              >
                Hover
              </div>
              <p className="text-sm text-gray-600 text-center">Hover Efekti</p>
            </div>
            <div>
              <div
                className="h-20 rounded-lg mb-2 border-2 flex items-center justify-center font-semibold"
                style={{ borderColor: previewColor, color: previewColor }}
              >
                Link
              </div>
              <p className="text-sm text-gray-600 text-center">Link Rengi</p>
            </div>
            <div>
              <div
                className="h-20 rounded-lg mb-2 flex items-center justify-center font-semibold"
                style={{ backgroundColor: previewColor + '20', color: previewColor }}
              >
                Vurgu
              </div>
              <p className="text-sm text-gray-600 text-center">Vurgu Rengi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

