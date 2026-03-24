'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTransition } from '@/providers/TransitionProvider'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { MobileNav } from './MobileNav'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'ARTISTS' },
  { href: '/merch', label: 'ARTIFACTS' },
  { href: '/contact', label: 'CONTACT' },
]

const GLITCH_CHARS = '▓▒░█▄▀■□●○◆◇▲△▼▽◀▶◁▷★☆⬛⬜'
const TARGET_TEXT = 'UNDERGROUND NEVER DIES'
const BLOB_TEXT = '▓▓▓▓▓▓▓'

export function Navigation() {
  const pathname = usePathname()
  const { navigateTo } = useTransition()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [displayText, setDisplayText] = useState(BLOB_TEXT)

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      navigateTo(href)
    }
  }

  // Morphing animation
  const morphTo = useCallback((targetText: string, fromText: string) => {
    const maxLength = Math.max(targetText.length, fromText.length)
    let frame = 0
    const totalFrames = 20

    const interval = setInterval(() => {
      frame++

      if (frame >= totalFrames) {
        setDisplayText(targetText)
        clearInterval(interval)
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

    return () => clearInterval(interval)
  }, [])

  // Handle hover state changes
  useEffect(() => {
    if (logoHovered) {
      return morphTo(TARGET_TEXT, BLOB_TEXT)
    } else {
      return morphTo(BLOB_TEXT, TARGET_TEXT)
    }
  }, [logoHovered, morphTo])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Morphing Logo */}
          <button
            onClick={() => handleNavClick('/')}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="relative flex items-center"
            aria-label="Home"
          >
            <span
              className={clsx(
                'font-mono text-sm tracking-wider transition-all duration-300',
                logoHovered ? 'text-white' : 'text-grey-mid'
              )}
              style={{
                textShadow: logoHovered ? '0 0 20px rgba(204, 0, 0, 0.6)' : 'none',
                minWidth: logoHovered ? '220px' : '80px',
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
                  className={clsx(
                    'relative font-display text-sm tracking-widest transition-all duration-300',
                    isActive
                      ? 'text-white scale-105'
                      : 'text-grey-dark/60 hover:text-grey-mid'
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
            className="md:hidden font-mono text-xs text-grey-mid"
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
