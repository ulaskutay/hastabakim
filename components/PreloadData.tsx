'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

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
    
    // Tüm verileri pre-load yap (SWR cache'ine ekle)
    const preloadAllData = async () => {
      const startTime = Date.now()
      console.log('🚀 Tüm veriler pre-load başladı...')
      
      try {
        // Paralel olarak tüm endpoint'leri çağır ve SWR cache'ine ekle
        const endpoints = [
          '/api/kategoriler',
          '/api/hastalar',
          '/api/personel',
          '/api/randevular',
        ]
        
        // Her endpoint'i fetch edip cache'e ekle
        await Promise.allSettled(
          endpoints.map(async (url) => {
            try {
              const data = await fetcher(url)
              // SWR cache'ine ekle (revalidate: false = hemen cache'le)
              mutate(url, data, { revalidate: false })
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

