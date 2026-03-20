'use client'

import { useEffect, useState } from 'react'

const MANIFESTO_PHRASES = [
  'WE MAKE RUPTURES',
  'CONTROLLED COLLAPSE',
  'EVERY BEAT IS A HEARTBEAT',
  'THIS IS CONGREGATION',
  'UNDERGROUND NEVER DIES',
]

interface ManifestoTextureProps {
  // Which phrase to display (cycles if not specified)
  phrase?: string
  // Vertical offset for staggering multiple instances
  offsetY?: number
  // Scroll speed multiplier (lower = slower parallax)
  parallaxSpeed?: number
}

export function ManifestoTexture({
  phrase,
  offsetY = 0,
  parallaxSpeed = 0.15,
}: ManifestoTextureProps) {
  const [scrollY, setScrollY] = useState(0)
  const [phraseIndex, setPhrase] = useState(0)

  // Track scroll for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cycle phrases if none specified
  useEffect(() => {
    if (phrase) return

    const interval = setInterval(() => {
      setPhrase((prev) => (prev + 1) % MANIFESTO_PHRASES.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [phrase])

  const displayText = phrase || MANIFESTO_PHRASES[phraseIndex]
  const parallaxOffset = scrollY * parallaxSpeed

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        transform: `translateY(${offsetY}px)`,
      }}
    >
      {/* Main huge text */}
      <div
        className="absolute whitespace-nowrap font-display text-white/[0.04] select-none"
        style={{
          fontSize: 'clamp(150px, 25vw, 350px)',
          lineHeight: 1,
          transform: `translateY(${parallaxOffset}px) translateX(-10%)`,
          top: '20%',
        }}
      >
        {displayText}
      </div>

      {/* Secondary offset text for depth */}
      <div
        className="absolute whitespace-nowrap font-display text-arterial/[0.02] select-none"
        style={{
          fontSize: 'clamp(100px, 18vw, 250px)',
          lineHeight: 1,
          transform: `translateY(${parallaxOffset * 0.7}px) translateX(5%)`,
          top: '55%',
        }}
      >
        {displayText}
      </div>

      {/* Vertical text on edge */}
      <div
        className="absolute font-mono text-white/[0.03] select-none"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: 'clamp(60px, 8vw, 100px)',
          right: '5%',
          top: '10%',
          transform: `translateY(${parallaxOffset * 0.5}px)`,
        }}
      >
        {displayText.split(' ').slice(0, 2).join(' ')}
      </div>
    </div>
  )
}
