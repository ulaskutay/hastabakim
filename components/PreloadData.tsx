'use client'

import { useEffect, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { getCache } from '@/lib/cache'
import { swrFetcher } from '@/lib/swr-fetcher'

export default function PreloadData({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
  const { mutate } = useSWRConfig()
  const hasPreloaded = useRef(false)

  useEffect(() => {
    // React Strict Mode'da iki kez çalışmasını engelle
    if (hasPreloaded.current) return
    hasPreloaded.current = true
    
    // Tüm verileri pre-load yap (SWR cache'ine ve localStorage'a ekle)
    const preloadAllData = async () => {
      const startTime = Date.now()
      console.log('🚀 Veri yükleme kontrolü başladı...')
      
      // Admin panel için öncelikli endpoint'ler
      const adminCriticalEndpoints = [
        '/api/tasarim',
        '/api/hastalar',
        '/api/personel',
        '/api/randevular',
        '/api/kategoriler',
        '/api/hizmetler?all=true',
      ]
      
      // Frontend için kritik endpoint'ler (preloader için tasarım ayarları, sayfa için hizmetler)
      const frontendCriticalEndpoints = ['/api/tasarim', '/api/hizmetler']
      
      // Tüm kritik endpoint'leri birleştir (tekrarları kaldır)
      const allCriticalEndpoints = [...new Set([...adminCriticalEndpoints, ...frontendCriticalEndpoints])]
      
      // Cache kontrolü - tüm veriler cache'de var mı?
      const allCached = allCriticalEndpoints.every(url => getCache(url) !== null)
      
      if (allCached) {
        // Tüm veriler cache'de var, sadece SWR cache'ine yükle
        console.log("✅ Tüm veriler cache'de mevcut, API çağrısı yapılmıyor")
        
        // Cache'deki verileri SWR cache'ine yükle (önce tasarım ayarlarını)
        allCriticalEndpoints.forEach(url => {
          const cachedData = getCache(url)
          if (cachedData !== null) {
            mutate(url, cachedData, { revalidate: false })
          }
        })
        
        // SWR cache'ine yazılmasını bekle (kısa bir gecikme)
        await new Promise(resolve => setTimeout(resolve, 50))
        
        onLoadingChange?.(false)
        const loadTime = Date.now() - startTime
        console.log(`✅ Veriler cache'den yüklendi (${loadTime}ms)`)
        return
      }
      
      // Cache'de eksik veriler var, yükleme başlat
      console.log("🔄 Cache'de eksik veriler var, API'den yükleniyor...")
      onLoadingChange?.(true)
      
      // Timeout ekle - maksimum 3 saniye bekle
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Pre-load timeout - loading state kapatılıyor')
        onLoadingChange?.(false)
      }, 3000)
      
      try {
        // Önce tasarım ayarlarını yükle (preloader için gerekli)
        const tasarimUrl = '/api/tasarim'
        try {
          const tasarimData = await swrFetcher(tasarimUrl)
          mutate(tasarimUrl, tasarimData, { revalidate: false })
          console.log(`✅ ${tasarimUrl} yüklendi (öncelikli)`)
          // SWR cache'ine yazılmasını bekle
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (error: any) {
          console.error(`❌ ${tasarimUrl} pre-load hatası:`, error?.message || error)
          mutate(tasarimUrl, {}, { revalidate: false })
        }
        
        // Diğer kritik endpoint'leri paralel yükle
        const otherCriticalEndpoints = allCriticalEndpoints.filter(url => url !== tasarimUrl)
        await Promise.allSettled(
          otherCriticalEndpoints.map(async (url) => {
            try {
              const data = await swrFetcher(url)
              mutate(url, data, { revalidate: false })
              console.log(`✅ ${url} yüklendi`)
            } catch (error: any) {
              console.error(`❌ ${url} pre-load hatası:`, error?.message || error)
              const emptyData = url.includes('tasarim') ? {} : []
              mutate(url, emptyData, { revalidate: false })
            }
          })
        )
        
        // Kritik veriler yüklendi, sayfayı göster
        clearTimeout(timeoutId)
        onLoadingChange?.(false)
        const criticalLoadTime = Date.now() - startTime
        console.log(`✅ Veriler yüklendi (${criticalLoadTime}ms) - sayfa gösteriliyor`)
      } catch (error: any) {
        console.error('Pre-load genel hatası:', error?.message || error)
        clearTimeout(timeoutId)
        onLoadingChange?.(false)
      }
    }
    
    preloadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null // Bu component görünmez
}

