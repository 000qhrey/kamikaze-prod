'use client'

/**
 * Homepage featured mix — IBLIIIZ IMPACT 001.
 */

import Image from 'next/image'
import { useInView } from '@/hooks/useInView'
import { useTransition } from '@/providers/TransitionProvider'
import { getArtistBySlug } from '@/data/artists'
import { HOME_COPY } from '@/components/home/homeCopy'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

const FEATURED_ARTIST_SLUG = 'ibliiiz'

export function FeaturedMix() {
  const artist = getArtistBySlug(FEATURED_ARTIST_SLUG)
  const mix = artist?.mixes[0]
  const { navigateTo } = useTransition()
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.12, triggerOnce: true })

  if (!artist || !mix) return null

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 px-4 sm:px-6 border-t border-white/10"
      aria-labelledby="home-featured-mix"
    >
      <div
        className={clsx(
          'max-w-4xl mx-auto transition-all duration-700',
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <header className="flex items-center gap-4 mb-8 md:mb-10">
          <span className="h-px w-8 bg-arterial/60" aria-hidden />
          <h2
            id="home-featured-mix"
            className="font-mono text-[10px] sm:text-xs text-arterial tracking-[0.45em] uppercase"
          >
            {HOME_COPY.mix.label}
          </h2>
        </header>

        <div
          className={clsx(
            'grid grid-cols-1 sm:grid-cols-[minmax(0,200px)_1fr] gap-5 sm:gap-8',
            'border border-white/15 bg-black/40 p-4 sm:p-5'
          )}
        >
          <a
            href={mix.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden border border-white/10 bg-void group"
            aria-label={`Play ${mix.title} on SoundCloud`}
          >
            <Image
              src={getAssetPath(mix.cover ?? artist.photo)}
              alt=""
              fill
              className="object-cover transition-[filter,transform] duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105 brightness-100"
              sizes="(max-width: 640px) 90vw, 200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.3em] text-white/80 group-hover:text-arterial transition-colors">
              {HOME_COPY.mix.play}
            </span>
          </a>

          <div className="flex flex-col justify-center min-w-0 py-1">
            <p className="font-mono text-[10px] text-white/35 tracking-[0.35em] uppercase mb-2">
              {HOME_COPY.mix.eyebrow} · {artist.name}
            </p>
            <h3 className="font-display text-xl sm:text-3xl tracking-wider text-white mb-3 leading-tight">
              {mix.title}
            </h3>
            <p className="font-mono text-xs sm:text-sm text-white/55 leading-relaxed mb-6 max-w-md">
              {artist.tagline}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href={mix.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-arterial border border-arterial/40 px-4 py-2.5 hover:bg-arterial/10 transition-colors"
              >
                {HOME_COPY.mix.listen}
              </a>
              <button
                type="button"
                onClick={() => navigateTo(`/artists/${artist.slug}`)}
                className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-white/55 hover:text-white transition-colors"
              >
                {HOME_COPY.mix.artist}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
