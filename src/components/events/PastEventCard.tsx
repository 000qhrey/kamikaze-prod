'use client'

import { useState } from 'react'
import { Event, formatEventDate } from '@/data/events'
import clsx from 'clsx'

interface PastEventCardProps {
  event: Event
  index: number
}

export function PastEventCard({ event, index }: PastEventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={clsx(
        'relative group cursor-default',
        'transition-all duration-300'
      )}
      style={{
        marginLeft: `${(index % 3) * 20}px`,
        transform: `skewX(${index % 2 === 0 ? -1 : 1}deg)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content - horizontal brutalist layout */}
      <div
        className={clsx(
          'relative flex items-center gap-6 py-4 px-6',
          'border-l-2 border-grey-dark/30',
          'transition-all duration-300',
          isHovered ? 'border-l-4 border-arterial/50 bg-void/50' : ''
        )}
      >
        {/* Strike-through line */}
        <div
          className={clsx(
            'absolute left-0 right-0 top-1/2 h-px bg-grey-dark/20',
            'transition-opacity duration-300',
            isHovered ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Date - monospace, faded */}
        <span
          className={clsx(
            'font-mono text-sm tabular-nums',
            'transition-colors duration-300',
            isHovered ? 'text-arterial/60' : 'text-grey-dark'
          )}
        >
          {formatEventDate(event.date)}
        </span>

        {/* Event name */}
        <h3
          className={clsx(
            'font-display text-lg md:text-xl tracking-wide',
            'transition-all duration-300',
            isHovered ? 'text-white/80' : 'text-grey-mid/60'
          )}
        >
          {event.name}
        </h3>

        {/* Spacer */}
        <div className="flex-1" />

        {/* City */}
        <span
          className={clsx(
            'font-mono text-xs uppercase tracking-widest',
            'transition-colors duration-300',
            isHovered ? 'text-grey-mid' : 'text-grey-dark/50'
          )}
        >
          {event.city}
        </span>

        {/* Lineup - only on hover */}
        <div
          className={clsx(
            'absolute left-6 -bottom-6 font-mono text-xs text-grey-dark/60',
            'transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}
        >
          {event.lineup.join(' × ')}
        </div>
      </div>

      {/* Noise texture on hover */}
      <div
        className={clsx(
          'absolute inset-0 pointer-events-none',
          'transition-opacity duration-300',
          isHovered ? 'opacity-5' : 'opacity-0'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
