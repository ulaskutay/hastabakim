'use client'

import { useState } from 'react'
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

  return (
    <>
      <PreloadData onLoadingChange={setIsLoading} />
      {isLoading && <SitePreloader />}
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}

