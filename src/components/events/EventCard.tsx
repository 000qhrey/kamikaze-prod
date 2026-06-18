'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Event, formatEventDate } from '@/data/events'
import {
  FRAGMENT_01_SEEN_KEY,
  MASKED_TIMESTAMP,
  TRANSMISSION_PROGRESS,
  getProgressBar,
} from '@/data/transmission'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { triggerSigilGlitch, setDangerLevel } from '@/hooks/useSigilGlitch'
import { playErrorSound, playSubmitSound, playHoverSound } from '@/hooks/useSonicFeedback'
import { useIsMobile } from '@/hooks/useIsMobile'
import { EVENTS } from '@/data/siteCopy'
import clsx from 'clsx'

const GLITCH_CHARS = '█▓▒░╔╗╚╝│─┌┐└┘?#@$%&*'

const SCAN_CITIES = [
  'BERLIN', 'AMSTERDAM', 'LONDON', 'TOKYO', 'MUMBAI', 'TBILISI',
]

const WATCHING_MESSAGE = 'THE DOME REGISTERED YOUR SCAN // STEP BACK OR COMMIT'

interface EventCardProps {
  event: Event
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [displayCity, setDisplayCity] = useState('')
  const [hackStatus, setHackStatus] = useState<'idle' | 'scanning' | 'compromised' | 'partial'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [fragmentHint, setFragmentHint] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const decryptStartedRef = useRef(false)
  const isMobile = useIsMobile()
  const isSoldOut = !event.ticketUrl
  const isSecretLocation = event.isSecretLocation
  const isFullyRedacted = event.isFullyRedacted

  useEffect(() => {
    if (isSecretLocation && hackStatus === 'idle') {
      setDisplayCity('█'.repeat(event.city.length))
    } else if (!isSecretLocation) {
      setDisplayCity(event.city.toUpperCase())
    }
  }, [event.city, isSecretLocation, hackStatus])

