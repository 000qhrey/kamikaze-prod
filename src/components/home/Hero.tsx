'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { getBass } from '@/hooks/useAudioEngine'
import { useTransition } from '@/providers/TransitionProvider'
import clsx from 'clsx'
import { HERO } from '@/data/siteCopy'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [heroProgress, setHeroProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [mouseDistance, setMouseDistance] = useState(0)
  const [audioIntensity, setAudioIntensity] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { navigateTo } = useTransition()

  // Detect mobile to disable depth scrolling
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track scroll through the hero section (not whole page — that kept progress near 0%)
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      const progress = scrollable > 0
        ? Math.max(0, Math.min(1, -rect.top / scrollable))
        : 0

      setHeroProgress(isMobile ? 0 : progress)
      setIsVisible(rect.bottom > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  // Track mouse distance from center for glitch intensity
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
    const normalized = distance / maxDistance

    setMouseDistance(normalized)

    // Update CSS variable for jitter intensity
    if (titleRef.current) {
      titleRef.current.style.setProperty('--jitter-x', String(normalized * 3))
      titleRef.current.style.setProperty('--jitter-y', String(normalized * 2))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Audio reactive updates
  useEffect(() => {
    let animFrame: number

    const updateAudio = () => {
      const bass = getBass()
      setAudioIntensity(bass)
      animFrame = requestAnimationFrame(updateAudio)
    }

    updateAudio()
    return () => cancelAnimationFrame(animFrame)
  }, [])

  // Chromatic aberration intensity based on mouse distance and audio
  const chromaticOffset = 2 + mouseDistance * 6 + audioIntensity * 8
  const dissolveOpacity = Math.max(0, 1 - heroProgress * 1.1)
  const dissolveBlur = heroProgress * 10
  const dissolveScale = 1 + heroProgress * 0.12
  const dissolveLift = heroProgress * -48

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: isMobile ? '100vh' : '200vh' }}
    >
      {/* Glitch tear line */}
      <div className="glitch-tear" />

      {/* Fixed hero content */}
      <div
        className={clsx(
          'fixed inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500',
          isVisible && dissolveOpacity > 0.05 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="relative will-change-transform"
          style={{
            transform: `scale(${dissolveScale}) translateY(${dissolveLift}px)`,
            opacity: dissolveOpacity,
            filter: `blur(${dissolveBlur}px)`,
          }}
        >
          {/* Main title - dissolves on descend */}
          <h1
            ref={titleRef}
            className="font-ritual text-6xl md:text-8xl lg:text-9xl text-white text-center tracking-wider relative inline-block text-jitter m-0"
            style={{
              letterSpacing: `${heroProgress * 0.35}em`,
              visibility: dissolveOpacity < 0.05 ? 'hidden' : 'visible',
              textShadow: `
                  ${-chromaticOffset}px 0 0 rgba(255, 0, 0, ${0.7 * dissolveOpacity}),
                  ${chromaticOffset}px 0 0 rgba(0, 255, 255, ${0.7 * dissolveOpacity}),
                  0 0 ${20 + audioIntensity * 40}px rgba(204, 0, 0, ${(0.3 + audioIntensity * 0.5) * dissolveOpacity})
                `,
            }}
          >
            KAMIKAZE
          </h1>

          {/* Subtitle - Monospace */}
          <p
            className="font-mono text-xs md:text-sm text-white/70 text-center mt-6 tracking-[0.3em] transition-all duration-75"
            style={{
              textShadow: audioIntensity > 0.3 ? '0 0 10px rgba(204, 0, 0, 0.5)' : 'none',
            }}
          >
            {HERO.tagline}
          </p>

          <p className="font-mono text-sm md:text-base text-white/90 text-center mt-8 max-w-md mx-auto leading-relaxed px-4">
            {HERO.valueProp}
          </p>

          {/* Audio level indicator */}
          {audioIntensity > 0 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-arterial transition-all duration-75"
                  style={{
                    height: `${Math.max(4, audioIntensity * 20 * (1 + Math.sin(Date.now() / 100 + i) * 0.5))}px`,
                    opacity: 0.3 + audioIntensity * 0.7,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Quick Access CTAs - thumb zone positioning */}
        {isMobile && isVisible && (
          <div className="absolute bottom-28 left-0 right-0 px-6 flex justify-center gap-6 pointer-events-auto">
            {/* Primary CTA - Events (filled style) */}
            <button
              onClick={() => navigateTo('/events')}
              className="font-mono text-sm tracking-widest bg-arterial/20 border border-arterial px-6 py-4 min-h-[44px] hover:bg-arterial/30 active:scale-95 active:bg-arterial/40 transition-all"
              style={{
                boxShadow: `0 0 ${15 + audioIntensity * 20}px rgba(204, 0, 0, ${0.3 + audioIntensity * 0.3})`,
              }}
            >
              [ EVENTS ]
            </button>
            {/* Secondary CTA - Merch (ghost style) */}
            <button
              onClick={() => navigateTo('/merch')}
              className="font-mono text-sm tracking-widest bg-black/70 border border-arterial/50 px-6 py-4 min-h-[44px] hover:border-arterial hover:bg-arterial/10 active:scale-95 active:bg-arterial/20 transition-all"
              style={{
                boxShadow: `0 0 ${10 + audioIntensity * 15}px rgba(204, 0, 0, ${0.2 + audioIntensity * 0.2})`,
              }}
            >
              [ MERCH ]
            </button>
          </div>
        )}

        {/* Scroll indicator - hidden on mobile (no depth scrolling) */}
        {!isMobile && heroProgress < 0.85 && (
          <button
            type="button"
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto"
          >
            <span className="font-mono text-sm text-white tracking-[0.2em] border border-white/40 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors">
              {HERO.scrollCta}
            </span>
            <div className="w-px h-12 bg-white/60 relative overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-white animate-pulse"
                style={{ height: '30%' }}
              />
            </div>
          </button>
        )}
      </div>

      {/* Depth indicator - shows how deep you've gone (hidden on mobile) */}
      {!isMobile && heroProgress > 0.02 && (
        <div className="fixed top-1/2 right-6 -translate-y-1/2 z-30 pointer-events-none">
          <div className="font-mono text-[10px] text-white/50 tracking-widest">
            <span className="opacity-50">DEPTH</span>
            <span className="ml-2 text-arterial">{Math.round(heroProgress * 100)}%</span>
          </div>
        </div>
      )}
    </section>
  )
}
