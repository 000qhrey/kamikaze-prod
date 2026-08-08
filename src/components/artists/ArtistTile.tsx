'use client'

/**
 * Compact square roster tile — photo-forward, grayscale → color on hover.
 */

import { useState } from 'react'
import Image from 'next/image'
import { Artist } from '@/data/artists'
import { useTransition } from '@/providers/TransitionProvider'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

interface ArtistTileProps {
  artist: Artist
  index: number
}

export function ArtistTile({ artist, index }: ArtistTileProps) {
  const { navigateTo } = useTransition()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      className={clsx(
        'group relative w-full text-left',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-arterial'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={() => navigateTo(`/artists/${artist.slug}`)}
      aria-label={`Open ${artist.name}`}
    >
      <div className="relative aspect-square overflow-hidden border border-white/15 bg-void transition-[border-color] duration-300 group-hover:border-arterial/60">
        <Image
          src={getAssetPath(artist.photo)}
          alt={artist.name}
          fill
          className={clsx(
            'object-cover object-center transition-[filter,transform] duration-500',
            isHovered
              ? 'scale-105 brightness-110 contrast-110 grayscale-0'
              : 'scale-100 brightness-95 contrast-110 grayscale'
          )}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
        />

        {/* Light scanlines — photo stays primary */}
        <div
          className={clsx(
            'pointer-events-none absolute inset-0 transition-opacity duration-300',
            isHovered ? 'opacity-20' : 'opacity-35'
          )}
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.45) 2px,
              rgba(0, 0, 0, 0.45) 4px
            )`,
          }}
          aria-hidden
        />

        <div
          className={clsx(
            'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-90' : 'opacity-70'
          )}
          aria-hidden
        />

        <span
          className={clsx(
            'absolute left-1.5 top-1.5 font-mono text-[8px] tracking-wider transition-colors duration-300',
            isHovered ? 'text-arterial' : 'text-white/35'
          )}
        >
          [{String(index + 1).padStart(2, '0')}]
        </span>

        <div className="absolute inset-x-0 bottom-0 p-2">
          <h3
            className={clsx(
              'font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase truncate transition-colors duration-300',
              isHovered ? 'text-arterial' : 'text-white'
            )}
          >
            {artist.name}
          </h3>
        </div>
      </div>
    </button>
  )
}
