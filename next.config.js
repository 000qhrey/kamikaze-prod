/** @type {import('next').NextConfig} */
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

// GitHub Pages (staging) needs /kamikaze prefix, Vercel (prod) is at root
const basePath = isProd && !isVercel ? '/kamikaze' : ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  // Transpile R3F packages to ensure proper bundling
  transpilePackages: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'three'],
  // Ensure single React instance for R3F compatibility
  webpack: (config, { isServer }) => {
    // Only apply aliases on client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve('./node_modules/react'),
        'react-dom': path.resolve('./node_modules/react-dom'),
        'react-dom/client': path.resolve('./node_modules/react-dom/client'),
        three: path.resolve('./node_modules/three'),
      }
    }
    return config
  },
}

module.exports = nextConfig
