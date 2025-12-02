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
  const { mutate, cache } = useSWRConfig()
  const [preloadStarted, setPreloadStarted] = useState(false)

  useEffect(() => {
    if (preloadStarted) return
    
    setPreloadStarted(true)
    
    // Tüm verileri pre-load yap (SWR cache'ine ekle)
    const preloadAllData = async () => {
      const startTime = Date.now()
      console.log('🚀 Tüm veriler pre-load başladı...')
      
      try {
        // SWR'ın mutate fonksiyonu ile pre-fetch yap
        // Bu veriler cache'lenecek ve sayfalar anında açılacak
        await Promise.allSettled([
          mutate('/api/kategoriler', () => fetcher('/api/kategoriler'), { revalidate: false }),
          mutate('/api/hastalar', () => fetcher('/api/hastalar'), { revalidate: false }),
          mutate('/api/personel', () => fetcher('/api/personel'), { revalidate: false }),
          mutate('/api/randevular', () => fetcher('/api/randevular'), { revalidate: false }),
        ])
        
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

