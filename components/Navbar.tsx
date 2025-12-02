'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FiMenu, FiX, FiUser } from 'react-icons/fi'

interface MenuItem {
  id: string
  label: string
  href: string
  visible: boolean
  order: number
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [ayarlar, setAyarlar] = useState({
    siteBaslik: 'Hasta Bakım',
    primaryColor: '#0ea5e9',
    logo: '',
  })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', label: 'Ana Sayfa', href: '/', visible: true, order: 1 },
    { id: '2', label: 'Hizmetler', href: '/#hizmetler', visible: true, order: 2 },
    { id: '3', label: 'Hakkımızda', href: '/#hakkimizda', visible: true, order: 3 },
    { id: '4', label: 'İletişim', href: '/#iletisim', visible: true, order: 4 },
  ])

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
      document.documentElement.style.setProperty('--primary-color', parsed.primaryColor)
    }

    // Menü öğelerini yükle
    const storedMenu = localStorage.getItem('menuItems')
    if (storedMenu) {
      const parsed = JSON.parse(storedMenu)
      setMenuItems(parsed)
    }
  }, [])

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Anchor link kontrolü (# ile başlayan)
    if (href.startsWith('#') || href.includes('#')) {
      e.preventDefault()
      
      // URL'den hash'i al
      const hash = href.includes('#') ? href.split('#')[1] : href.substring(1)
      
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
    } else if (href === '/') {
      // Ana sayfa için smooth scroll
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
    
    // Mobile menüyü kapat
    setIsOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {ayarlar.logo ? (
                <img
                  src={ayarlar.logo}
                  alt={ayarlar.siteBaslik}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: ayarlar.primaryColor }}
                >
                  <FiUser className="text-white text-xl" />
                </div>
              )}
              <span className="text-xl font-bold text-gray-800">{ayarlar.siteBaslik}</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems
              .filter((item) => item.visible)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleMenuClick(e, item.href)}
                  className="text-gray-700 transition cursor-pointer"
                  onMouseEnter={(e) => (e.currentTarget.style.color = ayarlar.primaryColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
                >
                  {item.label}
                </a>
              ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {menuItems
              .filter((item) => item.visible)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleMenuClick(e, item.href)}
                  className="block px-3 py-2 text-gray-700 rounded-md transition cursor-pointer"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ayarlar.primaryColor + '20')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {item.label}
                </a>
              ))}
          </div>
        </div>
      )}
    </nav>
  )
}

