/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/kamikaze',
  assetPrefix: '/kamikaze',
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}

module.exports = nextConfig
