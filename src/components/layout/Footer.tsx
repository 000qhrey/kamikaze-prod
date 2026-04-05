'use client'

import { useState, useEffect } from 'react'
import { contactInfo } from '@/data/moto'
import { SignalStrengthLink } from './SignalStrengthLink'
import { DataStreamBar } from './DataStreamBar'
import { AscendButton } from './AscendButton'
import { MarqueeGlitch } from '@/components/effects/MarqueeGlitch'
import { useTransition } from '@/providers/TransitionProvider'

// Footer navigation links - easy access without hunting for menu
const FOOTER_NAV = [
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'SIGNALS' },
  { href: '/merch', label: 'MERCH' },
  { href: '/about', label: 'MANIFESTO' },
  { href: '/contact', label: 'CONTACT' },
]

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

// Glitch text nav link component
function GlitchNavLink({
  label,
  onClick
}: {
  label: string
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(label)

  useEffect(() => {
    if (!isHovered) {
      setDisplayLabel(label)
      return
    }

    let frame = 0
    const maxFrames = 8

    const interval = setInterval(() => {
      frame++
      if (frame >= maxFrames) {
        setDisplayLabel(label)
        clearInterval(interval)
        return
      }

      setDisplayLabel(
        label
          .split('')
          .map((char) =>
            Math.random() > 0.5
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : char
          )
          .join('')
      )
    }, 40)

    return () => clearInterval(interval)
  }, [isHovered, label])

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`font-mono text-sm tracking-wider transition-colors ${
        isHovered ? 'text-arterial' : 'text-white/70'
      }`}
    >
      {displayLabel}
    </button>
  )
}

export function Footer() {
  const { navigateTo } = useTransition()

  return (
    <footer className="relative z-[100] bg-black">
      {/* NO VIP Warning Banner - Marquee Glitch */}
      <div className="relative bg-arterial/5 border-y border-arterial/20 py-3">
        <MarqueeGlitch
          text="[!] WARNING: NO VIP. NO BACKSTAGE. ONE SOUL. ONE TICKET. ONE DANCEFLOOR."
          className="font-mono text-[10px] sm:text-xs tracking-widest text-arterial"
          speed={40}
          glitchInterval={2500}
        />
        {/* Subtle scanline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(204, 0, 0, 0.1) 2px,
              rgba(204, 0, 0, 0.1) 4px
            )`,
          }}
        />
      </div>

      {/* Data Stream Status Bar */}
      <DataStreamBar />

      {/* Main Footer Content */}
      <div className="py-10 px-6 border-t border-[#9f9fa9]/20">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Links - Like Teletech */}
          <div className="mb-10">
            <span className="font-mono text-[10px] text-white/40 tracking-[0.3em] block mb-4">
              [ NAVIGATION ]
            </span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3">
              {FOOTER_NAV.map((link) => (
                <GlitchNavLink
                  key={link.href}
                  label={link.label}
                  onClick={() => navigateTo(link.href)}
                />
              ))}
            </div>
          </div>

          {/* Network Links - Socials */}
          <div className="mb-8">
            <span className="font-mono text-[10px] text-white/40 tracking-[0.3em] block mb-4">
              [ NETWORK ]
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <SignalStrengthLink
                  href={contactInfo.instagramUrl}
                  label="IG"
                  strength={3}
                />
                <SignalStrengthLink
                  href="https://soundcloud.com/kamikaze-events"
                  label="SC"
                  strength={7}
                />
              </div>

              <a
                href={`mailto:${contactInfo.email}`}
                className="font-mono text-xs text-[#9f9fa9] hover:text-arterial transition-colors"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>

          {/* Bottom Row: Copyright & Location */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#9f9fa9]/10">
            <div className="font-mono text-[10px] text-[#9f9fa9] tracking-wider flex flex-wrap items-center justify-center sm:justify-start gap-x-1">
              <span>&copy; {new Date().getFullYear()} KAMIKAZE</span>
              <span className="text-[#9f9fa9]/40">{'//'}</span>
              <span>GLOBAL</span>
              <span className="text-[#9f9fa9]/40">{'//'}</span>
              <span>STAY_UNDERGROUND</span>
              <span className="text-[#9f9fa9]/40">{'//'}</span>
              <button
                onClick={() => navigateTo('/privacy')}
                className="text-[#9f9fa9]/60 hover:text-arterial transition-colors"
              >
                PRIVACY
              </button>
            </div>

            <AscendButton />
          </div>
        </div>
      </div>
    </footer>
  )
}
