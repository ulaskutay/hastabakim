// Shared SWR fetcher - Her zaman fresh data çeker (frontend only)
import { mutate } from 'swr'
import { setCache } from './cache'

export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  // URL'den query parametrelerini temizle (SWR key'i temiz tutmak için)
  const cleanUrl = url.split('?')[0]
  
  // Fetch için timestamp ekle - TÜM cache'leri bypass et (browser, HTTP, Next.js, Vercel)
  const separator = cleanUrl.includes('?') ? '&' : '?'
  const cacheBusterUrl = `${cleanUrl}${separator}_t=${Date.now()}`
  
  // Her zaman fresh data çek - cache'i tamamen bypass et
  const response = await fetch(cacheBusterUrl, {
    cache: 'no-store', // Browser cache'ini bypass et
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  
  const data = await response.json()
  
  // Fresh data'yı cache'e kaydet (SWR key'i orijinal URL ile)
  setCache(cleanUrl, data)
  mutate(cleanUrl, data, { revalidate: true })
  
  return data
}

