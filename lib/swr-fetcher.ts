// Shared SWR fetcher with localStorage cache support
import { mutate } from 'swr'
import { getCache, setCache } from './cache'

export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  const startTime = Date.now()
  
  // Önce localStorage'dan kontrol et
  const cached = getCache<T>(url)
  
  // Arka planda fresh data çek (cache olsa da olmasa da)
  fetch(url, {
    cache: 'no-store', // Browser cache'ini bypass et
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
    .then(r => r.json())
    .then(data => {
      setCache(url, data)
      mutate(url, data, { revalidate: false })
    })
    .catch(() => {})
  
  // Cache varsa hemen göster, yoksa API'den bekle
  if (cached) {
    return cached
  }
  
  // Cache yoksa API'den çek
  const response = await fetch(url, {
    cache: 'no-store', // Browser cache'ini bypass et
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  
  const data = await response.json()
  setCache(url, data) // localStorage'a kaydet
  return data
}

