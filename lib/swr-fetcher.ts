// Shared SWR fetcher - Her zaman fresh data çeker (frontend only)
import { mutate } from 'swr'
import { setCache } from './cache'

export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  // Her zaman fresh data çek - cache'i bypass et
  const response = await fetch(url, {
    cache: 'no-store', // Browser cache'ini bypass et
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  
  const data = await response.json()
  
  // Fresh data'yı cache'e kaydet (sadece hızlandırma için, bir sonraki istekte yine fresh çekilecek)
  setCache(url, data)
  mutate(url, data, { revalidate: true })
  
  return data
}

