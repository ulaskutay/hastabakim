'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PreloadData from '@/components/PreloadData'
import SitePreloader from '@/components/SitePreloader'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  // Fallback: Eğer 2 saniye içinde PreloadData loading'i kapatmazsa, zorla kapat
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ SiteLayout timeout - zorla loading kapatılıyor')
        setIsLoading(false)
      }
    }, 2000)

    return () => clearTimeout(fallbackTimeout)
  }, [isLoading])

  return (
    <>
      <PreloadData onLoadingChange={setIsLoading} />
      {isLoading && <SitePreloader />}
      {!isLoading && (
        <>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </>
      )}
    </>
  )
}

