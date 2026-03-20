'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTransition } from '@/providers/TransitionProvider'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { MobileNav } from './MobileNav'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'ARTISTS' },
  { href: '/contact', label: 'CONTACT' },
]

export function Navigation() {
  const pathname = usePathname()
  const { navigateTo } = useTransition()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [sigilHovered, setSigilHovered] = useState(false)

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      navigateTo(href)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Sigil Logo */}
          <button
            onClick={() => handleNavClick('/')}
            onMouseEnter={() => setSigilHovered(true)}
            onMouseLeave={() => setSigilHovered(false)}
            className="relative w-9 h-9 flex items-center justify-center"
            aria-label="Home"
          >
            <div
              className={clsx(
                'w-full h-full bg-white transition-transform duration-500',
                sigilHovered ? 'animate-fast-rotate' : 'animate-slow-rotate'
              )}
              style={{
                maskImage: `url(${getAssetPath('/sequence/1.png')})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${getAssetPath('/sequence/1.png')})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
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
            className="md:hidden w-9 h-9 flex items-center justify-center"
            aria-label="Open menu"
          >
            <div
              className="w-full h-full bg-white"
              style={{
                maskImage: `url(${getAssetPath('/sequence/1.png')})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${getAssetPath('/sequence/1.png')})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
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
