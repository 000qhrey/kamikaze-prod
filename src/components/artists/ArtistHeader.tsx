'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Artist } from '@/data/artists'
import clsx from 'clsx'

interface ArtistHeaderProps {
  artist: Artist
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  const [scrollY, setScrollY] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Generate serial number from artist name
  const serialNumber = artist.name
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
    .join('')
    .slice(0, 8)

  return (
    <header
      ref={headerRef}
      className="relative h-screen min-h-[600px] overflow-hidden"
    >
      {/* Background - artist photo with extreme treatment */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`, // Slower parallax
        }}
      >
        <Image
          src={artist.photo}
          alt={artist.name}
          fill
          className="object-cover"
          style={{
            filter: 'brightness(0.3) contrast(1.5) grayscale(1)',
          }}
          priority
        />
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
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.5) 2px,
            rgba(0, 0, 0, 0.5) 4px
          )`,
        }}
      />

      {/* MASSIVE name - outline only, fills viewport */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`, // Even slower for depth
        }}
      >
        <h1
          className="font-display text-[25vw] md:text-[20vw] leading-none tracking-tighter whitespace-nowrap"
          style={{
            WebkitTextStroke: '2px rgba(204, 0, 0, 0.4)',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 100px rgba(204, 0, 0, 0.2)',
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
        <div className="font-mono text-[10px] text-grey-dark tracking-widest mb-1">
          UNIT_ID
        </div>
        <div className="font-mono text-sm text-arterial/60 tracking-widest">
          0x{serialNumber}
        </div>
      </div>

      {/* Location - stamped serial number style */}
      <div className="absolute top-24 left-6">
        <div className="font-mono text-[10px] text-grey-dark tracking-widest mb-1">
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
          {/* Name - solid, large */}
          <div>
            <div className="font-mono text-xs text-arterial tracking-widest mb-2">
              {'>>> ENTITY.LOADED'}
            </div>
            <h2 className="font-display text-4xl md:text-6xl tracking-wider">
              {artist.name}
            </h2>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] text-grey-dark tracking-widest">
              SCROLL
            </span>
            <div className="w-px h-16 bg-grey-dark relative overflow-hidden">
              <div className="absolute top-0 w-full h-4 bg-arterial animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Corner marks */}
      <div className="absolute top-20 left-6 w-8 h-8 border-l-2 border-t-2 border-grey-dark/30" />
      <div className="absolute top-20 right-6 w-8 h-8 border-r-2 border-t-2 border-grey-dark/30" />
    </header>
  )
}
