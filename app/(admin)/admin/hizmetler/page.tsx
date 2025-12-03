'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { getCache, setCache } from '@/lib/cache'
import * as Icons from 'react-icons/fi'

interface Hizmet {
  id: string
  baslik: string
  aciklama: string
  ikon: string
  sira: number
  durum: string
}

// Mevcut ikonlar listesi
const availableIcons = [
  { name: 'FiUser', label: 'Kullanıcı' },
  { name: 'FiHeart', label: 'Kalp' },
  { name: 'FiActivity', label: 'Aktivite' },
  { name: 'FiHome', label: 'Ev' },
  { name: 'FiClock', label: 'Saat' },
  { name: 'FiShield', label: 'Kalkan' },
  { name: 'FiStar', label: 'Yıldız' },
  { name: 'FiAward', label: 'Ödül' },
  { name: 'FiCheckCircle', label: 'Onay' },
  { name: 'FiTrendingUp', label: 'Yükseliş' },
  { name: 'FiUsers', label: 'Kullanıcılar' },
  { name: 'FiSettings', label: 'Ayarlar' },
  { name: 'FiPhone', label: 'Telefon' },
  { name: 'FiMail', label: 'Mail' },
  { name: 'FiMapPin', label: 'Konum' },
]

// SWR fetcher fonksiyonu
const fetcher = async (url: string) => {
  const startTime = Date.now()
  
  const cached = getCache(url)
  
  fetch(url)
    .then(r => r.json())
    .then(data => {
      setCache(url, data)
      mutate(url, data, { revalidate: false })
    })
    .catch(() => {})
  
  if (cached) {
    const loadTime = Date.now() - startTime
    console.log(`Hizmetler yüklendi (${loadTime}ms) - 📦 Cache (arka planda güncelleniyor)`)
    return cached
  }
  
  const response = await fetch(url)
  const loadTime = Date.now() - startTime
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  
  const data = await response.json()
  setCache(url, data)
  console.log(`Hizmetler yüklendi (${loadTime}ms) - 🌐 API`)
  return data
}

// İkon bileşenini al
const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Icons.FiUser
  return IconComponent
}

