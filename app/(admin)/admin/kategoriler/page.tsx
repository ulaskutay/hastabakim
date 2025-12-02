'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { FiPlus, FiEdit, FiTrash2, FiTag } from 'react-icons/fi'
import { getCache, setCache } from '@/lib/cache'

interface Kategori {
  id: string
  ad: string
  aciklama?: string | null
  renk: string
}

// SWR fetcher fonksiyonu - localStorage cache kullanıyor (stale-while-revalidate)
const fetcher = async (url: string) => {
  const startTime = Date.now()
  
  // Önce localStorage'dan kontrol et
  const cached = getCache(url)
  
  // Arka planda fresh data çek (cache olsa da olmasa da)
  fetch(url)
    .then(r => r.json())
    .then(data => {
      setCache(url, data)
      mutate(url, data, { revalidate: false })
    })
    .catch(() => {})
  
  // Cache varsa hemen göster, yoksa API'den bekle
  if (cached) {
    const loadTime = Date.now() - startTime
    console.log(`Kategoriler yüklendi (${loadTime}ms) - 📦 Cache (arka planda güncelleniyor)`)
    return cached
  }
  
  // Cache yoksa API'den çek
  const response = await fetch(url)
  const loadTime = Date.now() - startTime
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  
  const data = await response.json()
  setCache(url, data) // localStorage'a kaydet
  console.log(`Kategoriler yüklendi (${loadTime}ms) - 🌐 API`)
  return data
}

export default function KategorilerPage() {
  // localStorage'dan initial data al (sayfa yüklenir yüklenmez göster)
  const cachedData = typeof window !== 'undefined' ? getCache<Kategori[]>('/api/kategoriler') : null
  
  // SWR ile cache'li veri yükleme
  const { data: kategoriler = cachedData || [], error, isLoading } = useSWR<Kategori[]>(
    '/api/kategoriler',
    fetcher,
    {
      fallbackData: cachedData || undefined, // İlk render'da cache'den göster
      revalidateOnFocus: false, // Focus olduğunda yenileme
      revalidateOnReconnect: true, // Bağlantı yenilendiğinde yenile
      dedupingInterval: 5000, // 5 saniye içinde aynı istek tekrar yapılmaz
      refreshInterval: 0, // Otomatik yenileme yok (manuel kontrol)
    }
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    renk: '#3B82F6',
  })

  const loading = isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingKategori
        ? `/api/kategoriler/${editingKategori.id}`
        : '/api/kategoriler'
      
      const method = editingKategori ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      ad: formData.ad,
          aciklama: formData.aciklama || null,
      renk: formData.renk,
        }),
      })

      if (response.ok) {
        // SWR cache'ini ve localStorage'ı yenile
        mutate('/api/kategoriler', async () => {
          const data = await fetcher('/api/kategoriler')
          return data
        })
    setIsModalOpen(false)
    setEditingKategori(null)
    setFormData({
      ad: '',
      aciklama: '',
      renk: '#3B82F6',
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

  const handleEdit = (kategori: Kategori) => {
    setEditingKategori(kategori)
    setFormData({
      ad: kategori.ad,
      aciklama: kategori.aciklama || '',
      renk: kategori.renk,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait hasta kayıtları etkilenebilir.')) {
      return
    }

    try {
      const response = await fetch(`/api/kategoriler/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // SWR cache'ini ve localStorage'ı yenile
        mutate('/api/kategoriler', async () => {
          const data = await fetcher('/api/kategoriler')
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
        <button
          onClick={() => {
            setEditingKategori(null)
            setFormData({
              ad: '',
              aciklama: '',
              renk: '#3B82F6',
            })
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Yeni Kategori Ekle</span>
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
      ) : kategoriler.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
            <FiTag className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kategori yok</h3>
            <p className="text-gray-600 mb-4">İlk kategorinizi ekleyerek başlayın</p>
            <button
              onClick={() => {
                setEditingKategori(null)
                setFormData({
                  ad: '',
                  aciklama: '',
                  renk: '#3B82F6',
                })
                setIsModalOpen(true)
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition inline-flex items-center space-x-2"
            >
              <FiPlus />
              <span>İlk Kategoriyi Ekle</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kategoriler.map((kategori) => (
          <div
            key={kategori.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: kategori.renk + '20' }}
                >
                  <FiTag style={{ color: kategori.renk }} className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{kategori.ad}</h3>
                  <p className="text-sm text-gray-500">{kategori.aciklama}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: kategori.renk }}
              />
              <span className="text-sm text-gray-600">{kategori.renk}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(kategori)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-2"
              >
                <FiEdit />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => handleDelete(kategori.id)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingKategori ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  required
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Yaşlı Bakım"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Kategori açıklaması"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.renk}
                    onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                    className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.renk}
                    onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-300"
                    style={{ backgroundColor: formData.renk }}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : editingKategori ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingKategori(null)
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

