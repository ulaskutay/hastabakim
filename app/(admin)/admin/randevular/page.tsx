'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { FiPlus, FiEdit, FiTrash2, FiCalendar } from 'react-icons/fi'
import { getCache } from '@/lib/cache'
import { swrFetcher } from '@/lib/swr-fetcher'

interface Randevu {
  id: string
  hastaId: string
  hastaAd: string
  personelId: string
  personelAd: string
  tarih: string
  saat: string
  durum: string
  notlar: string | null
}

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

export default function RandevularPage() {
  // localStorage'dan initial data al
  const cachedRandevular = typeof window !== 'undefined' ? getCache<Randevu[]>('/api/randevular') : null
  const cachedHastalar = typeof window !== 'undefined' ? getCache<Hasta[]>('/api/hastalar') : null
  const cachedPersonel = typeof window !== 'undefined' ? getCache<Personel[]>('/api/personel') : null
  
  // SWR ile cache'li veri yükleme - Randevular
  const { data: randevular = cachedRandevular || [], error: randevularError, isLoading: randevularLoading } = useSWR<Randevu[]>(
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

  // SWR ile cache'li veri yükleme - Hastalar
  const { data: hastalarData = cachedHastalar || [], error: hastalarError } = useSWR<Hasta[]>(
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

  // SWR ile cache'li veri yükleme - Personel
  const { data: personelData = cachedPersonel || [], error: personelError } = useSWR<Personel[]>(
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

  const hastalar = hastalarData
  const personel = personelData

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRandevu, setEditingRandevu] = useState<Randevu | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    hastaId: '',
    personelId: '',
    tarih: '',
    saat: '',
    durum: 'planlandi',
    notlar: '',
  })

  const loading = randevularLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingRandevu ? `/api/randevular/${editingRandevu.id}` : '/api/randevular'
      const method = editingRandevu ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hastaId: formData.hastaId,
          personelId: formData.personelId,
          tarih: formData.tarih,
          saat: formData.saat,
          durum: formData.durum || 'planlandi',
          notlar: formData.notlar || null,
        }),
      })

      if (response.ok) {
        const newRandevu = await response.json()
        
        // Optimistic update - hemen UI'yi güncelle
        mutate('/api/randevular', (current: Randevu[] = []) => {
          if (editingRandevu) {
            // Güncelleme
            return current.map(r => r.id === editingRandevu.id ? newRandevu : r)
          } else {
            // Yeni ekleme
            return [...current, newRandevu]
          }
        }, false) // revalidate: false = hemen güncelle, arka planda fresh data çekme
        
        // Arka planda fresh data çek ve güncelle
        mutate('/api/randevular', async () => {
          const data = await swrFetcher('/api/randevular')
          return data
        })
        
        setIsModalOpen(false)
        setEditingRandevu(null)
        setFormData({
          hastaId: '',
          personelId: '',
          tarih: '',
          saat: '',
          durum: 'planlandi',
          notlar: '',
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

  const handleEdit = (randevu: Randevu) => {
    setEditingRandevu(randevu)
    setFormData({
      hastaId: randevu.hastaId,
      personelId: randevu.personelId,
      tarih: randevu.tarih,
      saat: randevu.saat,
      durum: randevu.durum,
      notlar: randevu.notlar || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/randevular/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Optimistic update - hemen UI'den kaldır
        mutate('/api/randevular', (current: Randevu[] = []) => {
          return current.filter(r => r.id !== id)
        }, false) // revalidate: false = hemen güncelle
        
        // Arka planda fresh data çek ve güncelle
        mutate('/api/randevular', async () => {
          const data = await swrFetcher('/api/randevular')
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

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'planlandi':
        return 'bg-blue-100 text-blue-800'
      case 'aktif':
        return 'bg-green-100 text-green-800'
      case 'tamamlandi':
        return 'bg-gray-100 text-gray-800'
      case 'iptal':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'planlandi':
        return 'Planlandı'
      case 'aktif':
        return 'Aktif'
      case 'tamamlandi':
        return 'Tamamlandı'
      case 'iptal':
        return 'İptal'
      default:
        return durum
    }
  }

  const sortedRandevular = [...randevular].sort((a, b) => {
    const dateA = new Date(a.tarih + ' ' + a.saat).getTime()
    const dateB = new Date(b.tarih + ' ' + b.saat).getTime()
    return dateA - dateB
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Randevu Yönetimi</h1>
        <button
          onClick={() => {
            setEditingRandevu(null)
            setFormData({
              hastaId: '',
              personelId: '',
              tarih: '',
              saat: '',
              durum: 'planlandi',
              notlar: '',
            })
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Yeni Randevu</span>
        </button>
      </div>

      {(randevularError || hastalarError || personelError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">
            Hata: {randevularError?.message || hastalarError?.message || personelError?.message}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hasta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRandevular.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Henüz randevu kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                sortedRandevular.map((randevu) => (
                  <tr key={randevu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {randevu.hastaAd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {randevu.personelAd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(randevu.tarih).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {randevu.saat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDurumColor(
                          randevu.durum
                        )}`}
                      >
                        {getDurumText(randevu.durum)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(randevu)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(randevu.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingRandevu ? 'Randevu Düzenle' : 'Yeni Randevu Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <select
                  required
                  value={formData.hastaId}
                  onChange={(e) => setFormData({ ...formData, hastaId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Hasta Seçin</option>
                  {hastalar.map((hasta) => (
                    <option key={hasta.id} value={hasta.id}>
                      {hasta.ad} {hasta.soyad}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personel
                </label>
                <select
                  required
                  value={formData.personelId}
                  onChange={(e) => setFormData({ ...formData, personelId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Personel Seçin</option>
                  {personel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ad} {p.soyad}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saat
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.saat}
                    onChange={(e) => setFormData({ ...formData, saat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={formData.durum}
                  onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="planlandi">Planlandı</option>
                  <option value="aktif">Aktif</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="iptal">İptal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  value={formData.notlar}
                  onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : editingRandevu ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingRandevu(null)
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
