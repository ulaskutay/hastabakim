'use client'

import { useEffect, useState } from 'react'
import { FiUser, FiHeart, FiActivity, FiHome, FiClock, FiShield } from 'react-icons/fi'

const services = [
  {
    icon: FiUser,
    title: 'Yaşlı Bakım Hizmetleri',
    description: 'Yaşlılarımız için özenli ve profesyonel bakım hizmetleri. Günlük yaşam aktivitelerinde destek.',
  },
  {
    icon: FiHeart,
    title: 'Hasta Bakım Hizmetleri',
    description: 'Hastalarımız için 7/24 profesyonel bakım desteği. Tıbbi gereksinimlere uygun bakım.',
  },
  {
    icon: FiActivity,
    title: 'Fizik Tedavi Desteği',
    description: 'Uzman fizyoterapistler eşliğinde rehabilitasyon ve fizik tedavi programları.',
  },
  {
    icon: FiHome,
    title: 'Evde Bakım Hizmetleri',
    description: 'Ev ortamında konforlu ve güvenli bakım hizmetleri. Kişiye özel bakım planları.',
  },
  {
    icon: FiClock,
    title: '7/24 Destek',
    description: 'Acil durumlar için 7 gün 24 saat ulaşılabilir destek hattı.',
  },
  {
    icon: FiShield,
    title: 'Güvenilir Ekip',
    description: 'Sertifikalı ve deneyimli bakım personeli. Düzenli eğitim ve sertifikasyon.',
  },
]

export default function Services() {
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')

  useEffect(() => {
    const stored = localStorage.getItem('tasarimAyarlari')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPrimaryColor(parsed.primaryColor)
    }
  }, [])

  return (
    <section id="hizmetler" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kapsamlı bakım hizmetleri ile sevdiklerinizin sağlığı ve konforu için buradayız.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: primaryColor + '20' }}
                >
                  <Icon className="text-2xl" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

