'use client'

import { getAssetPath } from '@/lib/basePath'
import { useTheme } from '@/providers/ThemeProvider'

/** Static PNG fallback — no WebGL / three.js cost. */
export function SunLogoStatic() {
  const { theme } = useTheme()
  return (
    <div
      className="k-hero-sun-logo k-hero-sun-logo--static"
      aria-hidden
      data-theme-logo={theme}
    >
      <img
        src={getAssetPath('/logo-sigil.png')}
        alt=""
        width={512}
        height={512}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}

export default SunLogoStatic
