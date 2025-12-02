/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // API route'ları için özel ayarlar
  output: 'standalone',
}

module.exports = nextConfig

