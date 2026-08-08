'use client'

/**
 * Light route enter for App Router.
 * Uses Web Animations API after mount so content stays visible if JS stalls
 * (never paints stuck at opacity:0). Works with hard links / static export.
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof el.animate !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Opacity only — a lingering `transform` (even translateY(0)) makes
    // this node a containing block, which traps `position: fixed` heroes
    // inside a tall section and centers them below the fold.
    const anim = el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: 300,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      },
    )
    return () => anim.cancel()
  }, [pathname])

  return (
    <div ref={ref} style={{ minHeight: '100%' }}>
      {children}
    </div>
  )
}
