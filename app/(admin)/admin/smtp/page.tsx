'use client'

import { useEffect, useState } from 'react'
import { FiSave, FiMail, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'

interface SmtpConfig {
  host: string
  port: string
  secure: boolean
  user: string
  pass: string
  recipientEmail: string
}

export default function SmtpPage() {
  const [config, setConfig] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    recipientEmail: '',
  })

  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    // localStorage'dan veya API'den ayarları yükle
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const stored = localStorage.getItem('smtpConfig')
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig(parsed)
      }

      // API'den de yükle (eğer varsa)
      const response = await fetch('/api/smtp/config')
      if (response.ok) {
        const apiConfig = await response.json()
        setConfig((prev) => ({
          ...prev,
          ...apiConfig,
          pass: '', // Güvenlik nedeniyle şifre gönderilmez
        }))
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error)
    }
  }

  const handleChange = (key: keyof SmtpConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setTestResult(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setTestResult(null)

    try {
      // Önce localStorage'a kaydet (hızlı erişim için)
      localStorage.setItem('smtpConfig', JSON.stringify(config))

      // Sonra API'ye kaydet
      const response = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (response.ok) {
        alert('SMTP ayarları başarıyla kaydedildi!')
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error: any) {
      console.error('Kaydetme hatası:', error)
      alert('Ayarlar kaydedilirken hata oluştu: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      alert('Lütfen test e-postası adresini girin.')
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          testEmail,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message,
        })
      } else {
        setTestResult({
          success: false,
          message: result.error,
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Test sırasında hata oluştu: ' + error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiMail className="text-2xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">SMTP Yönetimi</h1>
        </div>

        <p className="text-gray-600 mb-8">
          E-posta gönderimi için SMTP ayarlarını yapılandırın. Bu ayarlar iletişim formundan gelen mesajların gönderilmesi için kullanılacaktır.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => handleChange('host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Örnek: smtp.gmail.com, smtp.office365.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.port}
                onChange={(e) => handleChange('port', e.target.value)}
                placeholder="587"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Genellikle: 587 (TLS) veya 465 (SSL)
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.secure}
                onChange={(e) => handleChange('secure', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                SSL/TLS Güvenli Bağlantı Kullan (Port 465 için)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı (E-posta) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={config.user}
              onChange={(e) => handleChange('user', e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre / Uygulama Şifresi <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={config.pass}
              onChange={(e) => handleChange('pass', e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gmail için: Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama şifreleri
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alıcı E-posta Adresi
            </label>
            <input
              type="email"
              value={config.recipientEmail}
              onChange={(e) => handleChange('recipientEmail', e.target.value)}
              placeholder="info@hastabakim.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              İletişim formundan gelen mesajlar bu adrese gönderilecektir.
            </p>
          </div>
        </div>

        {/* Test Bölümü */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            SMTP Bağlantı Testi
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test e-postası göndermek için e-posta adresi girin"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTest}
              disabled={loading || !testEmail}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Test Ediliyor...</span>
                </>
              ) : (
                <>
                  <FiMail />
                  <span>Test E-postası Gönder</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
                testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <FiCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
              ) : (
                <FiXCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }
                >
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Popüler SMTP Servisleri */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popüler SMTP Servis Ayarları
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white p-3 rounded border border-blue-200">
              <strong className="text-gray-900">Gmail:</strong>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Host: smtp.gmail.com</li>
                <li>• Port: 587 (TLS) veya 465 (SSL)</li>
                <li>• Güvenli: Port 465 için aktif</li>
                <li>• Uygulama şifresi kullanılmalı</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <strong className="text-gray-900">Outlook/Office365:</strong>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Host: smtp.office365.com</li>
                <li>• Port: 587</li>
                <li>• Güvenli: Pasif (TLS kullanılır)</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <strong className="text-gray-900">Yandex:</strong>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Host: smtp.yandex.com</li>
                <li>• Port: 465</li>
                <li>• Güvenli: Aktif</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <FiSave />
                <span>Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

