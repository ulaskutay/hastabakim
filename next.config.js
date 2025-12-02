/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // API route'ları build sırasında analiz edilmesin
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': '@prisma/client',
      })
    }
    return config
  },
}

module.exports = nextConfig

