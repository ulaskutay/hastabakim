/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build sırasında API route'larını analiz etme
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig

