'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { getBass } from '@/hooks/useAudioEngine'
import clsx from 'clsx'
import { HERO } from '@/data/siteCopy'
import { MobileQuickNav } from '@/components/layout/MobileQuickNav'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [heroProgress, setHeroProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [mouseDistance, setMouseDistance] = useState(0)
  const [audioIntensity, setAudioIntensity] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile to disable depth scrolling
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track scroll — depth dissolve on desktop only; mobile uses native scroll
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      setIsVisible(rect.bottom > 0)

      if (isMobile) return

      const scrollable = section.offsetHeight - window.innerHeight
      const progress = scrollable > 0
        ? Math.max(0, Math.min(1, -rect.top / scrollable))
        : 0

      setHeroProgress(progress)
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
    if (isMobile) return

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove, isMobile])

  // Audio reactive visuals — desktop only
  useEffect(() => {
    if (isMobile) return

    let animFrame: number

    const updateAudio = () => {
      const bass = getBass()
      setAudioIntensity(bass)
      animFrame = requestAnimationFrame(updateAudio)
    }

    updateAudio()
    return () => cancelAnimationFrame(animFrame)
  }, [isMobile])

  // Chromatic aberration intensity based on mouse distance and audio
  const chromaticOffset = 2 + mouseDistance * 6 + audioIntensity * 8
  const dissolveOpacity = Math.max(0, 1 - heroProgress * 1.1)
  const dissolveBlur = heroProgress * 10
  const dissolveScale = 1 + heroProgress * 0.12
  const dissolveLift = heroProgress * -48

  // On mobile: absolute (scrolls away). On desktop: fixed (depth dissolve).
  const heroPosition = isMobile ? 'absolute' : 'fixed'
  const mobileChromatic = isMobile ? 1 : chromaticOffset

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: isMobile ? '100svh' : '200vh' }}
    >
      {/* Glitch tear line */}
      <div className="glitch-tear" />

      {/* Fixed hero content */}
      <div
        className={clsx(
          heroPosition,
          'inset-0 z-20 flex flex-col items-center justify-center px-4 transition-opacity duration-500',
          !isMobile && isVisible && dissolveOpacity > 0.05 ? 'opacity-100' : '',
          !isMobile && (!isVisible || dissolveOpacity <= 0.05) ? 'opacity-0 pointer-events-none' : '',
          isMobile ? 'opacity-100' : ''
        )}
      >
        <div
          className="relative w-full mx-auto flex flex-col items-center justify-center text-center will-change-transform px-2"
          style={{
            transform: isMobile ? undefined : `scale(${dissolveScale}) translateY(${dissolveLift}px)`,
            opacity: isMobile ? 1 : dissolveOpacity,
            filter: isMobile ? undefined : `blur(${dissolveBlur}px)`,
          }}
        >
          <h1
            ref={titleRef}
            className={clsx(
              'font-ritual text-6xl md:text-8xl lg:text-9xl text-white relative m-0 text-center normal-case inline-block',
              !isMobile && mouseDistance > 0.15 && 'text-jitter'
            )}
            style={{
              letterSpacing: '0.06em',
              visibility: !isMobile && dissolveOpacity < 0.05 ? 'hidden' : 'visible',
              textShadow: `
                  ${-mobileChromatic}px 0 0 rgba(255, 0, 0, ${0.7 * (isMobile ? 1 : dissolveOpacity)}),
                  ${mobileChromatic}px 0 0 rgba(0, 255, 255, ${0.7 * (isMobile ? 1 : dissolveOpacity)}),
                  0 0 ${20 + audioIntensity * 40}px rgba(204, 0, 0, ${(0.3 + audioIntensity * 0.5) * (isMobile ? 1 : dissolveOpacity)})
                `,
            }}
          >
            Kamikaze
          </h1>

          {/* Subtitle - Monospace */}
          <p className="font-mono text-xs md:text-sm text-white/70 mt-6 tracking-[0.2em] md:tracking-[0.3em] max-w-md">
            {HERO.tagline}
          </p>

          <p className="font-mono text-sm md:text-base text-white/90 mt-6 md:mt-8 max-w-md leading-relaxed">
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

        {/* Mobile quick nav — compact pill strip above audio bar */}
        {isMobile && (
          <div
            className="absolute left-0 right-0 z-30 px-4 pointer-events-none"
            style={{ bottom: 'calc(3.25rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <MobileQuickNav className="pointer-events-auto" />
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
