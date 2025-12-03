'use client'

import { useEffect } from 'react'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

export default function Favicon() {
  const { ayarlar } = useTasarimAyarlari()

  useEffect(() => {
    if (!ayarlar.favicon) return

    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach((link) => link.remove())

    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = ayarlar.favicon.startsWith('data:image/svg')
      ? 'image/svg+xml'
      : ayarlar.favicon.startsWith('data:image/png')
      ? 'image/png'
      : ayarlar.favicon.startsWith('data:image/jpeg') || ayarlar.favicon.startsWith('data:image/jpg')
      ? 'image/jpeg'
      : ayarlar.favicon.startsWith('data:image/x-icon') || ayarlar.favicon.startsWith('data:image/vnd.microsoft.icon')
      ? 'image/x-icon'
      : 'image/png'
    link.href = ayarlar.favicon
    document.head.appendChild(link)

    return () => {
      link.remove()
    }
  }, [ayarlar.favicon])

  return null
}

