'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { getCache, setCache } from '@/lib/cache'

// Fetcher fonksiyonu
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    throw new Error(error.error || 'Veri yüklenirken hata oluştu')
  }
  return response.json()
}

export default function PreloadData() {
  const { mutate } = useSWRConfig()
  const [preloadStarted, setPreloadStarted] = useState(false)

  useEffect(() => {
    if (preloadStarted) return
    
    setPreloadStarted(true)
    
    // Tüm verileri pre-load yap (SWR cache'ine ve localStorage'a ekle)
    const preloadAllData = async () => {
      const startTime = Date.now()
      console.log('🚀 Tüm veriler pre-load başladı...')
      
      try {
        const endpoints = [
          '/api/kategoriler',
          '/api/hastalar',
          '/api/personel',
          '/api/randevular',
        ]
        
        // Önce localStorage'dan cache kontrol et, yoksa API'den çek
        await Promise.allSettled(
          endpoints.map(async (url) => {
            try {
              // Önce localStorage'dan kontrol et
              const cached = getCache(url)
              if (cached) {
                console.log(`📦 ${url} cache'den yüklendi`)
                // SWR cache'ine ekle (revalidate: false = yeniden fetch yapma)
                mutate(url, cached, { revalidate: false })
              } else {
                // Cache yoksa API'den çek
                const data = await fetcher(url)
                // Hem SWR hem localStorage'a kaydet
                mutate(url, data, { revalidate: false })
                setCache(url, data)
                console.log(`🌐 ${url} API'den yüklendi ve cache'lendi`)
              }
            } catch (error) {
              console.error(`${url} pre-load hatası:`, error)
            }
          })
        )
        
        const loadTime = Date.now() - startTime
        console.log(`✅ Tüm veriler pre-load tamamlandı (${loadTime}ms)`)
        console.log('💾 Artık tüm sayfalar anında açılacak!')
      } catch (error) {
        console.error('Pre-load hatası:', error)
      }
    }
    
    preloadAllData()
  }, [preloadStarted, mutate])

  return null // Bu component görünmez
}

