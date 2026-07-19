// Base path for assets and hard-nav hrefs — must match next.config.js basePath.
// Staging (GitHub Pages): NEXT_PUBLIC_BASE_PATH=/kamikaze
// Production (kamikaze.host / Vercel): leave unset or ""
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function getAssetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
