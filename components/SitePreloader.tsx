'use client'

import { FiUser } from 'react-icons/fi'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

export default function SitePreloader() {
  const { ayarlar } = useTasarimAyarlari()

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex items-center justify-center">
        {ayarlar.logo ? (
          <img
            src={ayarlar.logo}
            alt={ayarlar.siteBaslik}
            className="h-16 w-auto object-contain animate-pulse"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center animate-pulse"
            style={{ backgroundColor: ayarlar.primaryColor }}
          >
            <FiUser className="text-white text-2xl" />
          </div>
        )}
      </div>
    </div>
  )
}

