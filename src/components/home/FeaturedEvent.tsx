'use client'

/**
 * Homepage featured event — OVERRIDE (classic CRT chrome).
 * Thumbnail: auto channel-surf through lineup photos (works on mobile).
 */

import { useTransition } from '@/providers/TransitionProvider'
import { useInView } from '@/hooks/useInView'
import {
  getFeaturedEvent,
  formatEventDate,
} from '@/data/events'
import { HOME_COPY } from '@/components/home/homeCopy'
import { EventFeatureVisual } from '@/components/home/EventFeatureVisual'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { useLiteMode } from '@/hooks/useLiteMode'
import clsx from 'clsx'

export function FeaturedEvent() {
  const event = getFeaturedEvent()
  const { navigateTo } = useTransition()
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.12, triggerOnce: true })
  const lite = useLiteMode()

  if (!event) return null

  const dateLabel = formatEventDate(event.date)
  const location = event.isSecretLocation
    ? HOME_COPY.events.locationTbd
    : event.tbdFields?.includes('venue')
      ? `${event.city}, India`
      : `${event.venue} · ${event.city}`

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 px-4 sm:px-6 border-t border-white/10"
      aria-labelledby="home-featured-event"
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
            id="home-featured-event"
            className="font-mono text-[10px] sm:text-xs text-arterial tracking-[0.45em] uppercase"
          >
            {HOME_COPY.events.label}
          </h2>
        </header>

        <button
          type="button"
          onClick={() => navigateTo('/events')}
          className={clsx(
            'group w-full text-left',
            'grid grid-cols-1 sm:grid-cols-[minmax(0,220px)_1fr] gap-5 sm:gap-8',
            'border border-white/15 bg-black/40 p-4 sm:p-5',
            'hover:border-arterial/50 hover:bg-arterial/[0.04] transition-colors duration-300',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-arterial'
          )}
          aria-label={`${event.name}, ${dateLabel}`}
        >
          <div className="relative aspect-square overflow-hidden border border-white/10 bg-void">
            <EventFeatureVisual artistSlugs={event.lineupArtistSlugs ?? []} />
          </div>

          <div className="flex flex-col justify-center min-w-0 py-1">
            <p className="font-mono text-[10px] sm:text-xs text-white/40 tracking-[0.3em] mb-2">
              {dateLabel}
            </p>
            <ScrambleText
              className="font-display text-3xl sm:text-5xl md:text-6xl tracking-wider text-white block mb-3"
              triggerOnHover={!lite}
              triggerOnView
              duration={600}
              resolveToColor="#CC0000"
              finalColor="#EFEFEF"
            >
              {event.name}
            </ScrambleText>
            <p className="font-mono text-xs sm:text-sm text-arterial/80 tracking-wide mb-4">
              {location}
            </p>
            <p className="font-mono text-[10px] sm:text-xs text-white/45 tracking-wider uppercase mb-6 leading-relaxed">
              {event.lineup.join(' · ')}
            </p>
            <span className="font-mono text-xs tracking-[0.25em] text-white/70 group-hover:text-arterial transition-colors">
              {HOME_COPY.events.cta}
            </span>
          </div>
        </button>

        {event.ticketUrl && (
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-arterial border border-arterial/40 px-4 py-2.5 hover:bg-arterial/10 transition-colors"
            >
              [ BOOK TICKETS → ]
            </a>
            <button
              type="button"
              onClick={() => navigateTo('/events')}
              className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-white/50 hover:text-white transition-colors"
            >
              {HOME_COPY.events.viewAll}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
