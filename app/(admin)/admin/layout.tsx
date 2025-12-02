'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiUsers, FiCalendar, FiUser, FiLogOut, FiSettings, FiTag, FiMail } from 'react-icons/fi'
import { SWRConfig } from 'swr'

// SWR fetcher fonksiyonu
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  return response.json()
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
  const [preloadStarted, setPreloadStarted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPrimaryColor(parsed.primaryColor || '#0ea5e9')
    }
  }, [])

  // Tüm verileri pre-load yap (ilk açılışta bir kere)
  useEffect(() => {
    if (preloadStarted) return
    
    setPreloadStarted(true)
    
    // Tüm verileri paralel olarak pre-load yap
    const preloadData = async () => {
      const startTime = Date.now()
      console.log('🚀 Tüm veriler pre-load başladı...')
      
      try {
        // Paralel olarak tüm endpoint'leri çağır
        await Promise.allSettled([
          fetch('/api/kategoriler').then(r => r.json()),
          fetch('/api/hastalar').then(r => r.json()),
          fetch('/api/personel').then(r => r.json()),
          fetch('/api/randevular').then(r => r.json()),
        ])
        
        const loadTime = Date.now() - startTime
        console.log(`✅ Tüm veriler pre-load tamamlandı (${loadTime}ms)`)
        console.log('💾 Artık tüm sayfalar anında açılacak!')
      } catch (error) {
        console.error('Pre-load hatası:', error)
      }
    }
    
    preloadData()
  }, [preloadStarted])

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/hastalar', label: 'Hastalar', icon: FiUsers },
    { href: '/admin/randevular', label: 'Randevular', icon: FiCalendar },
    { href: '/admin/personel', label: 'Personel', icon: FiUser },
    { href: '/admin/kategoriler', label: 'Kategoriler', icon: FiTag },
    { href: '/admin/tasarim', label: 'Tasarım', icon: FiSettings },
    { href: '/admin/smtp', label: 'SMTP Yönetimi', icon: FiMail },
  ]

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        refreshInterval: 0,
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 bottom-0">
          <div className="p-6 h-full flex flex-col">
            <div>
              <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-800">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                <FiLogOut />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
    </SWRConfig>
  )
}

