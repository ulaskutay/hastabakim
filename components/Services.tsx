'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import * as Icons from 'react-icons/fi'
import { swrFetcher } from '@/lib/swr-fetcher'

interface Hizmet {
  id: string
  baslik: string
  aciklama: string
  ikon: string
  sira: number
}

// İkon bileşenini al
const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Icons.FiUser
  return IconComponent
}

export default function Services() {
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
  
  // Her zaman fresh data çek
  const { data: hizmetler = [], error, isLoading } = useSWR<Hizmet[]>(
    '/api/hizmetler',
    swrFetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      refreshInterval: 0,
      onError: (err) => {
        console.error('SWR hata:', err)
      },
    }
  )
  
  // Güvenlik kontrolü - her zaman array olduğundan emin ol
  const safeHizmetler = Array.isArray(hizmetler) ? hizmetler : []

  useEffect(() => {
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPrimaryColor(parsed.primaryColor)
    }
  }, [])

  if (isLoading) {
    return (
      <section id="hizmetler" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Hizmetler yükleniyor...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    console.error('Hizmetler yüklenirken hata:', error)
    return (
      <section id="hizmetler" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Hizmetler yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </section>
    )
  }

  if (safeHizmetler.length === 0) {
    return null
  }

  return (
    <section id="hizmetler" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kapsamlı bakım hizmetleri ile sevdiklerinizin sağlığı ve konforu için buradayız.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeHizmetler.map((hizmet) => {
            const Icon = getIconComponent(hizmet.ikon)
            return (
              <div
                key={hizmet.id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: primaryColor + '20' }}
                >
                  <Icon className="text-2xl" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {hizmet.baslik}
                </h3>
                <p className="text-gray-600">
                  {hizmet.aciklama}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

