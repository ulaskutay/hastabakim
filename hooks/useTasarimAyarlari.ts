'use client'

import useSWR from 'swr'
import { swrFetcher } from '@/lib/swr-fetcher'
import { TASARIM_DEFAULTLARI, TasarimAyarlari } from '@/lib/tasarim-defaults'

export function useTasarimAyarlari() {
  const { data, error, isLoading, mutate } = useSWR<TasarimAyarlari>(
    '/api/tasarim',
    swrFetcher,
    {
      // fallbackData yok - eski veriyi göstermesin
      revalidateOnMount: false, // PreloadData zaten yükledi, tekrar fetch yapma
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  // PreloadData tasarım ayarlarını önce yüklüyor, bu yüzden cache'den okuyacak
  // Eğer data yoksa (PreloadData henüz yüklemediyse), default kullan (sadece fallback)
  // Ama PreloadData yükledikten sonra fresh data olacak
  return {
    ayarlar: data || TASARIM_DEFAULTLARI, // || kullan - sadece undefined/null ise default
    error,
    isLoading,
    mutate,
  }
}

