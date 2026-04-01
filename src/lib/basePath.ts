// Base path for assets - must match next.config.js basePath
// Set NEXT_PUBLIC_BASE_PATH="" in Vercel, or "/kamikaze" for GitHub Pages
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function getAssetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
