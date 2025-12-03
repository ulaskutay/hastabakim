'use client'

import useSWR from 'swr'
import { swrFetcher } from '@/lib/swr-fetcher'
import { TASARIM_DEFAULTLARI, TasarimAyarlari } from '@/lib/tasarim-defaults'

export function useTasarimAyarlari() {
  const { data, error, isLoading, mutate } = useSWR<TasarimAyarlari>(
    '/api/tasarim',
    swrFetcher,
    {
      fallbackData: TASARIM_DEFAULTLARI,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    ayarlar: data ?? TASARIM_DEFAULTLARI,
    error,
    isLoading,
    mutate,
  }
}

