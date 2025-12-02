'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

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
        // SWR'ın mutate fonksiyonu ile pre-fetch yap
        // Bu veriler cache'lenecek ve sayfalar anında açılacak
        await Promise.allSettled([
          mutate('/api/kategoriler'),
          mutate('/api/hastalar'),
          mutate('/api/personel'),
          mutate('/api/randevular'),
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

