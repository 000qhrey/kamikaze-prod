'use client'

import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

export function DepthLayers() {
  const isMobile = useIsMobile()
  const [scrollProgress, setScrollProgress] = useState(0)

  // Track scroll progress — skip heavy fog updates on mobile for smoother native scroll
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty('--scroll-progress', '0')
      return
    }

    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? scrollTop / docHeight : 0
        const clamped = Math.min(1, Math.max(0, progress))
        setScrollProgress(clamped)
        document.documentElement.style.setProperty('--scroll-progress', clamped.toString())
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  return (
    <>
      {/* Perspective grid floor - desktop only */}
      {!isMobile && <div className="perspective-grid" aria-hidden="true" />}

      {/* Fog layer - thickens with scroll on desktop */}
      <div
        className="fixed inset-0 pointer-events-none z-[45]"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 100%,
              rgba(10, 10, 10, ${0.5 + scrollProgress * 0.4}) 0%,
              transparent 70%
            ),
            radial-gradient(ellipse 100% 60% at 50% 0%,
              rgba(10, 10, 10, ${0.3 + scrollProgress * 0.3}) 0%,
              transparent 50%
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[50]"
        style={{
          boxShadow: `inset 0 0 ${200 + scrollProgress * 50}px ${60 + scrollProgress * 40}px rgba(0, 0, 0, 0.85)`,
        }}
        aria-hidden="true"
      />

      {/* Red corner bleed */}
      <div
        className="fixed inset-0 pointer-events-none z-[49]"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, rgba(139,0,0,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(139,0,0,0.15) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Scanlines - desktop only */}
      {!isMobile && <div className="scanlines" aria-hidden="true" />}

      {/* Scroll indicator - desktop only */}
      {!isMobile && (
        <div
          className="fixed right-4 top-1/2 -translate-y-1/2 w-[2px] h-[30vh] bg-white/30 z-[60]"
          aria-hidden="true"
        >
          <div
            className="w-full bg-arterial transition-all duration-100"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      )}
    </>
  )
}
