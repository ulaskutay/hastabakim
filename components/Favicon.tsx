'use client'

import { useEffect } from 'react'

export default function Favicon() {
  useEffect(() => {
    // localStorage'dan favicon'u al
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.favicon) {
        // Mevcut favicon linklerini kaldır
        const existingLinks = document.querySelectorAll("link[rel*='icon']")
        existingLinks.forEach((link) => link.remove())

        // Yeni favicon linkini ekle
        const link = document.createElement('link')
        link.rel = 'icon'
        link.type = parsed.favicon.startsWith('data:image/svg') 
          ? 'image/svg+xml' 
          : parsed.favicon.startsWith('data:image/png')
          ? 'image/png'
          : parsed.favicon.startsWith('data:image/jpeg') || parsed.favicon.startsWith('data:image/jpg')
          ? 'image/jpeg'
          : parsed.favicon.startsWith('data:image/x-icon') || parsed.favicon.startsWith('data:image/vnd.microsoft.icon')
          ? 'image/x-icon'
          : 'image/png'
        link.href = parsed.favicon
        document.head.appendChild(link)
      }
    }
  }, [])

  return null
}

