'use client'

import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useTasarimAyarlari } from '@/hooks/useTasarimAyarlari'

export default function Footer() {
  const { ayarlar } = useTasarimAyarlari()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{ayarlar.siteBaslik}</h3>
            <p className="text-gray-400">
              {ayarlar.footerMetin}
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/#hizmetler" className="hover:text-white transition">Hizmetler</a></li>
              <li><a href="/#hakkimizda" className="hover:text-white transition">Hakkımızda</a></li>
              <li><a href="/#iletisim" className="hover:text-white transition">İletişim</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <FiPhone style={{ color: ayarlar.primaryColor }} />
                <span>{ayarlar.telefon}</span>
              </li>
              {ayarlar.whatsapp && (
                <li className="flex items-center space-x-2">
                  <FaWhatsapp style={{ color: '#25D366' }} />
                  <a
                    href={`https://wa.me/${ayarlar.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    {ayarlar.whatsapp}
                  </a>
                </li>
              )}
              <li className="flex items-center space-x-2">
                <FiMail style={{ color: ayarlar.primaryColor }} />
                <span>{ayarlar.email}</span>
              </li>
              {ayarlar.email2 && (
                <li className="flex items-center space-x-2">
                  <FiMail style={{ color: ayarlar.primaryColor }} />
                  <span>{ayarlar.email2}</span>
                </li>
              )}
              <li className="flex items-start space-x-2">
                <FiMapPin className="mt-1" style={{ color: ayarlar.primaryColor }} />
                <span style={{ whiteSpace: 'pre-line' }}>{ayarlar.adres}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 {ayarlar.siteBaslik}. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      {ayarlar.whatsapp && (
        <a
          href={`https://wa.me/${ayarlar.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all hover:scale-110 flex items-center justify-center group"
          style={{ width: '60px', height: '60px' }}
          aria-label="WhatsApp ile iletişime geç"
        >
          <FaWhatsapp className="text-3xl group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            <span className="absolute inline-flex rounded-full h-3 w-3 bg-red-500 opacity-75 animate-ping"></span>
          </span>
        </a>
      )}
    </footer>
  )
}

