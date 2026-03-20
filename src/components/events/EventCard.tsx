'use client'

import { useState, useRef, useCallback } from 'react'
import { Event, formatEventDate } from '@/data/events'
import { TerminalButton } from '@/components/ui/TerminalButton'
import clsx from 'clsx'

interface EventCardProps {
  event: Event
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isSoldOut = !event.ticketUrl

  // Track mouse within card for crosshair
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  // Alternate skew direction based on index
  const skewDirection = index % 2 === 0 ? -1.5 : 1.5

  return (
    <div
      ref={cardRef}
      className={clsx(
        'relative cursor-none select-none',
        'transition-all duration-500 ease-out',
        isHovered ? 'scale-[1.02]' : 'scale-100'
      )}
      style={{
        transform: `skewY(${skewDirection}deg)`,
        marginLeft: index % 2 === 0 ? '0' : '2rem',
        marginRight: index % 2 === 0 ? '2rem' : '0',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
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

      {/* Main card body */}
      <div
        className={clsx(
          'relative border-l-4 border-arterial bg-void/80 backdrop-blur-sm',
          'transition-all duration-300',
          isHovered ? 'bg-void/95 border-l-8' : ''
        )}
        style={{
          transform: `skewY(${-skewDirection}deg)`, // Counter-skew content
        }}
      >
        {/* Crosshair cursor */}
        {isHovered && (
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

        {/* Giant date - overlapping brutalist style */}
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
            {formatEventDate(event.date).replace(/\./g, '')}
          </span>
        </div>

        {/* Content - left aligned brutalist */}
        <div className="relative p-8 pl-16 md:pl-24">
          {/* Date badge - small */}
          <div className="font-mono text-xs text-arterial mb-2 tracking-widest">
            {formatEventDate(event.date)} {'// '}{event.city.toUpperCase()}
          </div>

          {/* Event name - huge */}
          <h3
            className={clsx(
              'font-display text-4xl md:text-6xl tracking-tight leading-none mb-6',
              'transition-all duration-300',
              isHovered ? 'tracking-wider' : ''
            )}
          >
            {event.name}
          </h3>

          {/* Meta stack */}
          <div className="space-y-2">
            <div className="font-mono text-sm">
              <span className="text-grey-dark">LOC://</span>
              <span className="text-white/80 ml-2">{event.venue}</span>
            </div>
            <div className="font-mono text-sm">
              <span className="text-grey-dark">SET://</span>
              <span className="text-white/60 ml-2">{event.lineup.join(' × ')}</span>
            </div>
          </div>

          {/* Expanded content */}
          <div
            className={clsx(
              'overflow-hidden transition-all duration-500',
              isExpanded ? 'max-h-64 opacity-100 mt-8' : 'max-h-0 opacity-0'
            )}
          >
            {event.description && (
              <p className="font-mono text-sm text-grey-mid mb-8 max-w-xl border-l-2 border-grey-dark/30 pl-4">
                {event.description}
              </p>
            )}

            {isSoldOut ? (
              <div className="inline-block">
                <span className="font-mono text-grey-dark line-through tracking-widest">
                  [VOID] NO ENTRY
                </span>
              </div>
            ) : (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-block"
              >
                <TerminalButton>ACQUIRE_ACCESS</TerminalButton>
              </a>
            )}
          </div>

          {/* Expand hint */}
          <div
            className={clsx(
              'absolute bottom-4 right-4 font-mono text-xs transition-all duration-300',
              isExpanded ? 'text-arterial' : 'text-grey-dark'
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
                'font-display text-[6rem] md:text-[10rem] text-arterial/20',
                'border-8 border-arterial/20 px-12 py-4',
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
