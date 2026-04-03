'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { getScrollProgress } from '@/hooks/useScrollStore'
import { getBass } from '@/hooks/useAudioEngine'
import clsx from 'clsx'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
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

  // Track scroll progress for UI updates
  useEffect(() => {
    const handleScroll = () => {
      const progress = getScrollProgress()
      setScrollProgress(progress)

      // Hide hero content after user scrolls past hero section
      const section = sectionRef.current
      if (section) {
        const rect = section.getBoundingClientRect()
        setIsVisible(rect.bottom > 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Calculate hero progress (0-1 through the hero section)
  // On mobile, disable depth scrolling by keeping progress at 0
  const heroProgress = isMobile ? 0 : Math.min(1, scrollProgress * 5)

  // Chromatic aberration intensity based on mouse distance and audio
  const chromaticOffset = 2 + mouseDistance * 6 + audioIntensity * 8

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: isMobile ? '100vh' : '500vh' }}
    >
      {/* Glitch tear line */}
      <div className="glitch-tear" />

      {/* Fixed hero content - glass overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Glass container */}
        <div
          className="relative p-12 md:p-20"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transform: `scale(${1 + heroProgress * 0.1}) translateY(${heroProgress * -20}px)`,
            opacity: 1 - heroProgress * 0.8,
          }}
        >
          {/* Corner brackets - pulse with audio */}
          <div
            className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-arterial/50 transition-all duration-75"
            style={{ borderColor: `rgba(204, 0, 0, ${0.5 + audioIntensity * 0.5})` }}
          />
          <div
            className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-arterial/50 transition-all duration-75"
            style={{ borderColor: `rgba(204, 0, 0, ${0.5 + audioIntensity * 0.5})` }}
          />
          <div
            className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-arterial/50 transition-all duration-75"
            style={{ borderColor: `rgba(204, 0, 0, ${0.5 + audioIntensity * 0.5})` }}
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-arterial/50 transition-all duration-75"
            style={{ borderColor: `rgba(204, 0, 0, ${0.5 + audioIntensity * 0.5})` }}
          />

          {/* Main title - Blackletter with heavy chromatic */}
          <h1 className="font-ritual text-6xl md:text-8xl lg:text-9xl text-white text-center tracking-wider relative">
            <span
              ref={titleRef}
              className="relative inline-block text-jitter"
              data-text="KAMIKAZE"
              style={{
                textShadow: `
                  ${-chromaticOffset}px 0 0 rgba(255, 0, 0, 0.7),
                  ${chromaticOffset}px 0 0 rgba(0, 255, 255, 0.7),
                  0 0 ${20 + audioIntensity * 40}px rgba(204, 0, 0, ${0.3 + audioIntensity * 0.5})
                `,
              }}
            >
              KAMIKAZE
            </span>
          </h1>

          {/* Subtitle - Monospace */}
          <p
            className="font-mono text-xs md:text-sm text-white/70 text-center mt-6 tracking-[0.3em] transition-all duration-75"
            style={{
              textShadow: audioIntensity > 0.3 ? '0 0 10px rgba(204, 0, 0, 0.5)' : 'none',
            }}
          >
            UNDERGROUND WILL NEVER DIE
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

        {/* Scroll indicator - hidden on mobile (no depth scrolling) */}
        {!isMobile && heroProgress < 0.8 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-[10px] text-white/50 tracking-widest animate-pulse">
                DESCEND
              </span>
              <div className="w-px h-16 bg-white/20 relative overflow-hidden">
                <div
                  className="w-full bg-arterial transition-all duration-100"
                  style={{ height: `${heroProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Depth indicator - shows how deep you've gone (hidden on mobile) */}
      {!isMobile && (
        <div className="fixed top-1/2 right-6 -translate-y-1/2 z-30">
          <div className="font-mono text-[10px] text-white/50 tracking-widest writing-mode-vertical">
            <span className="opacity-50">DEPTH</span>
            <span className="ml-2 text-arterial">{Math.round(heroProgress * 100)}%</span>
          </div>
        </div>
      )}
    </section>
  )
}