  const runDecryptSequence = useCallback(() => {
    if (decryptStartedRef.current || hackStatus !== 'idle') return
    decryptStartedRef.current = true
    setIsProcessing(true)
    setHackStatus('scanning')
    triggerSigilGlitch(0.8, 400)
    setDangerLevel(2)

    const cityUpper = event.city.toUpperCase()
    const cityLength = event.city.length
    let cityIndex = 0
    let phase: 'scramble' | 'show_city' | 'next' = 'scramble'
    let scrambleFrames = 0

    const scanInterval = setInterval(() => {
      if (phase === 'scramble') {
        scrambleFrames++
        setDisplayCity(
          Array(cityLength).fill(0).map(() =>
            GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join('')
        )
        setStatusMessage(`SCANNING_NODE_${cityIndex + 1}...`)

        if (scrambleFrames >= 6) {
          scrambleFrames = 0
          phase = 'show_city'
        }
      } else if (phase === 'show_city') {
        const currentCity = SCAN_CITIES[cityIndex]
        setDisplayCity(currentCity.slice(0, cityLength).padEnd(cityLength, '█'))
        setStatusMessage(`TRYING: ${currentCity}...`)
        phase = 'next'
      } else if (phase === 'next') {
        cityIndex++
        if (cityIndex < SCAN_CITIES.length) {
          phase = 'scramble'
          triggerSigilGlitch(0.3, 100)
        } else {
          clearInterval(scanInterval)
          setHackStatus('compromised')
          setStatusMessage(WATCHING_MESSAGE)
          triggerSigilGlitch(1.5, 800)
          setDangerLevel(3)
          playErrorSound()

          hackTimeoutRef.current = setTimeout(() => {
            setHackStatus('partial')
            setDisplayCity(cityUpper)
            setStatusMessage('')
            setIsProcessing(false)
            playSubmitSound()
          }, 1500)
        }
      }
    }, 120)
  }, [event.city, hackStatus])

  useEffect(() => {
    if (isSecretLocation) {
      setFragmentHint(sessionStorage.getItem(FRAGMENT_01_SEEN_KEY) === '1')

      if (
        sessionStorage.getItem(FRAGMENT_01_SEEN_KEY) === '1' &&
        window.location.hash === `#${event.id}`
      ) {
        setIsExpanded(true)
        requestAnimationFrame(() => runDecryptSequence())
      }
    }
    return () => {
      if (hackTimeoutRef.current) {
        clearTimeout(hackTimeoutRef.current)
      }
    }
  }, [event.id, isSecretLocation, runDecryptSequence])

  const getDisplayDate = () => {
    if (isFullyRedacted) return '??.??.????'
    if (isSecretLocation && hackStatus !== 'partial') return MASKED_TIMESTAMP
    if (isSecretLocation && hackStatus === 'partial') return formatEventDate(event.date)
    return formatEventDate(event.date)
  }

  const handleCardClick = useCallback(() => {
    if (isSecretLocation) {
      if (!isExpanded) {
        setIsExpanded(true)
        requestAnimationFrame(() => runDecryptSequence())
        return
      }
      if (hackStatus === 'idle' && !isProcessing) {
        runDecryptSequence()
        return
      }
      setIsExpanded(false)
      return
    }
    setIsExpanded(prev => !prev)
  }, [isSecretLocation, isExpanded, hackStatus, isProcessing, runDecryptSequence])

  const handleNormalAccess = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (event.ticketUrl) {
      window.open(event.ticketUrl, '_blank')
    }
  }, [event.ticketUrl])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const skewDirection = index % 2 === 0 ? -1.5 : 1.5

  const transmissionProgress = hackStatus === 'partial'
    ? TRANSMISSION_PROGRESS.FRAGMENT_02
    : TRANSMISSION_PROGRESS.FRAGMENT_01

  const expandLabel = isSecretLocation
    ? (isExpanded ? EVENTS.close : EVENTS.viewDetails)
    : (isExpanded ? EVENTS.close : EVENTS.viewDetails)

  const formatLineup = (lineup: string[]) =>
    lineup.map(a => a === 'TBA' ? 'More artists TBA' : a).join(' × ')

  const isRevealed = hackStatus === 'partial'

  return (
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
      onMouseLeave={() => setIsHovered(false)}
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

      <div
        className={clsx(
          'relative border-l-4 border-arterial glass-card',
          'transition-all duration-300',
          isHovered && !isMobile ? 'glass-card-heavy border-l-8' : ''
        )}
        style={{
          transform: isMobile ? 'none' : `skewY(${-skewDirection}deg)`,
        }}
      >
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
                isExpanded ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
              )}
            />
          </div>
        )}

        {!isMobile && (
          <div className="absolute -left-4 md:-left-8 top-0 bottom-0 flex items-center pointer-events-none select-none">
            <span
              className={clsx(
                'font-display text-[4rem] md:text-[6rem] leading-none',
                'text-arterial/20 transition-all duration-500',
                isHovered ? 'text-arterial/40 scale-110' : ''
              )}
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              {getDisplayDate().replace(/\./g, '')}
            </span>
          </div>
        )}

        <div className="relative p-4 sm:p-6 md:p-8 md:pl-24">
          <div className="font-mono text-xs text-arterial mb-2 tracking-widest">
            <span className={clsx(isRevealed && 'text-signal')}>{getDisplayDate()}</span>
            {' // '}
            <span className={clsx(
              'transition-colors',
              isProcessing ? 'text-signal animate-pulse' :
              hackStatus === 'compromised' ? 'text-red-bright animate-pulse' :
              isRevealed ? 'text-signal' :
              'text-arterial'
            )}>
              {displayCity || (isSecretLocation ? '█'.repeat(event.city.length) : event.city.toUpperCase())}
            </span>
          </div>

          {isSecretLocation && (
            <div className="font-mono text-[10px] text-white/40 tracking-wider mb-3">
              {getProgressBar(transmissionProgress)}
              <span className="block mt-1 text-white/50">
                {EVENTS.detailsUnlocked(transmissionProgress)}
                {isRevealed && ' — city found'}
              </span>
            </div>
          )}

          <h3
            className={clsx(
              'font-display text-2xl sm:text-4xl md:text-6xl tracking-tight leading-none mb-4 sm:mb-6',
              'transition-all duration-300',
              isHovered && !isMobile ? 'tracking-wider' : ''
            )}
          >
            {event.name}
          </h3>

          {isFullyRedacted ? (
            <div className="space-y-1">
              <div className="font-mono text-sm">
                <span className="text-white/50">{EVENTS.location}:</span>
                <span className="text-white/70 ml-2">TBA</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">Status:</span>
                <span className="text-arterial ml-2">More info soon</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">Tickets:</span>
                <span className="text-red-bright ml-2">{EVENTS.accessDenied}</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">Details:</span>
                <span className="text-white/70 ml-2">Tap to view</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-mono text-sm">
                <span className="text-white/50">{EVENTS.location}:</span>
                <span className={clsx('ml-2', isRevealed ? 'text-signal' : 'text-white/80')}>
                  {isRevealed ? event.city : event.venue}
                </span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">{EVENTS.lineup}:</span>
                <span className="text-white/60 ml-2">{formatLineup(event.lineup)}</span>
              </div>
            </div>
          )}

          <div
            className={clsx(
              'overflow-hidden transition-all duration-500',
              isExpanded ? 'max-h-96 opacity-100 mt-8' : 'max-h-0 opacity-0'
            )}
          >
            {event.description && (
              <div className="font-mono text-sm text-white/70 mb-6 max-w-xl border-l-2 border-white/30/30 pl-4">
                <p>{event.description}</p>
              </div>
            )}

            {statusMessage && (
              <div className={clsx(
                'font-mono text-xs tracking-widest border-l-2 pl-3 py-1 mb-4',
                hackStatus === 'compromised' ? 'border-red-bright text-red-bright animate-pulse' :
                'border-signal text-signal'
              )}>
                {statusMessage}
              </div>
            )}

            {isRevealed && isSecretLocation && (
              <div className="font-mono text-xs space-y-1.5 mb-6 border-t border-white/10 pt-4">
                <p className="text-signal">✓ Date: {formatEventDate(event.date)}</p>
                <p className="text-signal">✓ City: {event.city}</p>
                {event.tbdFields?.includes('venue') && (
                  <p className="text-white/50">○ Venue: Not announced yet</p>
                )}
                {event.tbdFields?.includes('lineup') && (
                  <p className="text-white/50">○ Lineup: Partially confirmed</p>
                )}
              </div>
            )}

            {isFullyRedacted ? (
              <div className="inline-block">
                <TerminalButton disabled>[ACCESS DENIED]</TerminalButton>
              </div>
            ) : isSecretLocation ? (
              isRevealed && event.ticketUrl ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <TerminalButton onClick={() => {
                    if (event.ticketUrl) window.open(event.ticketUrl, '_blank')
                  }}>
                    {EVENTS.getTickets}
                  </TerminalButton>
                </div>
              ) : isProcessing ? (
                <span className="font-mono text-xs text-signal tracking-widest animate-pulse">
                  {EVENTS.loadingDetails}
                </span>
              ) : null
            ) : isSoldOut ? (
              <span className="font-mono text-white/50 line-through tracking-widest">
                [ {EVENTS.accessDenied} ]
              </span>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); handleNormalAccess(e) }} className="inline-block">
                <TerminalButton>{EVENTS.getTickets}</TerminalButton>
              </button>
            )}
          </div>

          <div
            className={clsx(
              'absolute bottom-4 right-4 font-mono text-xs transition-all duration-300',
              isExpanded ? 'text-arterial' :
              isSecretLocation && fragmentHint ? 'text-arterial animate-pulse' :
              'text-white/50'
            )}
          >
            [{expandLabel}]
          </div>
        </div>

        {isSoldOut && (
          <div className="absolute top-4 right-4 font-mono text-xs text-arterial/60 border border-arterial/40 px-2 py-1 transform rotate-6">
            SOLD OUT
          </div>
        )}

        {isSoldOut && isExpanded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="font-display text-[3rem] sm:text-[6rem] md:text-[10rem] text-arterial/20 border-4 sm:border-8 border-arterial/20 px-6 sm:px-12 py-2 sm:py-4 transform -rotate-12 animate-pulse">
              VOID
            </div>
          </div>
        )}

        <div
          className={clsx(
            'absolute left-0 right-0 h-px bg-arterial',
            'transition-all duration-100',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{ top: `${Math.random() * 100}%` }}
        />
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
  )
}
