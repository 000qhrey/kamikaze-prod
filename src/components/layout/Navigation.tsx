'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useTransition } from '@/providers/TransitionProvider'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { MobileNav } from './MobileNav'
import { playHoverSound } from '@/hooks/useSonicFeedback'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'SIGNALS' },
  { href: '/about', label: 'MANIFESTO' },
  { href: '/merch', label: 'ARTIFACTS' },
  { href: '/contact', label: 'CONTACT' },
]

const GLITCH_CHARS = '▓▒░█▄▀■□●○◆◇▲△▼▽◀▶◁▷★☆⬛⬜'
const KANJI_TEXT = '神風'
const BATTERY_TEXT = '▓▓▓▓▓▓▓'
const FULL_TEXT = 'UNDERGROUND WILL NEVER DIE'

type HoverPhase = 'kanji' | 'battery' | 'full'

export function Navigation() {
  const pathname = usePathname()
  const { navigateTo } = useTransition()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoverPhase, setHoverPhase] = useState<HoverPhase>('kanji')
  const [displayText, setDisplayText] = useState(KANJI_TEXT)
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const morphIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      navigateTo(href)
    }
  }

  // Morphing animation
  const morphTo = useCallback((targetText: string, fromText: string) => {
    // Clear any existing morph animation
    if (morphIntervalRef.current) {
      clearInterval(morphIntervalRef.current)
    }

    const maxLength = Math.max(targetText.length, fromText.length)
    let frame = 0
    const totalFrames = 20

    morphIntervalRef.current = setInterval(() => {
      frame++

      if (frame >= totalFrames) {
        setDisplayText(targetText)
        if (morphIntervalRef.current) {
          clearInterval(morphIntervalRef.current)
          morphIntervalRef.current = null
        }
        return
      }

      const progress = frame / totalFrames
      const revealedCount = Math.floor(progress * targetText.length)

      // Build the morphing string
      let result = ''
      for (let i = 0; i < maxLength; i++) {
        if (i < revealedCount) {
          // Revealed character from target
          result += targetText[i] || ''
        } else if (i < targetText.length) {
          // Random glitch character
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }
      }

      setDisplayText(result)
    }, 30)
  }, [])

  // Handle hover phase transitions
  useEffect(() => {
    if (hoverPhase === 'kanji') {
      morphTo(KANJI_TEXT, displayText)
    } else if (hoverPhase === 'battery') {
      morphTo(BATTERY_TEXT, displayText)
      // Start dwell timer for phase 2 -> phase 3
      dwellTimerRef.current = setTimeout(() => {
        setHoverPhase('full')
      }, 1000)
    } else if (hoverPhase === 'full') {
      morphTo(FULL_TEXT, displayText)
    }

    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current)
        dwellTimerRef.current = null
      }
    }
  }, [hoverPhase, morphTo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (morphIntervalRef.current) {
        clearInterval(morphIntervalRef.current)
      }
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current)
      }
    }
  }, [])

  const handleLogoMouseEnter = () => {
    setHoverPhase('battery')
  }

  const handleLogoMouseLeave = () => {
    // Clear dwell timer and reset to kanji
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
    setHoverPhase('kanji')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Morphing Logo */}
          <button
            onClick={() => handleNavClick('/')}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            className="relative flex items-center"
            aria-label="Home"
          >
            <span
              className={clsx(
                'font-mono text-sm tracking-wider transition-all duration-300',
                hoverPhase !== 'kanji' ? 'text-white' : 'text-white/80'
              )}
              style={{
                textShadow: hoverPhase !== 'kanji' ? '0 0 20px rgba(204, 0, 0, 0.6)' : 'none',
                minWidth: hoverPhase === 'full' ? '220px' : '80px',
              }}
            >
              {displayText}
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  onMouseEnter={playHoverSound}
                  className={clsx(
                    'relative font-display text-sm tracking-widest transition-all duration-300',
                    isActive
                      ? 'text-white scale-105'
                      : 'text-white/85 hover:text-white'
                  )}
                  style={{
                    textShadow: isActive ? '0 0 20px rgba(204, 0, 0, 0.5)' : 'none',
                  }}
                >
                  <ScrambleText
                    triggerOnHover
                    triggerOnView={false}
                    duration={300}
                  >
                    {link.label}
                  </ScrambleText>
                  {/* Drip indicator for active */}
                  {isActive && (
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-arterial rounded-b-full"
                      style={{
                        animation: 'drip-pulse 2s ease-in-out infinite',
                        boxShadow: '0 0 10px rgba(204, 0, 0, 0.8)',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden font-mono text-sm text-white tracking-wider"
            aria-label="Open menu"
          >
            [MENU]
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        links={NAV_LINKS}
        currentPath={pathname}
        onNavigate={handleNavClick}
      />

      <style jsx>{`
        @keyframes drip-pulse {
          0%, 100% { height: 12px; }
          50% { height: 16px; }
        }
      `}</style>
    </>
  )
}
