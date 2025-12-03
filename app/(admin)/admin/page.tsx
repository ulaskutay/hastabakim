'use client'

import useSWR from 'swr'
import { FiUsers, FiCalendar, FiUser, FiActivity } from 'react-icons/fi'
import Link from 'next/link'
import { getCache } from '@/lib/cache'
import { swrFetcher } from '@/lib/swr-fetcher'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

interface Hasta {
  id: string
  ad: string
  soyad: string
}

interface Personel {
  id: string
  ad: string
  soyad: string
}

interface Randevu {
  id: string
  durum: string
}

export default function AdminDashboard() {
  const { ayarlar } = useTasarimAyarlari()
  const primaryColor = ayarlar.primaryColor

  // localStorage'dan initial data al
  const cachedHastalar = typeof window !== 'undefined' ? getCache<Hasta[]>('/api/hastalar') : null
  const cachedRandevular = typeof window !== 'undefined' ? getCache<Randevu[]>('/api/randevular') : null
  const cachedPersonel = typeof window !== 'undefined' ? getCache<Personel[]>('/api/personel') : null

  // SWR ile cache'li veri yükleme
  const { data: hastalar = cachedHastalar || [] } = useSWR<Hasta[]>(
    '/api/hastalar',
    swrFetcher,
    {
      fallbackData: cachedHastalar || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 0,
    }
  )

  const { data: randevular = cachedRandevular || [] } = useSWR<Randevu[]>(
    '/api/randevular',
    swrFetcher,
    {
      fallbackData: cachedRandevular || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 0,
    }
  )

  const { data: personel = cachedPersonel || [] } = useSWR<Personel[]>(
    '/api/personel',
    swrFetcher,
    {
      fallbackData: cachedPersonel || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 0,
    }
  )

  // İstatistikleri hesapla
  const stats = {
    hastalar: hastalar?.length || 0,
    randevular: randevular?.length || 0,
    personel: personel?.length || 0,
    aktifBakimlar: randevular?.filter((r) => r.durum === 'aktif').length || 0,
  }

  const statCards = [
    {
      title: 'Toplam Hasta',
      value: stats.hastalar,
      icon: FiUsers,
      color: 'bg-blue-500',
      href: '/admin/hastalar',
    },
    {
      title: 'Randevular',
      value: stats.randevular,
      icon: FiCalendar,
      color: 'bg-green-500',
      href: '/admin/randevular',
    },
    {
      title: 'Personel',
      value: stats.personel,
      icon: FiUser,
      color: 'bg-purple-500',
      href: '/admin/personel',
    },
    {
      title: 'Aktif Bakımlar',
      value: stats.aktifBakimlar,
      icon: FiActivity,
      color: 'bg-orange-500',
      href: '/admin/randevular',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link
              key={index}
              href={card.href}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-lg`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoş Geldiniz</h2>
        <p className="text-gray-600 mb-4">
          Hasta Bakım yönetim paneline hoş geldiniz. Buradan hastalar, randevular ve personel bilgilerini yönetebilirsiniz.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            href="/admin/hastalar"
            className="p-4 rounded-lg transition"
            style={{ 
              backgroundColor: primaryColor + '20',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor + '30'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor + '20'
            }}
          >
            <h3 className="font-semibold text-gray-900 mb-2">Hasta Yönetimi</h3>
            <p className="text-sm text-gray-600">Hasta kayıtlarını görüntüleyin ve yönetin</p>
          </Link>
          <Link
            href="/admin/randevular"
            className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Randevu Yönetimi</h3>
            <p className="text-sm text-gray-600">Randevuları planlayın ve takip edin</p>
          </Link>
          <Link
            href="/admin/personel"
            className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Personel Yönetimi</h3>
            <p className="text-sm text-gray-600">Personel bilgilerini yönetin</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
