/** @type {import('next').NextConfig} */
const path = require('path')

// Set NEXT_PUBLIC_BASE_PATH="" in Vercel, or "/kamikaze" for GitHub Pages
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

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
