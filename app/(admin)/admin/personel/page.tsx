'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import { getCache } from '@/lib/cache'
import { swrFetcher } from '@/lib/swr-fetcher'

interface Personel {
  id: string
  ad: string
  soyad: string
  telefon: string
  email?: string | null
  pozisyon: string
  sertifika?: string | null
  durum: string
}

export default function PersonelPage() {
  // localStorage'dan initial data al (sayfa yüklenir yüklenmez göster)
  const cachedData = typeof window !== 'undefined' ? getCache<Personel[]>('/api/personel') : null
  
  // SWR ile cache'li veri yükleme
  const { data: personel = cachedData || [], error, isLoading } = useSWR<Personel[]>(
    '/api/personel',
    swrFetcher,
    {
      fallbackData: cachedData || undefined, // İlk render'da cache'den göster
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 0,
    }
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPersonel, setEditingPersonel] = useState<Personel | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    pozisyon: '',
    sertifika: '',
    durum: 'aktif',
  })

  const loading = isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingPersonel
        ? `/api/personel/${editingPersonel.id}`
        : '/api/personel'
      
      const method = editingPersonel ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      ad: formData.ad,
      soyad: formData.soyad,
      telefon: formData.telefon,
          email: formData.email || null,
      pozisyon: formData.pozisyon,
          sertifika: formData.sertifika || null,
          durum: formData.durum || 'aktif',
        }),
      })

      if (response.ok) {
        // SWR cache'ini ve localStorage'ı yenile
        mutate('/api/personel', async () => {
          const data = await swrFetcher('/api/personel')
          return data
        })
        setIsModalOpen(false)
    setEditingPersonel(null)
    setFormData({
      ad: '',
      soyad: '',
      telefon: '',
      email: '',
      pozisyon: '',
      sertifika: '',
      durum: 'aktif',
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

  const handleEdit = (personelItem: Personel) => {
    setEditingPersonel(personelItem)
    setFormData({
      ad: personelItem.ad,
      soyad: personelItem.soyad,
      telefon: personelItem.telefon,
      email: personelItem.email || '',
      pozisyon: personelItem.pozisyon,
      sertifika: personelItem.sertifika || '',
      durum: personelItem.durum,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/personel/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // SWR cache'ini ve localStorage'ı yenile
        mutate('/api/personel', async () => {
          const data = await swrFetcher('/api/personel')
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

  const filteredPersonel = personel.filter(
    (p) =>
      p.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pozisyon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personel Yönetimi</h1>
        <button
          onClick={() => {
            setEditingPersonel(null)
            setFormData({
              ad: '',
              soyad: '',
              telefon: '',
              email: '',
              pozisyon: '',
              sertifika: '',
              durum: 'aktif',
            })
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Yeni Personel Ekle</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
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
      ) : (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pozisyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sertifika
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
              {filteredPersonel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Henüz personel kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredPersonel.map((personelItem) => (
                  <tr key={personelItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {personelItem.ad} {personelItem.soyad}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {personelItem.pozisyon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {personelItem.telefon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {personelItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {personelItem.sertifika || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          personelItem.durum === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {personelItem.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(personelItem)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(personelItem.id)}
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
              {editingPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.soyad}
                    onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pozisyon
                </label>
                <select
                  required
                  value={formData.pozisyon}
                  onChange={(e) => setFormData({ ...formData, pozisyon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Pozisyon Seçin</option>
                  <option value="Hasta Bakıcı">Hasta Bakıcı</option>
                  <option value="Yaşlı Bakıcı">Yaşlı Bakıcı</option>
                  <option value="Hemşire">Hemşire</option>
                  <option value="Fizyoterapist">Fizyoterapist</option>
                  <option value="Diyetisyen">Diyetisyen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sertifika
                </label>
                <input
                  type="text"
                  value={formData.sertifika}
                  onChange={(e) => setFormData({ ...formData, sertifika: e.target.value })}
                  placeholder="Örn: Hasta Bakım Sertifikası"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
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
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  {editingPersonel ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingPersonel(null)
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

