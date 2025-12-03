'use client'

import { FiUser } from 'react-icons/fi'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

export default function AdminPreloader() {
  const { ayarlar } = useTasarimAyarlari()

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Logo veya Spinner */}
          {ayarlar.logo ? (
            <div className="mb-6">
              <img
                src={ayarlar.logo}
                alt={ayarlar.siteBaslik}
                className="h-16 w-auto object-contain animate-pulse"
              />
            </div>
          ) : (
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-full h-full border-4 rounded-full border-t-transparent animate-spin"
                style={{ borderColor: ayarlar.primaryColor }}
              ></div>
            </div>
          )}
          
          {/* Text */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Veriler Yükleniyor</h2>
          <p className="text-gray-600 text-center">
            Hasta, personel ve randevu verileri yükleniyor. Lütfen bekleyin...
          </p>
        </div>
      </div>
    </div>
  )
}


