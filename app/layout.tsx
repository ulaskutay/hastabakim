import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Favicon from '@/components/Favicon'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hasta Bakım & Yaşlı Bakım Hizmetleri',
  description: 'Profesyonel hasta bakım ve yaşlı bakım hizmetleri',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className} suppressHydrationWarning>
        <Favicon />
        {children}
      </body>
    </html>
  )
}

