'use client'

import { useEffect, useState } from 'react'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

export default function SitePreloader() {
  const { ayarlar, isLoading } = useTasarimAyarlari()
  const [showContent, setShowContent] = useState(false)

  // Tasarım ayarları yüklendikten sonra içeriği göster
  useEffect(() => {
    if (!isLoading && (ayarlar.logo || ayarlar.siteBaslik)) {
      // Kısa bir gecikme ile göster (SWR cache'ine yazılması için)
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, ayarlar.logo, ayarlar.siteBaslik])

  // Tasarım ayarları yüklenene kadar veya içerik hazır değilse hiçbir şey gösterme
  if (isLoading || !showContent) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {/* Boş - tasarım ayarları yüklenene kadar bekle */}
      </div>
    )
  }

  // Logo veya başlık yoksa hiçbir şey gösterme
  if (!ayarlar.logo && !ayarlar.siteBaslik) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center space-y-6 px-4">
        {/* Logo */}
        {ayarlar.logo && (
          <img
            src={ayarlar.logo}
            alt={ayarlar.siteBaslik || 'Site'}
            className="h-20 md:h-24 w-auto object-contain"
          />
        )}

        {/* Site Başlığı */}
        {ayarlar.siteBaslik && (
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            {ayarlar.siteBaslik}
          </h1>
        )}
      </div>
    </div>
  )
}

