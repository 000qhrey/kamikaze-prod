'use client'

import { getAssetPath } from '@/lib/basePath'

/**
 * Static sigil — same asset as PanelManifesto hanko.
 * No WebGL / three.js. Used on mobile, lite, and as LCP placeholder.
 */
export function SunLogoStatic() {
  const src = getAssetPath('/logo-sigil.png')

  return (
    <div className="k-hero-sun-logo k-hero-sun-logo--static" aria-hidden>
      <img
        src={src}
        alt=""
        width={512}
        height={512}
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
    </div>
  )
}

export default SunLogoStatic
