'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Event, formatEventDate, formatEventDatePartial } from '@/data/events'
import { triggerSigilGlitch, setDangerLevel } from '@/hooks/useSigilGlitch'
import { playHoverSound } from '@/hooks/useSonicFeedback'
import { useIsMobile } from '@/hooks/useIsMobile'
import { EVENTS } from '@/data/siteCopy'
import { getAssetPath } from '@/lib/basePath'
import { OverrideCrtModal } from '@/components/events/OverrideCrtModal'
import { ScrambleText } from '@/components/effects/ScrambleText'
import clsx from 'clsx'

interface EventCardProps {
  event: Event
  index: number
  /** When true on mount / hash match, open CRT (OVERRIDE) */
  autoOpenCrt?: boolean
}

export function EventCard({ event, index, autoOpenCrt = false }: EventCardProps) {
  const [crtOpen, setCrtOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const isSoldOut = !event.ticketUrl
  const isSecretLocation = event.isSecretLocation
  const isFullyRedacted = event.isFullyRedacted
  const opensCrt = Boolean(event.featured || event.lineupArtistSlugs?.length)
  const displayDate = (() => {
    if (isFullyRedacted) return '??.??.????'
    if (isSecretLocation) return formatEventDatePartial(event.date)
    return formatEventDate(event.date)
  })()

  useEffect(() => {
    if (!opensCrt) return

    const tryOpen = () => {
      if (window.location.hash === `#${event.id}` || autoOpenCrt) {
        setCrtOpen(true)
      }
    }

    tryOpen()
    window.addEventListener('hashchange', tryOpen)
    return () => window.removeEventListener('hashchange', tryOpen)
  }, [event.id, opensCrt, autoOpenCrt])

  const handleCardClick = useCallback(() => {
    if (opensCrt) setCrtOpen(true)
  }, [opensCrt])

  const formatLineup = (lineup: string[]) =>
    lineup.map((a) => (a === 'TBA' ? 'More artists TBA' : a)).join(' × ')

  const locationValue = isSecretLocation
    ? 'LOCATION TBA'
    : isFullyRedacted
      ? 'TBA'
      : `${event.city.toUpperCase()}, INDIA`

  const lineupValue = isFullyRedacted ? '█████████' : formatLineup(event.lineup)
  const ticketsStatus = isSoldOut ? EVENTS.accessDenied : EVENTS.ticketsLive

  return (
    <>
      <div
        id={event.id}
        ref={cardRef}
        role={opensCrt ? 'button' : undefined}
        tabIndex={opensCrt ? 0 : undefined}
        className={clsx(
          'group relative select-none outline-none',
          opensCrt && 'cursor-pointer',
          'transition-all duration-500 ease-out',
          isHovered && !isMobile ? 'scale-[1.01]' : 'scale-100'
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (!opensCrt) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          triggerSigilGlitch(0.8, 200)
          playHoverSound()
          if (isFullyRedacted || isSecretLocation) setDangerLevel(1)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setDangerLevel(0)
        }}
      >
        <div
          className={clsx(
            'relative overflow-hidden border border-white/15 bg-black/55',
            'transition-colors duration-300',
            isHovered ? 'border-arterial/50 bg-arterial/[0.04]' : ''
          )}
        >
          {/* jagged top edge */}
          <div
            className="absolute -top-1 left-0 right-0 h-2 bg-void z-20"
            style={{
              clipPath: `polygon(
                0% 100%, 3% 0%, 6% 100%, 9% 30%, 12% 100%, 15% 0%, 18% 70%,
                21% 0%, 24% 100%, 27% 20%, 30% 100%, 33% 0%, 36% 80%,
                39% 0%, 42% 100%, 45% 10%, 48% 100%, 51% 0%, 54% 90%,
                57% 0%, 60% 100%, 63% 30%, 66% 100%, 69% 0%, 72% 60%,
                75% 0%, 78% 100%, 81% 20%, 84% 100%, 87% 0%, 90% 70%,
                93% 0%, 96% 100%, 100% 0%, 100% 100%, 0% 100%
              )`,
            }}
          />

          <div
            className={clsx(
              'relative z-10 grid gap-0',
              event.coverImage
                ? 'grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'
                : 'grid-cols-1'
            )}
          >
            {/* Left — details */}
            <div className="flex flex-col justify-between gap-6 p-5 sm:p-7 md:p-9 md:pr-6">
              <div className="space-y-5 sm:space-y-6">
                <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase">
                  <span className="text-arterial">KAMIKAZE</span>
                  <span className="text-white/45 ml-2">{EVENTS.presents}</span>
                </div>

                <h3
                  className={clsx(
                    'font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
                    'tracking-tight leading-none',
                    'transition-all duration-300',
                    isHovered && !isMobile ? 'tracking-wider' : ''
                  )}
                >
                  <ScrambleText
                    triggerOnHover={!isMobile}
                    duration={600}
                    resolveToColor="#CC0000"
                    finalColor="#EFEFEF"
                    className="font-display tracking-inherit"
                  >
                    {event.name}
                  </ScrambleText>
                </h3>

                <div className="space-y-0 border-t border-white/10">
                  <InfoRow
                    label={EVENTS.location.toUpperCase()}
                    value={locationValue}
                    icon="pin"
                  />
                  <InfoRow
                    label={EVENTS.lineup.toUpperCase()}
                    value={lineupValue}
                    icon="wave"
                  />
                  <InfoRow
                    label={EVENTS.date}
                    value={displayDate}
                    icon="date"
                  />
                </div>

                <p className="font-mono text-[10px] sm:text-xs tracking-[0.25em]">
                  <span className={isSoldOut ? 'text-arterial' : 'text-white/50'}>
                    {ticketsStatus}
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 pt-1">
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={clsx(
                      'inline-flex items-center justify-center gap-3',
                      'font-mono text-xs sm:text-sm tracking-[0.3em] uppercase',
                      'border border-arterial text-white px-5 py-3.5 sm:px-6 sm:py-4',
                      'bg-arterial/10 hover:bg-arterial/20 transition-colors duration-200',
                      'focus:outline-none focus-visible:ring-1 focus-visible:ring-arterial',
                      'relative z-10'
                    )}
                  >
                    {EVENTS.bookTickets}
                    <span className="text-arterial" aria-hidden>
                      →
                    </span>
                  </a>
                )}

                {opensCrt && (
                  <span
                    className={clsx(
                      'font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase',
                      'text-white/45 group-hover:text-arterial transition-colors duration-200',
                      'pointer-events-none'
                    )}
                  >
                    [{EVENTS.enterTransmission}]
                  </span>
                )}

                {!opensCrt && !event.ticketUrl && (
                  <span className="font-mono text-xs text-white/40 tracking-[0.25em]">
                    [{EVENTS.viewDetails}]
                  </span>
                )}
              </div>
            </div>

            {/* Right — cover */}
            {event.coverImage && (
              <div className="relative min-h-[280px] sm:min-h-[340px] md:min-h-full border-t md:border-t-0 md:border-l border-white/10">
                <div className="absolute inset-3 sm:inset-4 overflow-hidden border border-white/10 bg-void">
                  <Image
                    src={getAssetPath(event.coverImage)}
                    alt={`${event.name} cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={clsx(
                      'object-cover transition-transform duration-700',
                      isHovered && !isMobile ? 'scale-[1.04]' : 'scale-100'
                    )}
                    priority={index === 0}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 55%, rgba(204,0,0,0.35) 100%)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute top-3 right-3 grid grid-cols-3 gap-1"
                    aria-hidden
                  >
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className="text-arterial/70 text-[10px] leading-none">
                        +
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isSoldOut && (
            <div className="absolute top-5 right-5 z-20 font-mono text-xs text-arterial/70 border border-arterial/40 px-2 py-1 rotate-6">
              SOLD OUT
            </div>
          )}

          {/* jagged bottom edge */}
          <div
            className="absolute -bottom-1 left-0 right-0 h-2 bg-void z-20"
            style={{
              clipPath: `polygon(
                0% 0%, 3% 100%, 6% 0%, 9% 70%, 12% 0%, 15% 100%, 18% 30%,
                21% 100%, 24% 0%, 27% 80%, 30% 0%, 33% 100%, 36% 20%,
                39% 100%, 42% 0%, 45% 90%, 48% 0%, 51% 100%, 54% 10%,
                57% 100%, 60% 0%, 63% 70%, 66% 0%, 69% 100%, 72% 40%,
                75% 100%, 78% 0%, 81% 80%, 84% 0%, 87% 100%, 90% 30%,
                93% 100%, 96% 0%, 100% 100%, 100% 0%, 0% 0%
              )`,
            }}
          />
        </div>
      </div>

      {opensCrt && (
        <OverrideCrtModal
          event={event}
          isOpen={crtOpen}
          onClose={() => setCrtOpen(false)}
        />
      )}
    </>
  )
}

function InfoRow({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon: 'pin' | 'wave' | 'ticket' | 'date'
  valueClassName?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 sm:py-4 border-b border-white/10">
      <span className="mt-0.5 text-arterial shrink-0" aria-hidden>
        {icon === 'pin' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        )}
        {icon === 'wave' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 12h2l2-6 3 12 3-16 3 16 3-6h4" />
          </svg>
        )}
        {icon === 'ticket' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
            <path d="M12 6v12" strokeDasharray="2 2" />
          </svg>
        )}
        {icon === 'date' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="5" width="18" height="16" rx="1.5" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] text-white/40 uppercase mb-1">
          {label}
        </div>
        <div
          className={clsx(
            'font-mono text-xs sm:text-sm text-white/85 leading-snug break-words [overflow-wrap:anywhere]',
            valueClassName
          )}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