export default function HizmetlerPage() {
  const cachedData = typeof window !== 'undefined' ? getCache<Hizmet[]>('/api/hizmetler?all=true') : null
  
  const { data: hizmetler = cachedData || [], error, isLoading } = useSWR<Hizmet[]>(
    '/api/hizmetler?all=true',
    fetcher,
    {
      fallbackData: cachedData || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 0,
    }
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHizmet, setEditingHizmet] = useState<Hizmet | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    ikon: 'FiUser',
    sira: 0,
  })

  const loading = isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingHizmet
        ? `/api/hizmetler/${editingHizmet.id}`
        : '/api/hizmetler'
      
      const method = editingHizmet ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baslik: formData.baslik,
          aciklama: formData.aciklama,
          ikon: formData.ikon,
          sira: formData.sira,
        }),
      })

      if (response.ok) {
        mutate('/api/hizmetler?all=true', async () => {
          const data = await fetcher('/api/hizmetler?all=true')
          return data
        })
        setIsModalOpen(false)
        setEditingHizmet(null)
        setFormData({
          baslik: '',
          aciklama: '',
          ikon: 'FiUser',
          sira: 0,
        })
      } else {
        const error = await response.json()
        alert('Hata: ' + error.error)
      }
    } catch (error: any) {
      console.error('Hata:', error)
      alert('Bir hata oluştu: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (hizmet: Hizmet) => {
    setEditingHizmet(hizmet)
    setFormData({
      baslik: hizmet.baslik,
      aciklama: hizmet.aciklama,
      ikon: hizmet.ikon,
      sira: hizmet.sira,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/hizmetler/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        mutate('/api/hizmetler?all=true', async () => {
          const data = await fetcher('/api/hizmetler?all=true')
          return data
        })
      } else {
        const error = await response.json()
        alert('Hata: ' + error.error)
      }
    } catch (error: any) {
      console.error('Hata:', error)
      alert('Bir hata oluştu: ' + error.message)
    }
  }

  const handleSiraChange = async (hizmet: Hizmet, direction: 'up' | 'down') => {
    const currentIndex = hizmetler.findIndex(h => h.id === hizmet.id)
    if (currentIndex === -1) return

    let targetIndex: number
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < hizmetler.length - 1) {
      targetIndex = currentIndex + 1
    } else {
      return
    }

    const targetHizmet = hizmetler[targetIndex]
    const newSira = targetHizmet.sira
    const oldSira = hizmet.sira

    try {
      // İki hizmetin sırasını değiştir
      await Promise.all([
        fetch(`/api/hizmetler/${hizmet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sira: newSira }),
        }),
        fetch(`/api/hizmetler/${targetHizmet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sira: oldSira }),
        }),
      ])

      mutate('/api/hizmetler?all=true', async () => {
        const data = await fetcher('/api/hizmetler?all=true')
        return data
      })
    } catch (error: any) {
      console.error('Hata:', error)
      alert('Sıra değiştirilirken hata oluştu: ' + error.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hizmet Yönetimi</h1>
        <button
          onClick={() => {
            setEditingHizmet(null)
            setFormData({
              baslik: '',
              aciklama: '',
              ikon: 'FiUser',
              sira: hizmetler.length > 0 ? Math.max(...hizmetler.map(h => h.sira)) + 1 : 1,
            })
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Yeni Hizmet Ekle</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Hata: {error.message}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : hizmetler.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
            <FiGrid className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz hizmet yok</h3>
            <p className="text-gray-600 mb-4">İlk hizmetinizi ekleyerek başlayın</p>
            <button
              onClick={() => {
                setEditingHizmet(null)
                setFormData({
                  baslik: '',
                  aciklama: '',
                  ikon: 'FiUser',
                  sira: 1,
                })
                setIsModalOpen(true)
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition inline-flex items-center space-x-2"
            >
              <FiPlus />
              <span>İlk Hizmeti Ekle</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {hizmetler.map((hizmet) => {
            const Icon = getIconComponent(hizmet.ikon)
            return (
              <div
                key={hizmet.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleSiraChange(hizmet, 'up')}
                        disabled={hizmetler.findIndex(h => h.id === hizmet.id) === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiArrowUp />
                      </button>
                      <span className="text-sm text-gray-500 font-medium">{hizmet.sira}</span>
                      <button
                        onClick={() => handleSiraChange(hizmet, 'down')}
                        disabled={hizmetler.findIndex(h => h.id === hizmet.id) === hizmetler.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiArrowDown />
                      </button>
                    </div>
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#0ea5e920' }}
                    >
                      <Icon className="text-2xl" style={{ color: '#0ea5e9' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{hizmet.baslik}</h3>
                      <p className="text-gray-600">{hizmet.aciklama}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">İkon: {hizmet.ikon}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          hizmet.durum === 'aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hizmet.durum}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(hizmet)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
                    >
                      <FiEdit />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={() => handleDelete(hizmet.id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingHizmet ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hizmet Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={formData.baslik}
                  onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Yaşlı Bakım Hizmetleri"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  required
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Hizmet açıklaması"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkon
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = getIconComponent(icon.name)
                    const isSelected = formData.ikon === icon.name
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, ikon: icon.name })}
                        className={`p-3 rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={icon.label}
                      >
                        <IconComponent className="text-xl mx-auto" />
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  value={formData.ikon}
                  onChange={(e) => setFormData({ ...formData, ikon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="FiUser"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıra
                </label>
                <input
                  type="number"
                  value={formData.sira}
                  onChange={(e) => setFormData({ ...formData, sira: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : editingHizmet ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingHizmet(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

