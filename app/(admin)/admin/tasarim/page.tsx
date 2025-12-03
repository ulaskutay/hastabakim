'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { FiSave, FiRefreshCw, FiEye } from 'react-icons/fi'
import { TASARIM_DEFAULTLARI, TasarimAyarlari } from '@/lib/tasarim-defaults'
import { swrFetcher } from '@/lib/swr-fetcher'

export default function TasarimPage() {
  const [ayarlar, setAyarlar] = useState<TasarimAyarlari>({ ...TASARIM_DEFAULTLARI })
  const [previewColor, setPreviewColor] = useState(TASARIM_DEFAULTLARI.primaryColor)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { data: kayitliAyarlar, isLoading, mutate } = useSWR<TasarimAyarlari>(
    '/api/tasarim',
    swrFetcher,
    {
      revalidateOnMount: false, // PreloadData zaten yükledi
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )
  const initialLoading = !kayitliAyarlar && isLoading

  const applyTheme = (current: TasarimAyarlari) => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('--primary-color', current.primaryColor)

    if (current.favicon) {
      const existingLinks = document.querySelectorAll("link[rel*='icon']")
      existingLinks.forEach((link) => link.remove())

      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = current.favicon.startsWith('data:image/svg')
        ? 'image/svg+xml'
        : current.favicon.startsWith('data:image/png')
        ? 'image/png'
        : current.favicon.startsWith('data:image/jpeg') || current.favicon.startsWith('data:image/jpg')
        ? 'image/jpeg'
        : current.favicon.startsWith('data:image/x-icon') || current.favicon.startsWith('data:image/vnd.microsoft.icon')
        ? 'image/x-icon'
        : 'image/png'
      link.href = current.favicon
      document.head.appendChild(link)
    }
  }

  useEffect(() => {
    if (kayitliAyarlar) {
      setAyarlar(kayitliAyarlar)
      setPreviewColor(kayitliAyarlar.primaryColor)
      applyTheme(kayitliAyarlar)
    }
  }, [kayitliAyarlar])

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

  const handleChange = (key: keyof TasarimAyarlari, value: string) => {
    setAyarlar((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'primaryColor') {
        setPreviewColor(value)
      }
      return updated
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/tasarim', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ayarlar),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Tasarım ayarları kaydedilemedi.')
      }

      const updated: TasarimAyarlari = await response.json()
      setAyarlar(updated)
      setPreviewColor(updated.primaryColor)
      mutate(updated, { revalidate: false })
      applyTheme(updated)
      alert('Tasarım ayarları kaydedildi! Değişiklikler anında yansıyacak.')
    } catch (error: any) {
      alert(error.message || 'Tasarım ayarları kaydedilirken hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Tüm tasarım ayarlarını varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      return
    }

    try {
      setResetting(true)
      const defaultAyarlar = { ...TASARIM_DEFAULTLARI }
      setAyarlar(defaultAyarlar)
      setPreviewColor(defaultAyarlar.primaryColor)

      const response = await fetch('/api/tasarim', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultAyarlar),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Tasarım ayarları sıfırlanamadı.')
      }

      mutate(defaultAyarlar, { revalidate: false })
      applyTheme(defaultAyarlar)
    } catch (error: any) {
      alert(error.message || 'Varsayılanlara dönerken hata oluştu.')
    } finally {
      setResetting(false)
    }
  }

  const handleImageUpload = (key: 'logo' | 'favicon' | 'heroGorsel', file: File | null) => {
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

  const handleRemoveImage = (key: 'logo' | 'favicon' | 'heroGorsel') => {
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
            disabled={resetting || saving || initialLoading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw />
            <span>{resetting ? 'Sıfırlanıyor...' : 'Sıfırla'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || initialLoading}
            className="text-white px-4 py-2 rounded-lg transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: previewColor }}
            onMouseEnter={(e) => {
              if (!saving) {
                const rgb = hexToRgb(previewColor)
                e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = previewColor
            }}
          >
            <FiSave />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
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
            {/* Hero Görsel Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Görseli
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                    onChange={(e) => handleImageUpload('heroGorsel', e.target.files?.[0] || null)}
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
                    PNG, JPG, GIF veya SVG formatında, maksimum 2MB. Görsel hero bölümünün arka planında gösterilecektir.
                  </p>
                </div>
                {ayarlar.heroGorsel && (
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={ayarlar.heroGorsel} alt="Hero görsel önizleme" className="max-w-full max-h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('heroGorsel')}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
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

