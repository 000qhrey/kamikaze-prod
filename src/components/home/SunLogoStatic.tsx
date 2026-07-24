'use client'

import { getAssetPath } from '@/lib/basePath'
import { useTheme } from '@/providers/ThemeProvider'

/** Static PNG/WebP fallback — no WebGL / three.js cost. LCP-friendly. */
export function SunLogoStatic() {
  const { theme } = useTheme()
  const webp = getAssetPath('/logo-sigil.webp')
  const png = getAssetPath('/logo-sigil.png')

  return (
    <div
      className="k-hero-sun-logo k-hero-sun-logo--static"
      aria-hidden
      data-theme-logo={theme}
    >
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={getAssetPath('/logo-sigil-384.webp')}
          type="image/webp"
        />
        <source srcSet={webp} type="image/webp" />
        <img
          src={png}
          alt=""
          width={512}
          height={512}
          decoding="async"
          // Hero LCP candidate when WebGL is skipped (mobile / reduced motion)
          fetchPriority="high"
          draggable={false}
        />
      </picture>
    </div>
  )
}

export default SunLogoStatic
