'use client'

import { useState, useEffect } from 'react'
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
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const [sliceOffsets, setSliceOffsets] = useState<number[]>([0, 0, 0, 0, 0])

  // Animate glitch on hover
  useEffect(() => {
    if (!isHovered) {
      setGlitchOffset({ x: 0, y: 0 })
      setSliceOffsets([0, 0, 0, 0, 0])
      return
    }

    const interval = setInterval(() => {
      // Random RGB split offset
      setGlitchOffset({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4,
      })

      // Random slice displacements
      setSliceOffsets([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 18,
      ])
    }, 80)

    return () => clearInterval(interval)
  }, [isHovered])

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
          {/* RGB Split layers - Red channel */}
          <div
            className={clsx(
              'absolute inset-0 transition-opacity duration-300',
              isHovered ? 'opacity-60' : 'opacity-0'
            )}
            style={{
              transform: `translate(${glitchOffset.x - 4}px, ${glitchOffset.y}px)`,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src={getAssetPath(artist.photo)}
              alt=""
              fill
              className="object-cover"
              style={{ filter: 'grayscale(1) brightness(1.2)', opacity: 0.7 }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-red-500 mix-blend-multiply" />
          </div>

          {/* RGB Split - Cyan channel */}
          <div
            className={clsx(
              'absolute inset-0 transition-opacity duration-300',
              isHovered ? 'opacity-50' : 'opacity-0'
            )}
            style={{
              transform: `translate(${glitchOffset.x + 4}px, ${-glitchOffset.y}px)`,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src={getAssetPath(artist.photo)}
              alt=""
              fill
              className="object-cover"
              style={{ filter: 'grayscale(1) brightness(1.2)', opacity: 0.7 }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-cyan-500 mix-blend-multiply" />
          </div>

          {/* Main image with glitch slices */}
          <div
            className={clsx(
              'absolute inset-0 transition-all duration-700',
              isHovered ? 'scale-105' : 'scale-100'
            )}
            style={{
              filter: isHovered
                ? 'brightness(1.1) contrast(1.15) grayscale(0)'
                : 'brightness(0.95) contrast(1.1) grayscale(1)',
            }}
          >
            {/* Slice 1 */}
            <div
              className="absolute w-full overflow-hidden"
              style={{
                top: '0%',
                height: '20%',
                transform: isHovered ? `translateX(${sliceOffsets[0]}px)` : 'none',
              }}
            >
              <Image
                src={getAssetPath(artist.photo)}
                alt={artist.name}
                fill
                className="object-cover"
                style={{ objectPosition: 'center top' }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            {/* Slice 2 */}
            <div
              className="absolute w-full overflow-hidden"
              style={{
                top: '20%',
                height: '20%',
                transform: isHovered ? `translateX(${sliceOffsets[1]}px)` : 'none',
              }}
            >
              <div className="relative w-full h-[500%]" style={{ top: '-100%' }}>
                <Image
                  src={getAssetPath(artist.photo)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            {/* Slice 3 */}
            <div
              className="absolute w-full overflow-hidden"
              style={{
                top: '40%',
                height: '20%',
                transform: isHovered ? `translateX(${sliceOffsets[2]}px)` : 'none',
              }}
            >
              <div className="relative w-full h-[500%]" style={{ top: '-200%' }}>
                <Image
                  src={getAssetPath(artist.photo)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            {/* Slice 4 */}
            <div
              className="absolute w-full overflow-hidden"
              style={{
                top: '60%',
                height: '20%',
                transform: isHovered ? `translateX(${sliceOffsets[3]}px)` : 'none',
              }}
            >
              <div className="relative w-full h-[500%]" style={{ top: '-300%' }}>
                <Image
                  src={getAssetPath(artist.photo)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            {/* Slice 5 */}
            <div
              className="absolute w-full overflow-hidden"
              style={{
                top: '80%',
                height: '20%',
                transform: isHovered ? `translateX(${sliceOffsets[4]}px)` : 'none',
              }}
            >
              <div className="relative w-full h-[500%]" style={{ top: '-400%' }}>
                <Image
                  src={getAssetPath(artist.photo)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>
          </div>

          {/* Scanlines */}
          <div
            className={clsx(
              'absolute inset-0 pointer-events-none transition-opacity duration-500',
              isHovered ? 'opacity-40' : 'opacity-60'
            )}
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

          {/* Red bleed on hover */}
          <div
            className={clsx(
              'absolute inset-0 bg-arterial/20 mix-blend-overlay transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Glitch noise lines */}
          {isHovered && (
            <>
              <div
                className="absolute left-0 right-0 h-[2px] bg-white/60"
                style={{ top: `${20 + Math.random() * 10}%` }}
              />
              <div
                className="absolute left-0 right-0 h-[1px] bg-arterial/80"
                style={{ top: `${50 + Math.random() * 10}%` }}
              />
              <div
                className="absolute left-0 right-0 h-[2px] bg-cyan-400/50"
                style={{ top: `${75 + Math.random() * 10}%` }}
              />
            </>
          )}

          {/* Index number */}
          <div
            className={clsx(
              'absolute top-3 left-3 font-mono text-xs transition-all duration-300 z-10',
              isHovered ? 'text-arterial' : 'text-white/30'
            )}
          >
            [{String(index + 1).padStart(2, '0')}]
          </div>
        </div>
      </div>

      {/* Name */}
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
            textShadow: isHovered
              ? `${glitchOffset.x}px 0 rgba(0, 255, 255, 0.5), ${-glitchOffset.x}px 0 rgba(255, 0, 0, 0.5)`
              : 'none',
          }}
        >
          {artist.name}
        </h3>

        <p
          className={clsx(
            'font-mono text-sm mt-1 transition-colors duration-300',
            isHovered ? 'text-white/70' : 'text-white/50'
          )}
        >
          <span className="text-arterial/60">{'>'}</span> {artist.location}
        </p>
      </div>

      {/* Bottom border */}
      <div
        className={clsx(
          'h-px mt-4 transition-all duration-500',
          isHovered ? 'bg-arterial w-full' : 'bg-white/20/30 w-1/2'
        )}
      />
    </article>
  )
}
