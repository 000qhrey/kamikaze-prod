'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Artist } from '@/data/artists'
import { useTransition } from '@/providers/TransitionProvider'
import clsx from 'clsx'

interface ArtistTileProps {
  artist: Artist
  index: number
}

export function ArtistTile({ artist, index }: ArtistTileProps) {
  const { navigateTo } = useTransition()
  const [isHovered, setIsHovered] = useState(false)

  // Alternate skew for broken grid
  const skewAngle = index % 2 === 0 ? -2 : 2

  return (
    <article
      className={clsx(
        'relative cursor-pointer group',
        'transition-transform duration-500'
      )}
      style={{
        transform: `rotate(${skewAngle}deg)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigateTo(`/artists/${artist.slug}`)}
    >
      {/* Sigil frame - irregular border */}
      <div
        className="relative"
        style={{
          clipPath: `polygon(
            0% 5%, 5% 0%, 15% 3%, 25% 0%, 35% 2%, 45% 0%, 55% 1%, 65% 0%,
            75% 3%, 85% 0%, 95% 2%, 100% 5%,
            100% 95%, 95% 100%, 85% 97%, 75% 100%, 65% 98%, 55% 100%, 45% 99%, 35% 100%,
            25% 97%, 15% 100%, 5% 98%, 0% 95%
          )`,
        }}
      >
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-void">
          {/* Artist photo with blown-out effect on hover */}
          <div
            className={clsx(
              'absolute inset-0 transition-all duration-700',
              isHovered ? 'scale-110' : 'scale-100'
            )}
            style={{
              filter: isHovered
                ? 'brightness(1.5) contrast(2) grayscale(0)'
                : 'brightness(0.7) contrast(1.2) grayscale(1)',
              transition: 'filter 0.7s ease, transform 0.7s ease',
            }}
          >
            <Image
              src={artist.photo}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Scanlines */}
          <div
            className={clsx(
              'absolute inset-0 pointer-events-none transition-opacity duration-500',
              isHovered ? 'opacity-30' : 'opacity-50'
            )}
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.4) 2px,
                rgba(0, 0, 0, 0.4) 4px
              )`,
            }}
          />

          {/* Red bleed on hover */}
          <div
            className={clsx(
              'absolute inset-0 bg-arterial/30 mix-blend-multiply transition-opacity duration-500',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Glitch lines on hover */}
          {isHovered && (
            <>
              <div
                className="absolute left-0 right-0 h-1 bg-arterial/60"
                style={{ top: '20%' }}
              />
              <div
                className="absolute left-0 right-0 h-px bg-white/40"
                style={{ top: '45%' }}
              />
              <div
                className="absolute left-0 right-0 h-1 bg-arterial/40"
                style={{ top: '75%' }}
              />
            </>
          )}

          {/* Index number - industrial */}
          <div
            className={clsx(
              'absolute top-3 left-3 font-mono text-xs transition-all duration-300',
              isHovered ? 'text-arterial' : 'text-white/30'
            )}
          >
            [{String(index + 1).padStart(2, '0')}]
          </div>

          {/* Corner sigil marks */}
          <svg
            className={clsx(
              'absolute top-2 right-2 w-8 h-8 transition-all duration-500',
              isHovered ? 'opacity-100 text-arterial' : 'opacity-30 text-white'
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" />
          </svg>
        </div>
      </div>

      {/* Name - large monospace terminal style */}
      <div
        className={clsx(
          'mt-4 transition-all duration-300',
          isHovered ? 'translate-x-2' : 'translate-x-0'
        )}
      >
        <h3
          className={clsx(
            'font-mono text-xl md:text-2xl tracking-widest uppercase',
            'transition-colors duration-300',
            isHovered ? 'text-arterial' : 'text-white'
          )}
          style={{
            textShadow: isHovered ? '0 0 20px rgba(204, 0, 0, 0.5)' : 'none',
          }}
        >
          {artist.name}
        </h3>

        {/* Location with terminal prefix */}
        <p
          className={clsx(
            'font-mono text-sm mt-1 transition-colors duration-300',
            isHovered ? 'text-grey-mid' : 'text-grey-dark'
          )}
        >
          <span className="text-arterial/60">{'>'}</span> {artist.location}
        </p>
      </div>

      {/* Bottom border accent */}
      <div
        className={clsx(
          'h-px mt-4 transition-all duration-500',
          isHovered ? 'bg-arterial w-full' : 'bg-grey-dark/30 w-1/2'
        )}
      />
    </article>
  )
}
