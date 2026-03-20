'use client'

import { useState, useEffect } from 'react'

interface SignalStrengthLinkProps {
  href: string
  label: string
  strength: number // 0-10
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

export function SignalStrengthLink({
  href,
  label,
  strength,
}: SignalStrengthLinkProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayStrength, setDisplayStrength] = useState(strength)
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchedLabel, setGlitchedLabel] = useState(label)

  // Fill bars on hover
  useEffect(() => {
    if (isHovered) {
      let currentStrength = strength
      const interval = setInterval(() => {
        currentStrength += 1
        if (currentStrength > 10) {
          clearInterval(interval)
          return
        }
        setDisplayStrength(currentStrength)
      }, 50)
      return () => clearInterval(interval)
    } else {
      setDisplayStrength(strength)
    }
  }, [isHovered, strength])

  // Glitch effect on hover
  useEffect(() => {
    if (!isHovered) {
      setGlitchedLabel(label)
      return
    }

    setIsGlitching(true)
    let frame = 0
    const maxFrames = 8

    const interval = setInterval(() => {
      frame++
      if (frame >= maxFrames) {
        setGlitchedLabel(label)
        setIsGlitching(false)
        clearInterval(interval)
        return
      }

      setGlitchedLabel(
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

  const bars = Array.from({ length: 10 }, (_, i) => {
    const isFilled = i < displayStrength
    const isAnimating = isHovered && i >= strength && i < displayStrength

    return (
      <span
        key={i}
        className={`
          inline-block w-[6px] transition-all duration-75
          ${isFilled ? 'text-arterial' : 'text-white/30'}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        |
      </span>
    )
  })

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 font-mono text-sm transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`
          font-bold transition-colors duration-200
          ${isHovered ? 'text-arterial' : 'text-white/80'}
          ${isGlitching ? 'animate-glitch' : ''}
        `}
      >
        {glitchedLabel}
      </span>
      <span className="text-white/40">[</span>
      <span className="tracking-[-0.2em]">{bars}</span>
      <span className="text-white/40">]</span>
    </a>
  )
}
