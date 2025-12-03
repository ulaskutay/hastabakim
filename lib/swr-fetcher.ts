// Shared SWR fetcher - Cache kontrolü yapar, cache'de varsa onu kullanır
import { getCache, setCache } from './cache'

export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  // Önce cache'de var mı kontrol et
  const cachedData = getCache<T>(url)
  if (cachedData !== null) {
    console.log(`✅ ${url} cache'den yüklendi`)
    return cachedData
  }
  
  // Cache'de yoksa API'den çek
  console.log(`🔄 ${url} API'den çekiliyor...`)
  
  // URL'i parçala ve varsa query parametrelerini koru
  const [baseUrl, ...queryParts] = url.split('?')
  const queryString = queryParts.length > 0 ? queryParts.join('?') : ''
  const hasQuery = queryString.length > 0
  const originalUrl = hasQuery ? `${baseUrl}?${queryString}` : baseUrl
  
  // Fetch için timestamp ekle - HTTP cache'lerini bypass et
  const separator = hasQuery ? '&' : '?'
  const cacheBusterUrl = `${originalUrl}${separator}_t=${Date.now()}`
  
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
  
  // Fresh data'yı cache'e kaydet
  setCache(url, data)
  console.log(`✅ ${url} API'den yüklendi ve cache'e kaydedildi`)
  
  return data
}

