'use client'

import { useEffect, useState } from 'react'
import { Artist } from '@/data/artists'
import clsx from 'clsx'

interface ArtistPageContentProps {
  artist: Artist
}

// Generate random metadata for mixes (simulated)
function generateMixMeta(title: string) {
  const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return {
    size: `${(hash % 200) + 80}MB`,
    bpm: `${(hash % 40) + 130}`,
    duration: `${Math.floor((hash % 60) + 45)}:${String(hash % 60).padStart(2, '0')}`,
  }
}

export function ArtistPageContent({ artist }: ArtistPageContentProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Split bio - first part is regular, last quoted part is the hero
  const bioParts = artist.bio.split('\n\n').filter(Boolean)
  const regularBio = bioParts.slice(0, -1)
  const heroQuote = bioParts[bioParts.length - 1]

  return (
    <div className="relative max-w-6xl mx-auto px-6 pb-32">
      {/* Bio section - pushed to the right with left border */}
      <section className="mb-24 md:ml-[20%]">
        <div className="flex items-start gap-4 mb-8">
          <span className="font-mono text-xs text-arterial tracking-widest">
            [BIO]
          </span>
          <div className="flex-1 h-px bg-grey-dark/30 mt-2" />
        </div>

        <div className="border-l-2 border-grey-dark/40 pl-6 md:pl-8">
          <div className="space-y-6 max-w-xl">
            {regularBio.map((paragraph, index) => (
              <p
                key={index}
                className="font-mono text-sm md:text-base text-grey-mid leading-relaxed"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 600) * 0.02 * (index + 1))}px)`,
                }}
              >
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Hero quote - chromatic aberration effect */}
      {heroQuote && heroQuote.includes('"') && (
        <section className="mb-32 relative">
          <div className="relative">
            {/* Red layer - offset left */}
            <p
              className="font-display text-2xl md:text-4xl leading-tight text-arterial/30 absolute"
              style={{
                transform: 'translate(-3px, -2px)',
              }}
            >
              {heroQuote.trim()}
            </p>

            {/* Blue layer - offset right */}
            <p
              className="font-display text-2xl md:text-4xl leading-tight text-blue-500/20 absolute"
              style={{
                transform: 'translate(3px, 2px)',
              }}
            >
              {heroQuote.trim()}
            </p>

            {/* Main white layer */}
            <p className="font-display text-2xl md:text-4xl leading-tight text-white relative">
              {heroQuote.trim()}
            </p>
          </div>

          {/* Attribution */}
          <div className="mt-6 font-mono text-xs text-grey-dark">
            — {artist.name.toUpperCase()}
          </div>
        </section>
      )}

      {/* Mixes - hardware interface aesthetic */}
      {artist.mixes.length > 0 && (
        <section className="mb-24">
          <div className="flex items-start gap-4 mb-8">
            <span className="font-mono text-xs text-arterial tracking-widest">
              [TRANSMISSIONS]
            </span>
            <div className="flex-1 h-px bg-grey-dark/30 mt-2" />
          </div>

          <div className="space-y-4">
            {artist.mixes.map((mix, index) => {
              const meta = generateMixMeta(mix.title)
              return (
                <a
                  key={index}
                  href={mix.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div
                    className={clsx(
                      'relative p-6 bg-void/50 border border-grey-dark/30',
                      'transition-all duration-300',
                      'hover:border-arterial/50 hover:bg-void/80'
                    )}
                  >
                    {/* Top row - index and title */}
                    <div className="flex items-start gap-4 mb-4">
                      <span className="font-mono text-xs text-grey-dark">
                        [{String(index + 1).padStart(2, '0')}]
                      </span>
                      <h3 className="font-mono text-lg md:text-xl text-white group-hover:text-arterial transition-colors">
                        {mix.title}
                      </h3>
                    </div>

                    {/* Metadata row - rack mount style */}
                    <div className="flex flex-wrap gap-6 font-mono text-xs">
                      <div>
                        <span className="text-grey-dark">SIZE:</span>
                        <span className="text-grey-mid ml-2">{meta.size}</span>
                      </div>
                      <div>
                        <span className="text-grey-dark">BPM:</span>
                        <span className="text-grey-mid ml-2">{meta.bpm}</span>
                      </div>
                      <div>
                        <span className="text-grey-dark">DUR:</span>
                        <span className="text-grey-mid ml-2">{meta.duration}</span>
                      </div>
                      <div>
                        <span className="text-grey-dark">SRC:</span>
                        <span className="text-arterial/60 ml-2 uppercase">
                          {mix.platform}
                        </span>
                      </div>
                      <div>
                        <span className="text-grey-dark">STATUS:</span>
                        <span className="text-signal ml-2">DECRYPTED</span>
                      </div>
                    </div>

                    {/* Progress bar - simulated playback */}
                    <div className="mt-4 h-1 bg-grey-dark/20 overflow-hidden">
                      <div
                        className={clsx(
                          'h-full bg-arterial/40 transition-all duration-700',
                          'group-hover:bg-arterial'
                        )}
                        style={{
                          width: `${30 + (index * 20)}%`,
                        }}
                      />
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-grey-dark/30 group-hover:border-arterial/50 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-grey-dark/30 group-hover:border-arterial/50 transition-colors" />
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* Socials - terminal style */}
      <section>
        <div className="flex items-start gap-4 mb-8">
          <span className="font-mono text-xs text-arterial tracking-widest">
            [UPLINK]
          </span>
          <div className="flex-1 h-px bg-grey-dark/30 mt-2" />
        </div>

        <div className="flex flex-wrap gap-6">
          {artist.socials.instagram && (
            <a
              href={artist.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <span className="font-mono text-xs text-grey-dark">{'>'}</span>
              <span className="font-mono text-sm text-grey-mid group-hover:text-arterial transition-colors">
                INSTAGRAM
              </span>
              <span className="font-mono text-xs text-grey-dark group-hover:text-arterial transition-colors">
                [LINK]
              </span>
            </a>
          )}
          {artist.socials.soundcloud && (
            <a
              href={artist.socials.soundcloud}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <span className="font-mono text-xs text-grey-dark">{'>'}</span>
              <span className="font-mono text-sm text-grey-mid group-hover:text-arterial transition-colors">
                SOUNDCLOUD
              </span>
              <span className="font-mono text-xs text-grey-dark group-hover:text-arterial transition-colors">
                [LINK]
              </span>
            </a>
          )}
          {artist.socials.bandcamp && (
            <a
              href={artist.socials.bandcamp}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <span className="font-mono text-xs text-grey-dark">{'>'}</span>
              <span className="font-mono text-sm text-grey-mid group-hover:text-arterial transition-colors">
                BANDCAMP
              </span>
              <span className="font-mono text-xs text-grey-dark group-hover:text-arterial transition-colors">
                [LINK]
              </span>
            </a>
          )}
          {artist.socials.spotify && (
            <a
              href={artist.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <span className="font-mono text-xs text-grey-dark">{'>'}</span>
              <span className="font-mono text-sm text-grey-mid group-hover:text-arterial transition-colors">
                SPOTIFY
              </span>
              <span className="font-mono text-xs text-grey-dark group-hover:text-arterial transition-colors">
                [LINK]
              </span>
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
