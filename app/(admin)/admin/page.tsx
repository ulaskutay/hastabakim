'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiCalendar, FiUser, FiActivity } from 'react-icons/fi'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    hastalar: 0,
    randevular: 0,
    personel: 0,
    aktifBakimlar: 0,
  })
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')

  useEffect(() => {
    // localStorage'dan verileri al
    const hastalar = JSON.parse(localStorage.getItem('hastalar') || '[]')
    const randevular = JSON.parse(localStorage.getItem('randevular') || '[]')
    const personel = JSON.parse(localStorage.getItem('personel') || '[]')
    
    setStats({
      hastalar: hastalar.length,
      randevular: randevular.length,
      personel: personel.length,
      aktifBakimlar: randevular.filter((r: any) => r.durum === 'aktif').length,
    })

    // Tasarım ayarlarından renk al
    const tasarimAyarlari = localStorage.getItem('tasarimAyarlari')
    if (tasarimAyarlari) {
      const parsed = JSON.parse(tasarimAyarlari)
      setPrimaryColor(parsed.primaryColor || '#0ea5e9')
    }
  }, [])

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

