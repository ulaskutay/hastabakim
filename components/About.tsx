'use client'

import { FiAward, FiUsers, FiTarget } from 'react-icons/fi'

const features = [
  {
    icon: FiAward,
    title: 'Deneyim',
    description: '10+ yıllık sektör deneyimi ile güvenilir hizmet',
  },
  {
    icon: FiUsers,
    title: 'Uzman Ekip',
    description: 'Sertifikalı ve deneyimli bakım personeli',
  },
  {
    icon: FiTarget,
    title: 'Kalite',
    description: 'Müşteri memnuniyeti odaklı hizmet anlayışı',
  },
]

export default function About() {
  return (
    <section id="hakkimizda" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Hakkımızda</h2>
            <p className="text-lg text-gray-600 mb-4">
              Hasta Bakım olarak, sevdiklerinizin sağlığı ve konforu için en iyi bakım hizmetlerini sunmayı hedefliyoruz. 
              Deneyimli ekibimiz ve modern yaklaşımımızla, her hasta ve yaşlı birey için özel bakım planları oluşturuyoruz.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Misyonumuz, her bireyin saygınlık içinde, güvenli ve konforlu bir şekilde bakım almasını sağlamaktır. 
              Değerlerimiz arasında şeffaflık, güvenilirlik ve müşteri memnuniyeti yer almaktadır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="text-primary-600 text-xl" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-primary-50 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Vizyonumuz</h3>
                <p className="text-gray-600">
                  Türkiye'nin en güvenilir ve kaliteli bakım hizmeti sağlayıcısı olmak.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Misyonumuz</h3>
                <p className="text-gray-600">
                  Her birey için özel, kaliteli ve güvenilir bakım hizmetleri sunmak.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Değerlerimiz</h3>
                <p className="text-gray-600">
                  Saygı, güvenilirlik, şeffaflık ve müşteri memnuniyeti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

