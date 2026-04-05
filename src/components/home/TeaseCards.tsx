'use client'

import { useRef, useState, useEffect } from 'react'
import { TelemetryCard } from '@/components/ui/TelemetryCard'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import { useTransition } from '@/providers/TransitionProvider'
import { getUpcomingEvents, formatEventDate } from '@/data/events'
import { artists } from '@/data/artists'
import { useIsMobile } from '@/hooks/useIsMobile'

// Asymmetric positioning offsets (y-axis stagger)
const CARD_OFFSETS = [
  { y: -20, parallax: 0.04 },  // Event card - higher
  { y: 40, parallax: 0.06 },   // Artist card - lower
  { y: 0, parallax: 0.03 },    // Stats card - center
]

export function TeaseCards() {
  const { navigateTo } = useTransition()
  const upcomingEvents = getUpcomingEvents()
  const nextEvent = upcomingEvents[0]
  const featuredArtist = artists[0]
  const sectionRef = useRef<HTMLElement>(null)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const isMobile = useIsMobile()

  // Track mouse position relative to section center
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const x = (e.clientX - centerX) / (rect.width / 2)
      const y = (e.clientY - centerY) / (rect.height / 2)

      setMouseOffset({ x, y })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate parallax transform for each card
  const getParallaxStyle = (index: number) => {
    const config = CARD_OFFSETS[index]
    const mouseX = mouseOffset.x * config.parallax * 80
    const mouseY = mouseOffset.y * config.parallax * 80
    const scrollParallax = scrollY * config.parallax * 0.1

    return {
      transform: `translate(${mouseX}px, ${mouseY + config.y - scrollParallax}px)`,
      transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  }

  return (
    <section ref={sectionRef} className="py-32 px-6 relative">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-arterial tracking-[0.3em]">
            [ TELEMETRY_FEED ]
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-arterial/30 to-transparent" />
          <span className="font-mono text-[10px] text-white/50">
            LIVE_DATA_STREAM
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Next Event - positioned higher */}
          <div style={getParallaxStyle(0)} className="md:mt-0">
            <GlitchSlice delay={0}>
              <TelemetryCard
                metadata="DATA_SOURCE: EVENT_UPLINK"
                onClick={() => navigateTo('/events')}
              >
                <div className="min-h-[180px] flex flex-col">
                  <span className="font-mono text-[10px] text-white/50 tracking-widest mb-3">
                    &gt; INCOMING_TRANSMISSION
                  </span>
                  {nextEvent ? (
                    <>
                      <span className="font-mono text-xs text-arterial mb-2 tracking-wider">
                        {nextEvent.isSecretLocation ? 'XX.??.2026' : formatEventDate(nextEvent.date)}
                      </span>
                      <h3 className="font-display text-2xl mb-3 tracking-wide">
                        {nextEvent.name}
                      </h3>
                      <div className="mt-auto pt-4 border-t border-white/30/20">
                        <p className="font-mono text-[10px] text-white/70 tracking-wider">
                          LOC: {nextEvent.isSecretLocation ? '████████' : nextEvent.venue}
                        </p>
                        <p className="font-mono text-[10px] text-white/50">
                          COORD: {nextEvent.isSecretLocation ? '█████████' : nextEvent.city.toUpperCase()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="font-mono text-white/70 text-sm">
                      NO_ACTIVE_SIGNALS
                    </p>
                  )}
                </div>
              </TelemetryCard>
            </GlitchSlice>
          </div>

          {/* Featured Artist - positioned lower */}
          <div style={getParallaxStyle(1)} className="md:mt-16">
            <GlitchSlice delay={0.1}>
              <TelemetryCard
                metadata="SIGNAL_TYPE: ARTIST_NODE"
                onClick={() => navigateTo('/artists')}
              >
                <div className="min-h-[180px] flex flex-col">
                  <span className="font-mono text-[10px] text-white/50 tracking-widest mb-3">
                    &gt; FEATURED_FREQUENCY
                  </span>
                  <h3 className="font-display text-2xl mb-2 tracking-wide">
                    {featuredArtist.name}
                  </h3>
                  <p className="font-mono text-xs text-arterial/70 mb-3">
                    {featuredArtist.location}
                  </p>
                  <div className="mt-auto">
                    <p className="font-mono text-[10px] text-white/70 leading-relaxed line-clamp-2">
                      {featuredArtist.bio.split('\n')[0]}
                    </p>
                  </div>
                </div>
              </TelemetryCard>
            </GlitchSlice>
          </div>

          {/* Mobile: Merch Card | Desktop: System Status */}
          <div style={getParallaxStyle(2)} className="md:mt-8">
            <GlitchSlice delay={0.2}>
              {isMobile ? (
                <TelemetryCard
                  metadata="DATA_SOURCE: SUPPLY_CACHE"
                  onClick={() => navigateTo('/merch')}
                >
                  <div className="min-h-[180px] flex flex-col">
                    <span className="font-mono text-[10px] text-white/50 tracking-widest mb-3">
                      &gt; EQUIPMENT_DROP
                    </span>
                    <h3 className="font-display text-2xl mb-2 tracking-wide">
                      ARTIFACTS
                    </h3>
                    <p className="font-mono text-xs text-arterial/70 mb-3">
                      UNDERGROUND GEAR
                    </p>
                    <div className="flex-1 flex flex-col justify-center gap-2 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">CACHE_STATUS</span>
                        <span className="font-mono text-[10px] text-signal">ONLINE</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">ACCESS_LEVEL</span>
                        <span className="font-mono text-[10px] text-arterial">UNRESTRICTED</span>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-white/30/20">
                      <div className="font-mono text-[10px] text-white/60 text-center tracking-widest">
                        [ BROWSE GEAR ]
                      </div>
                    </div>
                  </div>
                </TelemetryCard>
              ) : (
                <TelemetryCard metadata="ENCRYPTION: AES-256-GCM">
                  <div className="min-h-[180px] flex flex-col">
                    <span className="font-mono text-[10px] text-white/50 tracking-widest mb-3">
                      &gt; SYS_DIAGNOSTICS
                    </span>
                    <div className="flex-1 flex flex-col justify-center gap-2 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">UPLINK_STATUS</span>
                        <span className="font-mono text-[10px] text-signal">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">FREQ_LOCK</span>
                        <span className="font-mono text-[10px] text-arterial">140.2kHz</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">PROTOCOL</span>
                        <span className="font-mono text-[10px] text-white/70">UNDERGROUND_V2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">MESH_NODES</span>
                        <span className="font-mono text-[10px] text-white/70">47 CONNECTED</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/50">LATENCY</span>
                        <span className="font-mono text-[10px] text-signal">12ms</span>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-white/30/20">
                      <div className="font-mono text-[8px] text-white/50 text-center tracking-widest">
                        [ SIGNAL_INTEGRITY: NOMINAL ]
                      </div>
                    </div>
                  </div>
                </TelemetryCard>
              )}
            </GlitchSlice>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-8 font-mono text-[8px] text-white/50/50 hidden md:block">
        [ SCROLL_DEPTH: ACTIVE ]
      </div>
      <div className="absolute bottom-8 right-8 font-mono text-[8px] text-white/50/50 hidden md:block">
        [ PARALLAX_SYNC: ENABLED ]
      </div>
    </section>
  )
}
