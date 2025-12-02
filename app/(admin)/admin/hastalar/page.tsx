'use client'

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'

interface Hasta {
  id: string
  ad: string
  soyad: string
  telefon: string
  email?: string | null
  yas: number
  adres?: string | null
  kategoriId: string
  kategori?: {
    id: string
    ad: string
    renk: string
  }
  durum: string
}

export default function HastalarPage() {
  const [hastalar, setHastalar] = useState<Hasta[]>([])
  const [kategoriler, setKategoriler] = useState<{ id: string; ad: string; renk: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHasta, setEditingHasta] = useState<Hasta | null>(null)
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    yas: '',
    adres: '',
    kategori: '',
    durum: 'aktif',
  })

  useEffect(() => {
    loadKategoriler()
    loadHastalar()
  }, [])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadKategoriler = async () => {
    try {
      const response = await fetch('/api/kategoriler')
      if (response.ok) {
        const data = await response.json()
        setKategoriler(data.map((k: any) => ({ id: k.id, ad: k.ad, renk: k.renk || '#3B82F6' })))
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const getKategoriRenk = (kategoriId: string) => {
    const kategori = kategoriler.find((k) => k.id === kategoriId)
    return kategori?.renk || '#6B7280'
  }

  const getKategoriAd = (kategoriId: string) => {
    const kategori = kategoriler.find((k) => k.id === kategoriId)
    return kategori?.ad || 'Kategori Yok'
  }

  const loadHastalar = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hastalar')
      if (response.ok) {
        const data = await response.json()
        setHastalar(data)
      }
    } catch (error) {
      console.error('Hastalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingHasta ? `/api/hastalar/${editingHasta.id}` : '/api/hastalar'
      const method = editingHasta ? 'PUT' : 'POST'

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
      yas: parseInt(formData.yas),
          adres: formData.adres || null,
          kategoriId: formData.kategori,
          durum: formData.durum || 'aktif',
        }),
      })

      if (response.ok) {
        await loadHastalar()
    setIsModalOpen(false)
    setEditingHasta(null)
    setFormData({
      ad: '',
      soyad: '',
      telefon: '',
      email: '',
      yas: '',
      adres: '',
      kategori: '',
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

  const handleEdit = (hasta: Hasta) => {
    setEditingHasta(hasta)
    setFormData({
      ad: hasta.ad,
      soyad: hasta.soyad,
      telefon: hasta.telefon,
      email: hasta.email || '',
      yas: hasta.yas.toString(),
      adres: hasta.adres || '',
      kategori: hasta.kategoriId,
      durum: hasta.durum,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hastayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/hastalar/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadHastalar()
      } else {
        const error = await response.json()
        alert('Hata: ' + error.error)
      }
    } catch (error: any) {
      console.error('Hata:', error)
      alert('Bir hata oluştu: ' + error.message)
    }
  }

  const filteredHastalar = hastalar.filter(
    (hasta) =>
      hasta.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hasta.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hasta.telefon.includes(searchTerm) ||
      (hasta.kategori && hasta.kategori.ad.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hasta Yönetimi</h1>
        <button
          onClick={() => {
            setEditingHasta(null)
            setFormData({
              ad: '',
              soyad: '',
              telefon: '',
              email: '',
              yas: '',
              adres: '',
              kategori: '',
              durum: 'aktif',
            })
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus />
          <span>Yeni Hasta Ekle</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Hasta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yaş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredHastalar.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Henüz hasta kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredHastalar.map((hasta) => (
                  <tr key={hasta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {hasta.ad} {hasta.soyad}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hasta.telefon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hasta.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hasta.yas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasta.kategori ? (
                        <span
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                          style={{
                            backgroundColor: hasta.kategori.renk || getKategoriRenk(hasta.kategoriId),
                          }}
                        >
                          {hasta.kategori.ad}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          hasta.durum === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {hasta.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(hasta)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(hasta.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingHasta ? 'Hasta Düzenle' : 'Yeni Hasta Ekle'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yaş
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.yas}
                    onChange={(e) => setFormData({ ...formData, yas: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    required
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Kategori Seçin</option>
                    {kategoriler.map((kategori) => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.ad}
                      </option>
                    ))}
                  </select>
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
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  value={formData.adres}
                  onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
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
                  {submitting ? 'Kaydediliyor...' : editingHasta ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingHasta(null)
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

