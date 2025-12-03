'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import { getCache, setCache } from '@/lib/cache'

// Fetcher fonksiyonu - cache bypass ile fresh data çek
const fetcher = async (url: string) => {
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
  return response.json()
}

export default function PreloadData({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
  const { mutate } = useSWRConfig()
  const [preloadStarted, setPreloadStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (preloadStarted) return
    
    setPreloadStarted(true)
    
    // Tüm verileri pre-load yap (SWR cache'ine ve localStorage'a ekle)
    const preloadAllData = async () => {
      const startTime = Date.now()
      console.log('🚀 Tüm veriler pre-load başladı...')
      setIsLoading(true)
      onLoadingChange?.(true)
      
      try {
        const endpoints = [
          '/api/kategoriler',
          '/api/hastalar',
          '/api/personel',
          '/api/randevular',
          '/api/hizmetler',
        ]
        
        // Her zaman fresh data çek - cache'i bypass et
        await Promise.allSettled(
          endpoints.map(async (url) => {
            try {
              // Direkt fresh data çek (cache'i bypass et)
              const data = await fetcher(url)
              // Fresh data'yı cache'e kaydet ve SWR'ye ekle
              setCache(url, data)
              mutate(url, data, { revalidate: true })
              console.log(`✅ ${url} fresh data yüklendi ve cache'lendi`)
            } catch (error) {
              console.error(`❌ ${url} pre-load hatası:`, error)
              // Hata durumunda cache'i kontrol et (sadece fallback)
              const cached = getCache(url)
              if (cached) {
                mutate(url, cached, { revalidate: true })
                console.log(`⚠️ ${url} hata nedeniyle cache kullanılıyor (fallback)`)
              }
            }
          })
        )
        
        const loadTime = Date.now() - startTime
        console.log(`✅ Tüm veriler pre-load tamamlandı (${loadTime}ms)`)
        console.log('💾 Artık tüm sayfalar anında açılacak!')
      } catch (error) {
        console.error('Pre-load hatası:', error)
      } finally {
        setIsLoading(false)
        onLoadingChange?.(false)
      }
    }
    
    preloadAllData()
  }, [preloadStarted, mutate, onLoadingChange])

  return null // Bu component görünmez
}

