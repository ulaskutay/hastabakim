'use client'

import { useEffect, useState } from 'react'
import { FiArrowRight, FiHeart } from 'react-icons/fi'

export default function Hero() {
  const [ayarlar, setAyarlar] = useState({
    heroBaslik: 'Profesyonel Hasta & Yaşlı Bakım Hizmetleri',
    heroAltBaslik: 'Sevdikleriniz için en iyi bakım hizmetini sunuyoruz. Deneyimli ve güvenilir ekibimizle yanınızdayız.',
    heroButon1: 'İletişime Geç',
    heroButon2: 'Hizmetlerimiz',
    heroGorsel: '',
    primaryColor: '#0ea5e9',
  })

  useEffect(() => {
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setAyarlar(parsed)
      // CSS değişkenini güncelle
      document.documentElement.style.setProperty('--primary-color', parsed.primaryColor)
    }
  }, [])

  // Renk fonksiyonları
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

  const getGradientColor = (color: string) => {
    const rgb = hexToRgb(color)
    // Daha koyu bir ton oluştur
    return `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Anchor link kontrolü (# ile başlayan)
    if (href.startsWith('#')) {
      e.preventDefault()
      
      // Hash'i al (# işaretini kaldır)
      const hash = href.substring(1)
      
      // Element'i bul
      const element = document.getElementById(hash)
      
      if (element) {
        // Navbar yüksekliği için offset
        const navbarHeight = 64 // h-16 = 64px
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - navbarHeight

        // Smooth scroll animasyonu
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <section
      className="text-white relative overflow-hidden"
      style={{
        background: ayarlar.heroGorsel
          ? `url(${ayarlar.heroGorsel}) center/cover no-repeat`
          : `linear-gradient(to right, ${ayarlar.primaryColor}, ${getGradientColor(ayarlar.primaryColor)})`,
      }}
    >
      {/* Overlay - Görsel varsa metin okunabilirliği için */}
      {ayarlar.heroGorsel && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${ayarlar.primaryColor}CC, ${getGradientColor(ayarlar.primaryColor)}CC)`,
          }}
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FiHeart className="text-6xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {ayarlar.heroBaslik}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {ayarlar.heroAltBaslik}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#iletisim"
              onClick={(e) => handleSmoothScroll(e, '#iletisim')}
              className="bg-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2 cursor-pointer"
              style={{ color: ayarlar.primaryColor }}
            >
              <span>{ayarlar.heroButon1}</span>
              <FiArrowRight />
            </a>
            <a
              href="#hizmetler"
              onClick={(e) => handleSmoothScroll(e, '#hizmetler')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white transition cursor-pointer"
              style={{ '--hover-color': ayarlar.primaryColor } as React.CSSProperties & { '--hover-color': string }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = ayarlar.primaryColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'white'
              }}
            >
              {ayarlar.heroButon2}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

