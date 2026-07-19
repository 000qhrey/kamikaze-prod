'use client'

/**
 * HomeFooter — the OLD site footer, restored on the poster homepage.
 *
 * Reuses the shared bits (MarqueeGlitch NO-VIP banner, DataStreamBar,
 * SignalStrengthLink, AscendButton) so it visually matches every other
 * route. Two differences from the interior-route Footer:
 *
 *  1. Uses plain `<a>` navigation — the homepage runs outside the
 *     TransitionProvider that the interior Footer relies on for its
 *     glitch page transitions. Regular anchors still respect Next's
 *     client-side router because there's no middleware to bypass.
 *  2. Hosts the FLAVOUR (JP ⇄ EN) toggle in the meta row.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { contactInfo } from '@/data/moto'
import { SignalStrengthLink } from '@/components/layout/SignalStrengthLink'
import { DataStreamBar } from '@/components/layout/DataStreamBar'
import { AscendButton } from '@/components/layout/AscendButton'
import { MarqueeGlitch } from '@/components/effects/MarqueeGlitch'
import { FOOTER_NAV } from '@/data/navigation'
import { useFlavour } from '@/providers/FlavourProvider'
import { HOME_COPY } from './homeCopy'
import { FlavourToggle } from './FlavourToggle'

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

/**
 * The interior Footer keeps its own local glitch-nav-link; we copy the
 * behaviour here so we don't drag `useTransition` into the homepage tree.
 */
function GlitchNavLink({ label, href }: { label: string; href: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(label)

  useEffect(() => {
    setDisplayLabel(label)
  }, [label])

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
              : char,
          )
          .join(''),
      )
    }, 40)

    return () => clearInterval(interval)
  }, [isHovered, label])

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`font-mono text-sm tracking-wider transition-colors ${
        isHovered ? 'text-arterial' : 'text-white/70'
      }`}
    >
      {displayLabel}
    </Link>
  )
}

export function HomeFooter() {
  const { t } = useFlavour()

  return (
    <footer className="relative z-[100] bg-black">
      {/* NO VIP Warning Banner — flavoured, marquee glitch */}
      <div className="relative bg-arterial/5 border-y border-arterial/20 py-3">
        <MarqueeGlitch
          text={t(HOME_COPY.motto.marquee)}
          className="font-mono text-[10px] sm:text-xs tracking-widest text-arterial"
          speed={40}
          glitchInterval={2500}
        />
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

      <DataStreamBar />

      <div className="py-10 px-6 border-t border-[#9f9fa9]/20">
        <div className="max-w-7xl mx-auto">
          {/* Navigation — plain anchors so we don't need TransitionProvider */}
          <div className="mb-10">
            <span className="font-mono text-[10px] text-white/40 tracking-[0.3em] block mb-4">
              [ NAVIGATION ]
            </span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3">
              {FOOTER_NAV.map((link) => (
                <GlitchNavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
          </div>

          {/* Social + email */}
          <div className="mb-8">
            <span className="font-mono text-[10px] text-white/40 tracking-[0.3em] block mb-4">
              [ FOLLOW ]
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-3">
                <SignalStrengthLink
                  href={contactInfo.instagramUrl}
                  label="Instagram"
                  strength={3}
                />
                <SignalStrengthLink
                  href="https://soundcloud.com/k-a-m-i-k-a-z-e-6-6-6"
                  label="SoundCloud"
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

          {/* Meta row — copyright, flavour, ascend */}
          <div className="flex flex-col gap-4 pt-6 border-t border-[#9f9fa9]/10">
            {/* FLAVOUR sits on its own row so the toggle stays readable on mobile */}
            <div className="flex items-center justify-center sm:justify-start">
              <FlavourToggle />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="font-mono text-[10px] text-[#9f9fa9] tracking-wider flex flex-wrap items-center justify-center sm:justify-start gap-x-1">
                <span>&copy; {new Date().getFullYear()} Kamikaze</span>
                <span className="text-[#9f9fa9]/40">{'//'}</span>
                <span>GLOBAL</span>
                <span className="text-[#9f9fa9]/40">{'//'}</span>
                <span>STAY_UNDERGROUND</span>
                <span className="text-[#9f9fa9]/40">{'//'}</span>
                <Link
                  href="/privacy"
                  className="text-[#9f9fa9]/60 hover:text-arterial transition-colors"
                >
                  PRIVACY
                </Link>
              </div>

              <AscendButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
