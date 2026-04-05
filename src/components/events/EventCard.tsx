'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Event, formatEventDate } from '@/data/events'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { triggerSigilGlitch, setDangerLevel } from '@/hooks/useSigilGlitch'
import { playErrorSound, playSubmitSound, playHoverSound } from '@/hooks/useSonicFeedback'
import { useIsMobile } from '@/hooks/useIsMobile'
import clsx from 'clsx'

// Glitch characters for the reveal effect
const GLITCH_CHARS = '█▓▒░╔╗╚╝│─┌┐└┘?#@$%&*'

// City lists for each attempt - scan through these before failing
const ATTEMPT_CITIES = [
  ['BERLIN', 'AMSTERDAM', 'LONDON', 'DETROIT'],
  ['TOKYO', 'MUMBAI', 'TBILISI', 'KIEV'],
  ['MELBOURNE', 'SAO_PAULO', 'LAGOS', 'CAIRO'],
]

// Denial messages for each attempt
const DENIAL_MESSAGES = [
  'ACCESS_DENIED // FIREWALL_ACTIVE',
  'REJECTED // ENCRYPTION_MISMATCH',
  'BLOCKED // PROTOCOL_VIOLATION',
]

const MAX_ATTEMPTS = 2

interface EventCardProps {
  event: Event
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hackAttempt, setHackAttempt] = useState(0)
  const [displayCity, setDisplayCity] = useState('')
  const [hackStatus, setHackStatus] = useState<'idle' | 'denied' | 'compromised' | 'partial'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const hackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()
  const isSoldOut = !event.ticketUrl
  const isSecretLocation = event.isSecretLocation
  const isFullyRedacted = event.isFullyRedacted

  // Initialize display city
  useEffect(() => {
    if (isSecretLocation && hackStatus === 'idle') {
      setDisplayCity('█'.repeat(event.city.length))
    } else if (!isSecretLocation) {
      setDisplayCity(event.city.toUpperCase())
    }
  }, [event.city, isSecretLocation, hackStatus])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hackTimeoutRef.current) {
        clearTimeout(hackTimeoutRef.current)
      }
    }
  }, [])

  // Format date - mask for secret/redacted events
  const getDisplayDate = () => {
    if (isFullyRedacted) {
      return '??.??.????'
    }
    if (isSecretLocation) {
      return 'XX.?X.X026'
    }
    return formatEventDate(event.date)
  }

  // Handle each ACQUIRE_ACCESS click - manual attempts
  // Each attempt scans through 3-4 cities before failing
  const handleSecretAccessClick = useCallback(() => {
    if (hackStatus === 'partial' || hackStatus === 'compromised') return
    if (isProcessing) return

    const newAttempt = hackAttempt + 1
    setHackAttempt(newAttempt)
    setIsProcessing(true)
    setHackStatus('denied')
    triggerSigilGlitch(0.8, 400)

    // Trigger danger level 2 on access attempt
    setDangerLevel(2)

    const cityUpper = event.city.toUpperCase()
    const cityLength = event.city.length

    // Get cities to scan for this attempt
    const citiesToScan = ATTEMPT_CITIES[newAttempt - 1] || ATTEMPT_CITIES[0]
    let cityIndex = 0
    let phase: 'scramble' | 'show_city' | 'next' = 'scramble'
    let scrambleFrames = 0

    const scanInterval = setInterval(() => {
      if (phase === 'scramble') {
        // Scramble effect
        scrambleFrames++
        setDisplayCity(
          Array(cityLength).fill(0).map(() =>
            GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join('')
        )
        setStatusMessage(`SCANNING_NODE_${cityIndex + 1}...`)

        if (scrambleFrames >= 8) {
          scrambleFrames = 0
          phase = 'show_city'
        }
      } else if (phase === 'show_city') {
        // Show current city being "tried"
        const currentCity = citiesToScan[cityIndex]
        setDisplayCity(currentCity.slice(0, cityLength).padEnd(cityLength, '█'))
        setStatusMessage(`TRYING: ${currentCity}...`)
        phase = 'next'
      } else if (phase === 'next') {
        cityIndex++
        if (cityIndex < citiesToScan.length) {
          // Move to next city
          phase = 'scramble'
          triggerSigilGlitch(0.3, 100)
        } else {
          // Done scanning all cities - show failure
          clearInterval(scanInterval)

          if (newAttempt >= MAX_ATTEMPTS) {
            // Final attempt - they're watching!
            setHackStatus('compromised')
            setStatusMessage('SOMEONE IS WATCHING, ABORTING...')
            triggerSigilGlitch(1.5, 800)

            // Critical danger + error sound
            setDangerLevel(3)
            playErrorSound()

            // After dramatic pause, reveal first letter only
            hackTimeoutRef.current = setTimeout(() => {
              setHackStatus('partial')
              const firstLetter = cityUpper[0]
              const masked = '█'.repeat(cityUpper.length - 1)
              setDisplayCity(firstLetter + masked)
              setStatusMessage('PARTIAL_DECRYPT: 0x01')
              setIsProcessing(false)

              // Success sound on partial reveal
              playSubmitSound()
            }, 1500)
          } else {
            // Failed attempt - show denial
            setStatusMessage(DENIAL_MESSAGES[newAttempt - 1] || DENIAL_MESSAGES[0])
            setDisplayCity('█'.repeat(cityLength))
            setIsProcessing(false)
            triggerSigilGlitch(0.5, 200)

            // Error sound + danger level 2 on denial
            playErrorSound()
            setDangerLevel(2)
          }
        }
      }
    }, 150) // 150ms per frame for more dramatic effect

  }, [event.city, hackAttempt, hackStatus, isProcessing])

  // Handle normal ACQUIRE_ACCESS - just go to ticket URL
  const handleNormalAccess = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (event.ticketUrl) {
      window.open(event.ticketUrl, '_blank')
    }
  }, [event.ticketUrl])

  // Track mouse within card for crosshair
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  // Alternate skew direction based on index - disabled on mobile
  const skewDirection = index % 2 === 0 ? -1.5 : 1.5

  return (
    <div
      ref={cardRef}
      className={clsx(
        'relative select-none',
        isMobile ? 'cursor-pointer' : 'cursor-none',
        'transition-all duration-500 ease-out',
        isHovered && !isMobile ? 'scale-[1.02]' : 'scale-100'
      )}
      style={{
        // Disable skew on mobile for better responsiveness
        transform: isMobile ? 'none' : `skewY(${skewDirection}deg)`,
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true)
        triggerSigilGlitch(0.8, 200) // Trigger 3D sigil shake
        playHoverSound()

        // Trigger danger level 1 on hover of classified events
        if (isFullyRedacted || isSecretLocation) {
          setDangerLevel(1)
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Torn edge top */}
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

      {/* Main card body - glass effect */}
      <div
        className={clsx(
          'relative border-l-4 border-arterial glass-card',
          'transition-all duration-300',
          isHovered && !isMobile ? 'glass-card-heavy border-l-8' : ''
        )}
        style={{
          // Counter-skew content (disabled on mobile)
          transform: isMobile ? 'none' : `skewY(${-skewDirection}deg)`,
        }}
      >
        {/* Crosshair cursor - desktop only */}
        {isHovered && !isMobile && (
          <div
            className="absolute pointer-events-none z-50 transition-opacity duration-150"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Horizontal line */}
            <div className="absolute w-8 h-px bg-arterial left-1/2 top-1/2 -translate-x-1/2" />
            {/* Vertical line */}
            <div className="absolute w-px h-8 bg-arterial left-1/2 top-1/2 -translate-y-1/2" />
            {/* Center dot */}
            <div className="absolute w-2 h-2 bg-arterial rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            {/* Outer ring */}
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

        {/* Giant date - overlapping brutalist style (desktop only) */}
        {!isMobile && (
          <div
            className={clsx(
              'absolute -left-4 md:-left-8 top-0 bottom-0 flex items-center',
              'pointer-events-none select-none'
            )}
          >
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

        {/* Content - left aligned brutalist */}
        <div className="relative p-4 sm:p-6 md:p-8 md:pl-24">
          {/* Date badge - small */}
          <div className="font-mono text-xs text-arterial mb-2 tracking-widest">
            {getDisplayDate()} {'// '}
            <span className={clsx(
              'transition-colors',
              isProcessing ? 'text-signal animate-pulse' :
              hackStatus === 'denied' ? 'text-red-bright' :
              hackStatus === 'compromised' ? 'text-red-bright animate-pulse' :
              hackStatus === 'partial' ? 'text-white' :
              'text-arterial'
            )}>
              {displayCity || (isSecretLocation ? '█'.repeat(event.city.length) : event.city.toUpperCase())}
            </span>
          </div>

          {/* Event name - huge */}
          <h3
            className={clsx(
              'font-display text-2xl sm:text-4xl md:text-6xl tracking-tight leading-none mb-4 sm:mb-6',
              'transition-all duration-300',
              isHovered && !isMobile ? 'tracking-wider' : ''
            )}
          >
            {event.name}
          </h3>

          {/* Meta stack */}
          {isFullyRedacted ? (
            <div className="space-y-1">
              <div className="font-mono text-sm">
                <span className="text-white/50">LOC://</span>
                <span className="text-white/70 ml-2">UNKNOWN</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">STATUS://</span>
                <span className="text-arterial ml-2">RESTRICTED</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">ACCESS://</span>
                <span className="text-red-bright ml-2">DENIED</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">SIGNAL://</span>
                <span className="text-white/70 ml-2">ENCRYPTED</span>
              </div>
              <div className="font-mono text-sm mt-2">
                <span className="text-white/50">SET://</span>
                <span className="text-white/50/60 ml-2">████████ × ██████ × ███████</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-mono text-sm">
                <span className="text-white/50">LOC://</span>
                <span className="text-white/80 ml-2">{event.venue}</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-white/50">SET://</span>
                <span className="text-white/60 ml-2">{event.lineup.join(' × ')}</span>
              </div>
            </div>
          )}

          {/* Expanded content */}
          <div
            className={clsx(
              'overflow-hidden transition-all duration-500',
              isExpanded ? 'max-h-64 opacity-100 mt-8' : 'max-h-0 opacity-0'
            )}
          >
            {event.description && (
              <p className="font-mono text-sm text-white/70 mb-8 max-w-xl border-l-2 border-white/30/30 pl-4">
                {event.description}
              </p>
            )}

            {/* Fully redacted event - no access at all */}
            {isFullyRedacted ? (
              <div className="inline-block">
                <TerminalButton disabled>
                  [ACCESS DENIED]
                </TerminalButton>
              </div>
            ) : isSecretLocation ? (
              <div className="space-y-3">
                {/* Hacking status display */}
                {statusMessage && (
                  <div className={clsx(
                    'font-mono text-xs tracking-widest border-l-2 pl-3 py-1',
                    hackStatus === 'denied' ? 'border-red-bright text-red-bright' :
                    hackStatus === 'compromised' ? 'border-red-bright text-red-bright animate-pulse' :
                    hackStatus === 'partial' ? 'border-arterial text-white/70' :
                    'border-signal text-signal'
                  )}>
                    <span className={hackStatus === 'compromised' ? 'animate-pulse' : ''}>
                      {statusMessage}
                    </span>
                    {hackStatus === 'denied' && (
                      <span className="text-white/50 ml-2">[{hackAttempt}/{MAX_ATTEMPTS}]</span>
                    )}
                  </div>
                )}

                {/* ACQUIRE_ACCESS / TRY_AGAIN button */}
                <div onClick={(e) => e.stopPropagation()}>
                  <TerminalButton
                    onClick={handleSecretAccessClick}
                    disabled={isProcessing || hackStatus === 'partial' || hackStatus === 'compromised'}
                  >
                    {isProcessing ? 'DECRYPTING...' :
                     hackStatus === 'idle' ? 'ACQUIRE_ACCESS' :
                     hackStatus === 'denied' ? 'TRY AGAIN_' :
                     hackStatus === 'compromised' ? 'ABORTING...' :
                     hackStatus === 'partial' ? 'SIGNAL_LOST_' :
                     'ACQUIRE_ACCESS'}
                  </TerminalButton>
                </div>
              </div>
            ) : isSoldOut ? (
              <div className="inline-block">
                <span className="font-mono text-white/50 line-through tracking-widest">
                  [VOID] NO ENTRY
                </span>
              </div>
            ) : (
              /* Normal event - direct ticket link */
              <button
                onClick={handleNormalAccess}
                className="inline-block"
              >
                <TerminalButton>ACQUIRE_ACCESS</TerminalButton>
              </button>
            )}
          </div>

          {/* Expand hint */}
          <div
            className={clsx(
              'absolute bottom-4 right-4 font-mono text-xs transition-all duration-300',
              isExpanded ? 'text-arterial' : 'text-white/50'
            )}
          >
            [{isExpanded ? 'COLLAPSE' : 'EXPAND'}]
          </div>
        </div>

        {/* Sold Out small badge */}
        {isSoldOut && (
          <div
            className={clsx(
              'absolute top-4 right-4 font-mono text-xs text-arterial/60',
              'border border-arterial/40 px-2 py-1',
              'transform rotate-6'
            )}
          >
            SOLD OUT
          </div>
        )}

        {/* VOID stamp - big diagonal on expand */}
        {isSoldOut && isExpanded && (
          <div
            className={clsx(
              'absolute inset-0 flex items-center justify-center',
              'pointer-events-none overflow-hidden'
            )}
          >
            <div
              className={clsx(
                'font-display text-[3rem] sm:text-[6rem] md:text-[10rem] text-arterial/20',
                'border-4 sm:border-8 border-arterial/20 px-6 sm:px-12 py-2 sm:py-4',
                'transform -rotate-12',
                'animate-pulse'
              )}
            >
              VOID
            </div>
          </div>
        )}

        {/* Glitch line on hover */}
        <div
          className={clsx(
            'absolute left-0 right-0 h-px bg-arterial',
            'transition-all duration-100',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            top: `${Math.random() * 100}%`,
          }}
        />
      </div>

      {/* Torn edge bottom */}
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
