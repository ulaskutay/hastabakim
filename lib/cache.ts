// localStorage cache utility
// Cache verileri saklar, sayfa yenilendiğinde tekrar çekilmesini önler

const CACHE_PREFIX = 'swr_cache_'
const CACHE_TTL = 60 * 60 * 1000 // 1 saat - sayfa yenilendiğinde tekrar çekilmesin

export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key)
    if (!cached) return null
    
    const entry: CacheEntry<T> = JSON.parse(cached)
    
    // Cache süresi dolmuş mu?
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    
    return entry.data
  } catch (error) {
    console.error('Cache okuma hatası:', error)
    return null
  }
}

export function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch (error) {
    console.error('Cache yazma hatası:', error)
  }
}

export function clearCache(key?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key)
    } else {
      // Tüm cache'i temizle
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k))
    }
  } catch (error) {
    console.error('Cache temizleme hatası:', error)
  }
}

