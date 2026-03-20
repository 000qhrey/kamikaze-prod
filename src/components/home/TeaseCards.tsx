'use client'

import { useRef, useState, useEffect } from 'react'
import { JaggedCard } from '@/components/ui/JaggedCard'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import { useTransition } from '@/providers/TransitionProvider'
import { getUpcomingEvents, formatEventDate } from '@/data/events'
import { artists } from '@/data/artists'

// Parallax multipliers for each card (different depths)
const PARALLAX_DEPTHS = [0.03, 0.05, 0.02]

export function TeaseCards() {
  const { navigateTo } = useTransition()
  const upcomingEvents = getUpcomingEvents()
  const nextEvent = upcomingEvents[0]
  const featuredArtist = artists[0]
  const sectionRef = useRef<HTMLElement>(null)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  // Track mouse position relative to section center
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Normalize to -1 to 1 range
      const x = (e.clientX - centerX) / (rect.width / 2)
      const y = (e.clientY - centerY) / (rect.height / 2)

      setMouseOffset({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Calculate parallax transform for each card
  const getParallaxStyle = (index: number) => {
    const depth = PARALLAX_DEPTHS[index] || 0.03
    const x = mouseOffset.x * depth * 100
    const y = mouseOffset.y * depth * 100
    return {
      transform: `translate(${x}px, ${y}px)`,
      transition: 'transform 0.3s ease-out',
    }
  }

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Next Event */}
          <div style={getParallaxStyle(0)}>
            <GlitchSlice delay={0}>
              <JaggedCard
                className="p-8 h-full"
                onClick={() => navigateTo('/events')}
              >
                <div className="h-full flex flex-col">
                  <span className="font-mono text-xs text-grey-mid mb-4">
                    NEXT EVENT
                  </span>
                  {nextEvent ? (
                    <>
                      <span className="font-mono text-sm text-red-bright mb-2">
                        {formatEventDate(nextEvent.date)}
                      </span>
                      <h3 className="font-display text-2xl mb-2">
                        {nextEvent.name}
                      </h3>
                      <p className="font-mono text-sm text-grey-mid mt-auto">
                        {nextEvent.venue}, {nextEvent.city}
                      </p>
                    </>
                  ) : (
                    <p className="font-mono text-grey-mid">
                      No upcoming events
                    </p>
                  )}
                </div>
              </JaggedCard>
            </GlitchSlice>
          </div>

          {/* Featured Artist */}
          <div style={getParallaxStyle(1)}>
            <GlitchSlice delay={0.1}>
              <JaggedCard
                className="p-8 h-full"
                onClick={() => navigateTo(`/artists`)}
              >
                <div className="h-full flex flex-col">
                  <span className="font-mono text-xs text-grey-mid mb-4">
                    FEATURED ARTIST
                  </span>
                  <h3 className="font-display text-2xl mb-2">
                    {featuredArtist.name}
                  </h3>
                  <p className="font-mono text-sm text-grey-mid mb-4">
                    {featuredArtist.location}
                  </p>
                  <p className="font-mono text-xs text-grey-mid line-clamp-3 mt-auto">
                    {featuredArtist.bio.split('\n')[0]}
                  </p>
                </div>
              </JaggedCard>
            </GlitchSlice>
          </div>

          {/* Label Stat */}
          <div style={getParallaxStyle(2)}>
            <GlitchSlice delay={0.2}>
              <JaggedCard className="p-8 h-full">
                <div className="h-full flex flex-col">
                  <span className="font-mono text-xs text-grey-mid mb-4">
                    SINCE 2024
                  </span>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-display text-5xl text-red-bright">
                      12K+
                    </span>
                    <span className="font-mono text-sm text-grey-mid mt-2">
                      Bodies moved through sound
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-grey-dark">
                    <span className="font-mono text-xs text-grey-mid">
                      6 EVENTS / 24 ARTISTS / 4 CITIES
                    </span>
                  </div>
                </div>
              </JaggedCard>
            </GlitchSlice>
          </div>
        </div>
      </div>
    </section>
  )
}
