'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Event, formatEventDate, formatEventDatePartial } from '@/data/events'
import { triggerSigilGlitch, setDangerLevel } from '@/hooks/useSigilGlitch'
import { playHoverSound } from '@/hooks/useSonicFeedback'
import { useIsMobile } from '@/hooks/useIsMobile'
import { EVENTS } from '@/data/siteCopy'
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [dateHovered, setDateHovered] = useState(false)
  const [scanY, setScanY] = useState<number | null>(null)
  const [titleGap, setTitleGap] = useState<{ left: number; right: number; top: number; bottom: number } | null>(
    null,
  )
  const cardRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
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
  const verticalDate = displayDate.replace(/\./g, '')

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
    if (opensCrt) {
      setCrtOpen(true)
      return
    }
  }, [opensCrt])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    const glass = glassRef.current
    const title = titleRef.current
    if (!glass || isMobile) return
    const gr = glass.getBoundingClientRect()
    setScanY(e.clientY - gr.top)
    if (title) {
      const tr = title.getBoundingClientRect()
      const pad = 6
      setTitleGap({
        left: Math.max(0, tr.left - gr.left - pad),
        right: Math.min(gr.width, tr.right - gr.left + pad),
        top: tr.top - gr.top - pad,
        bottom: tr.bottom - gr.top + pad,
      })
    }
  }, [isMobile])

  const skewDirection = index % 2 === 0 ? -1.5 : 1.5

  const formatLineup = (lineup: string[]) =>
    lineup.map((a) => (a === 'TBA' ? 'More artists TBA' : a)).join(' × ')

  return (
    <>
      <div
        id={event.id}
        ref={cardRef}
        className={clsx(
          'relative select-none',
          isMobile ? 'cursor-pointer' : 'cursor-none',
          'transition-all duration-500 ease-out',
          isHovered && !isMobile ? 'scale-[1.02]' : 'scale-100'
        )}
        style={{
          transform: isMobile ? 'none' : `skewY(${skewDirection}deg)`,
        }}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true)
          triggerSigilGlitch(0.8, 200)
          playHoverSound()
          if (isFullyRedacted || isSecretLocation) {
            setDangerLevel(1)
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setScanY(null)
          setTitleGap(null)
        }}
      >
        <div
          className="absolute -top-1 left-0 right-0 h-2 bg-void"
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

        {/* Vertical date sits behind the glass card */}
        {!isMobile && (
          <div
            className="absolute -left-4 md:-left-8 top-0 bottom-0 z-0 flex items-center select-none"
            aria-hidden
            onMouseEnter={() => setDateHovered(true)}
            onMouseLeave={() => setDateHovered(false)}
          >
            <div
              className={clsx(
                'text-[4rem] md:text-[6rem] leading-none',
                'text-arterial/25 transition-all duration-500',
                isHovered || dateHovered ? 'text-arterial/50 scale-110' : ''
              )}
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                /* Archivo — not CyberpunkCity (titles / OVERRIDE) */
                fontFamily: 'var(--font-archivo), Archivo, system-ui, sans-serif',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
              }}
            >
              <ScrambleText
                triggerOnHover
                duration={500}
                resolveToColor="#CC0000"
                finalColor="#CC0000"
                className="!font-[inherit] tracking-inherit"
              >
                {verticalDate}
              </ScrambleText>
            </div>
          </div>
        )}

        <div
          ref={glassRef}
          className={clsx(
            'relative z-[1] border-l-4 border-arterial glass-card',
            'transition-all duration-300',
            isHovered && !isMobile ? 'glass-card-heavy border-l-8' : ''
          )}
          style={{
            transform: isMobile ? 'none' : `skewY(${-skewDirection}deg)`,
          }}
        >
          {/* Scan line — breaks around the title so it never cuts OVERRIDE */}
          {isHovered && !isMobile && scanY != null && (
            <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
              {titleGap && scanY >= titleGap.top && scanY <= titleGap.bottom ? (
                <>
                  <div
                    className="absolute h-px bg-arterial"
                    style={{ top: scanY, left: 0, width: Math.max(0, titleGap.left) }}
                  />
                  <div
                    className="absolute h-px bg-arterial"
                    style={{ top: scanY, left: titleGap.right, right: 0 }}
                  />
                </>
              ) : (
                <div className="absolute left-0 right-0 h-px bg-arterial" style={{ top: scanY }} />
              )}
            </div>
          )}

          {isHovered && !isMobile && (
            <div
              className="absolute pointer-events-none z-50 transition-opacity duration-150"
              style={{
                left: mousePos.x,
                top: mousePos.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute w-8 h-px bg-arterial left-1/2 top-1/2 -translate-x-1/2" />
              <div className="absolute w-px h-8 bg-arterial left-1/2 top-1/2 -translate-y-1/2" />
              <div className="absolute w-2 h-2 bg-arterial rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              <div
                className={clsx(
                  'absolute w-12 h-12 border border-arterial/50 rounded-full',
                  'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                  'transition-transform duration-300',
                  crtOpen ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
                )}
              />
            </div>
          )}

          <div className="relative z-10 p-4 sm:p-6 md:p-8 md:pl-24 flex flex-col gap-3 sm:gap-4">
            <div className="font-mono text-[10px] sm:text-xs text-arterial tracking-widest">
              <ScrambleText
                triggerOnHover={!isMobile}
                duration={450}
                resolveToColor="#CC0000"
                finalColor="#CC0000"
                className="text-arterial"
              >
                {displayDate}
              </ScrambleText>
              {' // '}
              <span className="text-arterial font-medium">
                {isSecretLocation
                  ? 'LOCATION TBA'
                  : `${event.city.toUpperCase()}, INDIA`}
              </span>
            </div>

            <h3
              ref={titleRef}
              className={clsx(
                'font-display text-2xl sm:text-4xl md:text-6xl tracking-tight leading-none',
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

            {isFullyRedacted ? (
              <div className="space-y-1">
                <div className="font-mono text-xs sm:text-sm">
                  <span className="text-white/50">{EVENTS.location}:</span>
                  <span className="text-white/70 ml-2">TBA</span>
                </div>
                <div className="font-mono text-xs sm:text-sm">
                  <span className="text-white/50">Status:</span>
                  <span className="text-arterial ml-2">More info soon</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="font-mono text-xs sm:text-sm">
                  <span className="text-white/50">{EVENTS.location}:</span>
                  <span className="ml-2 font-medium text-white/80">
                    {isSecretLocation ? event.venue : event.city}
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm">
                  <span className="text-white/50">{EVENTS.lineup}:</span>
                  <span className="text-white/60 ml-2 break-words [overflow-wrap:anywhere]">
                    {formatLineup(event.lineup)}
                  </span>
                </div>
              </div>
            )}

            {/* Always in-flow — absolute bottom left a dead band on short cards */}
            <div
              className={clsx(
                'font-mono text-xs transition-all duration-300',
                'pt-1 sm:pt-2 sm:self-end',
                isHovered ? 'text-arterial' : 'text-white/50'
              )}
            >
              [{opensCrt ? 'ENTER TRANSMISSION' : EVENTS.viewDetails}]
            </div>
          </div>

          {isSoldOut && (
            <div className="absolute top-4 right-4 z-10 font-mono text-xs text-arterial/60 border border-arterial/40 px-2 py-1 transform rotate-6">
              SOLD OUT
            </div>
          )}
        </div>

        <div
          className="absolute -bottom-1 left-0 right-0 h-2 bg-void"
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
