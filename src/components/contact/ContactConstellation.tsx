'use client'

import { useState, useEffect } from 'react'
import { contactInfo } from '@/data/moto'
import { CyberSigil } from './CyberSigil'
import { useIsMobile } from '@/hooks/useIsMobile'
import clsx from 'clsx'

interface ContactItem {
  label: string
  value: string
  href?: string
  // Position at spike tip (spike index 0-7, 0 = top)
  spikeIndex: number
  // Distance from center
  distance: number
}

const CONTACT_ITEMS: ContactItem[] = [
  {
    label: 'GENERAL',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    spikeIndex: 7, // top-left spike
    distance: 200,
  },
  {
    label: 'BOOKING',
    value: contactInfo.booking,
    href: `mailto:${contactInfo.booking}`,
    spikeIndex: 1, // top-right spike
    distance: 200,
  },
  {
    label: 'INSTAGRAM',
    value: contactInfo.instagram,
    href: contactInfo.instagramUrl,
    spikeIndex: 4, // bottom spike
    distance: 190,
  },
]

// Glitch text effect component
function GlitchText({ text, isVisible, delay }: { text: string; isVisible: boolean; delay: number }) {
  const [displayText, setDisplayText] = useState('')
  const [glitchPhase, setGlitchPhase] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('')
      setGlitchPhase(0)
      return
    }

    // Start glitch after delay
    const startTimeout = setTimeout(() => {
      let phase = 0
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

      const interval = setInterval(() => {
        phase++
        setGlitchPhase(phase)

        if (phase <= 8) {
          // Glitch phase - random characters
          const glitched = text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' '
              if (i < phase * (text.length / 8)) {
                return char
              }
              return glitchChars[Math.floor(Math.random() * glitchChars.length)]
            })
            .join('')
          setDisplayText(glitched)
        } else {
          // Settled
          setDisplayText(text)
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [isVisible, text, delay])

  return (
    <span className={clsx(
      'font-mono transition-opacity duration-200',
      glitchPhase > 0 && glitchPhase <= 8 && 'text-arterial'
    )}>
      {displayText || '\u00A0'}
    </span>
  )
}

export function ContactConstellation() {
  const [isRevealed, setIsRevealed] = useState(false)
  const isMobile = useIsMobile()

  // Auto-reveal on mobile after a short delay
  useEffect(() => {
    if (isMobile) {
      const timeout = setTimeout(() => setIsRevealed(true), 500)
      return () => clearTimeout(timeout)
    }
  }, [isMobile])

  // Calculate position based on spike index - reduced distance on mobile
  const getSpikePosition = (spikeIndex: number, distance: number) => {
    // 8 spikes, starting from top (index 0 = -90deg)
    const angle = (spikeIndex * 360) / 8 - 90
    const rad = (angle * Math.PI) / 180
    // Reduce distance on mobile
    const adjustedDistance = isMobile ? distance * 0.6 : distance

    return {
      x: Math.cos(rad) * adjustedDistance,
      y: Math.sin(rad) * adjustedDistance,
    }
  }

  // Mobile layout - stacked cards
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-8 py-8">
        {/* Sigil - smaller on mobile */}
        <div className="relative">
          <CyberSigil isActive={isRevealed} onHover={setIsRevealed} />
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-2 h-2 animate-pulse',
            isRevealed ? 'bg-signal' : 'bg-arterial/60'
          )} />
          <span className={clsx(
            'font-mono text-xs tracking-[0.3em]',
            isRevealed ? 'text-signal' : 'text-white/50'
          )}>
            {isRevealed ? 'UPLINK_ACTIVE' : 'AWAIT_INPUT'}
          </span>
        </div>

        {/* Contact items - stacked on mobile */}
        <div className="flex flex-col gap-4 w-full max-w-sm px-4">
          {CONTACT_ITEMS.map((item, index) => (
            <div
              key={item.label}
              className={clsx(
                'relative bg-void/80 border border-white/20 px-4 py-4',
                'hover:border-arterial/50 transition-all duration-300',
                'transform',
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block group"
                >
                  <span className="font-mono text-[10px] text-arterial/60 block mb-2 tracking-[0.3em]">
                    [{item.label}]
                  </span>
                  <div className="text-sm text-white/80 group-hover:text-arterial transition-colors font-mono">
                    {item.value}
                  </div>
                </a>
              ) : (
                <div>
                  <span className="font-mono text-[10px] text-arterial/60 block mb-2 tracking-[0.3em]">
                    [{item.label}]
                  </span>
                  <div className="text-sm text-white/80 font-mono">
                    {item.value}
                  </div>
                </div>
              )}

              {/* Corner thorns */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-arterial/40" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-arterial/40" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-arterial/40" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-arterial/40" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Desktop layout - constellation pattern
  return (
    <div className="relative flex items-center justify-center min-h-[70vh]">
      {/* Wire frame decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Diagonal wires */}
        <div
          className={clsx(
            'absolute w-px bg-gradient-to-b from-transparent via-white/20/30 to-transparent h-[200%] transition-opacity duration-700',
            isRevealed ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            left: '20%',
            top: '-50%',
            transform: 'rotate(15deg)',
          }}
        />
        <div
          className={clsx(
            'absolute w-px bg-gradient-to-b from-transparent via-white/20/30 to-transparent h-[200%] transition-opacity duration-700',
            isRevealed ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            right: '25%',
            top: '-50%',
            transform: 'rotate(-20deg)',
          }}
        />
      </div>

      {/* The Sigil */}
      <CyberSigil isActive={isRevealed} onHover={setIsRevealed} />

      {/* Contact items at spike tips */}
      {CONTACT_ITEMS.map((item, index) => {
        const pos = getSpikePosition(item.spikeIndex, item.distance)
        const glitchDelay = 200 + index * 150

        return (
          <div
            key={item.label}
            className={clsx(
              'absolute transition-all duration-500',
              isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            style={{
              left: '50%',
              top: '50%',
              transform: isRevealed
                ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                : 'translate(-50%, -50%) scale(0.8)',
              transitionDelay: isRevealed ? `${index * 100}ms` : '0ms',
            }}
          >
            {/* Connecting wire from sigil to contact */}
            <div
              className={clsx(
                'absolute w-8 h-px bg-arterial/40 transition-all duration-300',
                isRevealed ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                left: pos.x > 0 ? 'auto' : '100%',
                right: pos.x > 0 ? '100%' : 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />

            <div
              className={clsx(
                'relative bg-void/80 border border-white/30/30 px-4 py-3',
                'hover:border-arterial/50 transition-colors duration-300',
                'before:absolute before:inset-0 before:bg-arterial/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity'
              )}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block text-center group relative z-10"
                >
                  <span className="font-mono text-[10px] text-arterial/60 block mb-1 tracking-[0.3em]">
                    [{item.label}]
                  </span>
                  <div className="text-sm text-white/80 group-hover:text-arterial transition-colors">
                    <GlitchText
                      text={item.value}
                      isVisible={isRevealed}
                      delay={glitchDelay}
                    />
                  </div>
                </a>
              ) : (
                <div className="text-center relative z-10">
                  <span className="font-mono text-[10px] text-arterial/60 block mb-1 tracking-[0.3em]">
                    [{item.label}]
                  </span>
                  <div className="text-sm text-white/80">
                    <GlitchText
                      text={item.value}
                      isVisible={isRevealed}
                      delay={glitchDelay}
                    />
                  </div>
                </div>
              )}

              {/* Corner thorns */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-arterial/40" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-arterial/40" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-arterial/40" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-arterial/40" />
            </div>
          </div>
        )
      })}

      {/* Status indicator */}
      <div
        className={clsx(
          'absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-500',
          isRevealed ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-arterial/60 animate-pulse" />
          <span className="font-mono text-xs text-white/50 tracking-[0.3em]">
            AWAIT_INPUT
          </span>
        </div>
      </div>

      {/* Active state indicator */}
      <div
        className={clsx(
          'absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-500',
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-signal animate-pulse" />
          <span className="font-mono text-xs text-signal tracking-[0.3em]">
            UPLINK_ACTIVE
          </span>
        </div>
      </div>
    </div>
  )
}
