// Base path for assets - must match next.config.js basePath
// For GitHub Pages deployment at zhreyu.github.io/kamikaze
export const basePath = process.env.NODE_ENV === 'production' ? '/kamikaze' : ''

export function getAssetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
