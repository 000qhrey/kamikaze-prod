'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Artist } from '@/data/artists'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

interface ArtistHeaderProps {
  artist: Artist
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isInHeader, setIsInHeader] = useState(false)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const headerRef = useRef<HTMLElement>(null)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track mouse position within header
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!headerRef.current) return
    const rect = headerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }, [])

  // Continuous glitch animation when mouse is in header
  useEffect(() => {
    if (!isInHeader) {
      setGlitchOffset({ x: 0, y: 0 })
      return
    }

    const interval = setInterval(() => {
      // Intensity based on distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(mousePos.x - 0.5, 2) + Math.pow(mousePos.y - 0.5, 2)
      )
      const intensity = Math.min(distFromCenter * 2, 1)

      setGlitchOffset({
        x: (Math.random() - 0.5) * 12 * intensity,
        y: (Math.random() - 0.5) * 6 * intensity,
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isInHeader, mousePos])

  // Generate serial number from artist name
  const serialNumber = artist.name
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
    .join('')
    .slice(0, 8)

  // Calculate distortion based on cursor position
  const distortionX = (mousePos.x - 0.5) * 30
  const distortionY = (mousePos.y - 0.5) * 20

  return (
    <header
      ref={headerRef}
      className="relative h-screen min-h-[600px] overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsInHeader(true)}
      onMouseLeave={() => setIsInHeader(false)}
    >
      {/* Background - artist photo with cursor-based distortion */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        {/* RGB Split - Red channel (follows cursor) */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: isInHeader ? 0.4 : 0,
            transform: `translate(${distortionX + glitchOffset.x - 8}px, ${distortionY + glitchOffset.y}px)`,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src={getAssetPath(artist.photo)}
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'grayscale(1) brightness(1.2)', opacity: 0.7 }}
          />
          <div className="absolute inset-0 bg-red-600 mix-blend-multiply" />
        </div>

        {/* RGB Split - Cyan channel (opposite of cursor) */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: isInHeader ? 0.35 : 0,
            transform: `translate(${-distortionX + glitchOffset.x + 8}px, ${-distortionY - glitchOffset.y}px)`,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src={getAssetPath(artist.photo)}
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'grayscale(1) brightness(1.2)', opacity: 0.7 }}
          />
          <div className="absolute inset-0 bg-cyan-500 mix-blend-multiply" />
        </div>

        {/* Main image */}
        <Image
          src={getAssetPath(artist.photo)}
          alt={artist.name}
          fill
          className="object-cover transition-all duration-200"
          style={{
            filter: isInHeader
              ? 'brightness(0.9) contrast(1.15) grayscale(0.15)'
              : 'brightness(0.85) contrast(1.1) grayscale(0.2)',
            transform: isInHeader ? `scale(1.02)` : 'scale(1)',
          }}
          priority
        />

        {/* Glitch lines that follow cursor */}
        {isInHeader && (
          <>
            <div
              className="absolute left-0 right-0 h-[2px] bg-white/40 pointer-events-none"
              style={{ top: `${mousePos.y * 100 - 5 + glitchOffset.y}%` }}
            />
            <div
              className="absolute left-0 right-0 h-[1px] bg-arterial/60 pointer-events-none"
              style={{ top: `${mousePos.y * 100 + glitchOffset.y}%` }}
            />
            <div
              className="absolute left-0 right-0 h-[2px] bg-cyan-400/40 pointer-events-none"
              style={{ top: `${mousePos.y * 100 + 5 - glitchOffset.y}%` }}
            />
          </>
        )}
      </div>

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.35) 2px,
            rgba(0, 0, 0, 0.35) 4px
          )`,
        }}
      />

      {/* MASSIVE name - outline only, fills viewport, with cursor distortion */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        {/* Red layer - follows cursor */}
        <h1
          className="absolute font-display text-[25vw] md:text-[20vw] leading-none tracking-tighter whitespace-nowrap transition-opacity duration-200"
          style={{
            WebkitTextStroke: '2px rgba(255, 0, 0, 0.5)',
            WebkitTextFillColor: 'transparent',
            opacity: isInHeader ? 0.6 : 0,
            transform: `translate(${distortionX * 0.5 + glitchOffset.x}px, ${distortionY * 0.3 + glitchOffset.y}px)`,
          }}
        >
          {artist.name}
        </h1>

        {/* Cyan layer - opposite of cursor */}
        <h1
          className="absolute font-display text-[25vw] md:text-[20vw] leading-none tracking-tighter whitespace-nowrap transition-opacity duration-200"
          style={{
            WebkitTextStroke: '2px rgba(0, 255, 255, 0.4)',
            WebkitTextFillColor: 'transparent',
            opacity: isInHeader ? 0.5 : 0,
            transform: `translate(${-distortionX * 0.5 - glitchOffset.x}px, ${-distortionY * 0.3 - glitchOffset.y}px)`,
          }}
        >
          {artist.name}
        </h1>

        {/* Main layer */}
        <h1
          className="font-display text-[25vw] md:text-[20vw] leading-none tracking-tighter whitespace-nowrap"
          style={{
            WebkitTextStroke: isInHeader ? '2px rgba(204, 0, 0, 0.6)' : '2px rgba(204, 0, 0, 0.4)',
            WebkitTextFillColor: 'transparent',
            textShadow: isInHeader
              ? `0 0 100px rgba(204, 0, 0, 0.4), ${glitchOffset.x}px 0 rgba(0, 255, 255, 0.3), ${-glitchOffset.x}px 0 rgba(255, 0, 0, 0.3)`
              : '0 0 100px rgba(204, 0, 0, 0.2)',
          }}
        >
          {artist.name}
        </h1>
      </div>

      {/* Vertical name on left edge */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: `translateY(calc(-50% + ${scrollY * 0.15}px)) rotate(180deg)`,
        }}
      >
        <span className="font-mono text-xs tracking-[0.5em] text-white/20">
          {artist.name}
        </span>
      </div>

      {/* Serial number badge - top right */}
      <div className="absolute top-24 right-6 text-right">
        <div className="font-mono text-[10px] text-white/50 tracking-widest mb-1">
          UNIT_ID
        </div>
        <div className="font-mono text-sm text-arterial/60 tracking-widest">
          0x{serialNumber}
        </div>
      </div>

      {/* Location - stamped serial number style */}
      <div className="absolute top-24 left-6">
        <div className="font-mono text-[10px] text-white/50 tracking-widest mb-1">
          ORIGIN_POINT
        </div>
        <div
          className="font-mono text-lg text-white/40 tracking-widest uppercase"
          style={{
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}
        >
          [{artist.location}]
        </div>
      </div>

      {/* Bottom gradient with solid name */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-void via-void/80 to-transparent" />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          {/* Name - solid, large with cursor-based glitch */}
          <div>
            <div className="font-mono text-xs text-arterial tracking-widest mb-2">
              {'>>> ENTITY.LOADED'}
            </div>
            <h2
              className="font-display text-4xl md:text-6xl tracking-wider text-white"
              style={{
                textShadow: isInHeader
                  ? `${glitchOffset.x}px 0 rgba(0, 255, 255, 0.5), ${-glitchOffset.x}px 0 rgba(255, 0, 0, 0.5)`
                  : 'none',
              }}
            >
              {artist.name}
            </h2>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] text-white/50 tracking-widest">
              SCROLL
            </span>
            <div className="w-px h-16 bg-white/30 relative overflow-hidden">
              <div className="absolute top-0 w-full h-4 bg-arterial animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Corner marks */}
      <div className="absolute top-20 left-6 w-8 h-8 border-l-2 border-t-2 border-white/30/30" />
      <div className="absolute top-20 right-6 w-8 h-8 border-r-2 border-t-2 border-white/30/30" />
    </header>
  )
}
