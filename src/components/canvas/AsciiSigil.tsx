'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { getBass, getMids, getHighs } from '@/hooks/useAudioEngine'
import { Genre, GENRE_FREQUENCIES } from '@/data/signals'

// ============================================
// SHARED STATE FOR GENRE FREQUENCY HOVER
// ============================================
let activeGenre: Genre | null = null
let isHovering = false
const listeners: Set<() => void> = new Set()

export function setActiveFrequency(genre: Genre | null, hover: boolean) {
  activeGenre = genre
  isHovering = hover
  listeners.forEach((fn) => fn())
}

function getActiveFrequency() {
  return { genre: activeGenre, isHovering }
}

function useActiveFrequency() {
  const [state, setState] = useState({ genre: activeGenre, isHovering })

  useEffect(() => {
    const update = () => setState({ genre: activeGenre, isHovering })
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])

  return state
}

// ============================================
// ASCII SIGIL PATTERNS
// Genre-specific esoteric shapes
// ============================================

const SIGIL_CHARS = '0123456789:;+=~?!|/\\<>[]{}()#@$%^&*-_.,'

// Default / INDUSTRIAL_BOUNCE - transmission tower
const SIGIL_INDUSTRIAL = `
                                  |
                                  |
                             .----+----.
                            /     |     \\
                           /      |      \\
                     .----+-------+-------+----.
                    /      \\      |      /      \\
                   /        \\     |     /        \\
              .---+----------\\----+----/----------+---.
             /     \\          \\   |   /          /     \\
            /       \\          \\  |  /          /       \\
       .---+---------\\----------\\-+-/---------/---------+---.
      /     \\         \\          \\|/          /         /     \\
     /       \\         \\          +          /         /       \\
    +=========+==========+=========+=========+==========+=========+
     \\       /         /          +          \\         \\       /
      \\     /         /          /|\\          \\         \\     /
       '---+---------/----------/-+-\\----------\\---------+---'
            \\       /          /  |  \\          \\       /
             \\     /          /   |   \\          \\     /
              '---+----------/----+----\\----------+---'
                   \\        /     |     \\        /
                    \\      /      |      \\      /
                     '----+-------+-------+----'
                            \\     |     /
                             \\    |    /
                              '---+---'
                                  |
                                  |
`

// DARK_TECHNO - void portal
const SIGIL_DARK = `
              _______________________________________________
             /                                               \\
            /    .----------------------------------------.    \\
           /    /                                          \\    \\
          /    /     .-------------------------------.      \\    \\
         /    /     /                                 \\      \\    \\
        /    /     /      .--------------------.       \\      \\    \\
       /    /     /      /                      \\       \\      \\    \\
      |    |     |      |      .---------.       |       |      |    |
      |    |     |      |     /           \\      |       |      |    |
      |    |     |      |    |    .--.     |     |       |      |    |
      |    |     |      |    |   |    |    |     |       |      |    |
      |    |     |      |    |    '--'     |     |       |      |    |
      |    |     |      |     \\           /      |       |      |    |
      |    |     |      |      '---------'       |       |      |    |
       \\    \\     \\      \\                      /       /      /    /
        \\    \\     \\      '--------------------'       /      /    /
         \\    \\     \\                                 /      /    /
          \\    \\     '-------------------------------'      /    /
           \\    \\                                          /    /
            \\    '----------------------------------------'    /
             \\_______________________________________________/
`

// ACID - corrosive hexagram
const SIGIL_ACID = `
                              .
                             /|\\
                            / | \\
                           /  |  \\
                          /   |   \\
                         / .--+--.  \\
                        / /   |   \\ \\
                       / /    |    \\ \\
                      +-+-----+-----+-+
                     /|  \\    |    /  |\\
                    / |   \\   |   /   | \\
                   /  |    \\  |  /    |  \\
                  /   |     \\ | /     |   \\
                 /    |      \\|/      |    \\
                +-----+-------+-------+-----+
                 \\    |      /|\\      |    /
                  \\   |     / | \\     |   /
                   \\  |    /  |  \\    |  /
                    \\ |   /   |   \\   | /
                     \\|  /    |    \\  |/
                      +-+-----+-----+-+
                       \\ \\    |    / /
                        \\ \\   |   / /
                         \\ '--+--' /
                          \\   |   /
                           \\  |  /
                            \\ | /
                             \\|/
                              '
`

// HARDCORE - shattered star
const SIGIL_HARDCORE = `
                                    *
                                   /|\\
                                  / | \\
                            *----/--+--\\----*
                             \\  /   |   \\  /
                              \\/    |    \\/
                              /\\    |    /\\
                             /  \\   |   /  \\
                    *-------/----\\--+--/----\\-------*
                     \\     /      \\ | /      \\     /
                      \\   /        \\|/        \\   /
                       \\ /          *          \\ /
                        *          /|\\          *
                       / \\        / | \\        / \\
                      /   \\      /  |  \\      /   \\
                     /     \\    /   |   \\    /     \\
            *-------/-------\\--+----+----+--/-------\\-------*
                     \\     /    \\   |   /    \\     /
                      \\   /      \\  |  /      \\   /
                       \\ /        \\ | /        \\ /
                        *          \\|/          *
                       / \\          *          / \\
                      /   \\        /|\\        /   \\
                     /     \\      / | \\      /     \\
                    *-------\\----/--+--\\----/-------*
                             \\  /   |   \\  /
                              \\/    |    \\/
                              /\\    |    /\\
                             /  \\   |   /  \\
                            *----\\--+--/----*
                                  \\ | /
                                   \\|/
                                    *
`

// GABBER - speed burst
const SIGIL_GABBER = `
                         >>>>>>>>>>>>>>>>>>>>>>>
                        >>                     >>
                       >>   ===============     >>
                      >>   ||             ||     >>
                     >>    ||    /////    ||      >>
                    >>     ||   ///////   ||       >>
                   >>      ||  /////////  ||        >>
                  >>       || /////////// ||         >>
                 >>        ||/////////////||          >>
                >>         |||||||||||||||||           >>
                >>         |||||||||||||||||           >>
                 >>        ||\\\\\\\\\\\\\\||          >>
                  >>       || \\\\\\\\\\\\ ||         >>
                   >>      ||  \\\\\\\\\\  ||        >>
                    >>     ||   \\\\\\\\   ||       >>
                     >>    ||    \\\\\\    ||      >>
                      >>   ||             ||     >>
                       >>   ===============     >>
                        >>                     >>
                         >>>>>>>>>>>>>>>>>>>>>>>
`

// BREAKCORE - fragmented chaos
const SIGIL_BREAKCORE = `
           /\\      /\\      /\\      /\\      /\\      /\\
          /  \\    /  \\    /  \\    /  \\    /  \\    /  \\
         /    \\  /    \\  /    \\  /    \\  /    \\  /    \\
        /      \\/      \\/      \\/      \\/      \\/      \\
       |   /\\   |  /\\   |  /\\   |  /\\   |  /\\   |  /\\   |
       |  /  \\  | /  \\  | /  \\  | /  \\  | /  \\  | /  \\  |
       | /    \\ |/    \\ |/    \\ |/    \\ |/    \\ |/    \\ |
       |/      \\|      \\|      \\|      \\|      \\|      \\|
       |\\      /|\\      /|\\      /|\\      /|\\      /|\\      /|
       | \\    / | \\    / | \\    / | \\    / | \\    / | \\    / |
       |  \\  /  |  \\  /  |  \\  /  |  \\  /  |  \\  /  |  \\  /  |
       |   \\/   |   \\/   |   \\/   |   \\/   |   \\/   |   \\/   |
        \\      /\\      /\\      /\\      /\\      /\\      /
         \\    /  \\    /  \\    /  \\    /  \\    /  \\    /
          \\  /    \\  /    \\  /    \\  /    \\  /    \\  /
           \\/      \\/      \\/      \\/      \\/      \\/
`

// EBM - machine grid
const SIGIL_EBM = `
        +------+------+------+------+------+------+
        |      |      |      |      |      |      |
        | [01] | [02] | [03] | [04] | [05] | [06] |
        |      |      |      |      |      |      |
        +------+------+------+------+------+------+
        |      |      |      |      |      |      |
        | [07] | [08] | [09] | [10] | [11] | [12] |
        |      |      |      |      |      |      |
        +------+------+------+------+------+------+
        |      |      |      |      |      |      |
        | [13] | [14] | [##] | [##] | [15] | [16] |
        |      |      |      |      |      |      |
        +------+------+------+------+------+------+
        |      |      |      |      |      |      |
        | [17] | [18] | [##] | [##] | [19] | [20] |
        |      |      |      |      |      |      |
        +------+------+------+------+------+------+
        |      |      |      |      |      |      |
        | [21] | [22] | [23] | [24] | [25] | [26] |
        |      |      |      |      |      |      |
        +------+------+------+------+------+------+
`

// NOISE - static interference
const SIGIL_NOISE = `
    .:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@
    #@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*
    *#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=
    =*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+
    +=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;
    ;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:
    .:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@
    #@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*
    *#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=
    =*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+
    +=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;
    ;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:
    .:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@.:;+=*#@
`

// AMBIENT_DRONE - minimal void
const SIGIL_AMBIENT = `


                              .
                             . .
                            .   .
                           .     .
                          .       .
                         .         .
                        .           .
                       .             .
                      .               .
                     .                 .
                    .                   .
                   .                     .
                  .         . .           .
                 .        .     .          .
                .       .         .         .
               .      .             .        .
              .     .                 .       .
             .    .                     .      .
            .   .                         .     .
           .  .                             .    .


`

// Map genres to their sigils
const GENRE_SIGILS: Record<Genre, string> = {
  INDUSTRIAL_BOUNCE: SIGIL_INDUSTRIAL,
  DARK_TECHNO: SIGIL_DARK,
  ACID: SIGIL_ACID,
  HARDCORE: SIGIL_HARDCORE,
  GABBER: SIGIL_GABBER,
  BREAKCORE: SIGIL_BREAKCORE,
  EBM: SIGIL_EBM,
  NOISE: SIGIL_NOISE,
  AMBIENT_DRONE: SIGIL_AMBIENT,
}

const DEFAULT_SIGIL = SIGIL_INDUSTRIAL

// All sigils for auto-cycling
const ALL_SIGILS = [
  SIGIL_INDUSTRIAL,
  SIGIL_DARK,
  SIGIL_ACID,
  SIGIL_HARDCORE,
  SIGIL_GABBER,
  SIGIL_BREAKCORE,
  SIGIL_EBM,
  SIGIL_NOISE,
  SIGIL_AMBIENT,
]

// Colors for auto-cycling (genre-inspired but independent)
const SIGIL_COLORS = [
  { color: '#3a9a9a', glow: 'rgba(0, 255, 255, 0.4)' },    // cyan (default)
  { color: '#cc0000', glow: 'rgba(204, 0, 0, 0.5)' },      // arterial red
  { color: '#00cc00', glow: 'rgba(0, 204, 0, 0.5)' },      // acid green
  { color: '#9933ff', glow: 'rgba(153, 51, 255, 0.5)' },   // purple
  { color: '#ff6600', glow: 'rgba(255, 102, 0, 0.5)' },    // orange
  { color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.5)' },    // yellow
  { color: '#ff0066', glow: 'rgba(255, 0, 102, 0.5)' },    // magenta
  { color: '#00ffcc', glow: 'rgba(0, 255, 204, 0.5)' },    // teal
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.3)' },  // white
]

// ============================================
// GLITCH EFFECT UTILITIES
// ============================================

function glitchChar(char: string, intensity: number = 0.1): string {
  if (char === ' ' || char === '\n') return char
  if (Math.random() > intensity) return char
  return SIGIL_CHARS[Math.floor(Math.random() * SIGIL_CHARS.length)]
}

function glitchLine(line: string, intensity: number = 0.1): string {
  return line
    .split('')
    .map((c) => glitchChar(c, intensity))
    .join('')
}

function glitchSigil(sigil: string, intensity: number = 0.1): string {
  return sigil
    .split('\n')
    .map((line) => {
      // Random chance to offset entire line (horizontal glitch)
      if (Math.random() < intensity * 0.5) {
        const offset = Math.floor(Math.random() * 8) - 4
        if (offset > 0) return ' '.repeat(offset) + line
        if (offset < 0) return line.slice(-offset)
      }
      return glitchLine(line, intensity)
    })
    .join('\n')
}

// ============================================
// SCANLINE EFFECT
// ============================================

function ScanlineOverlay({ color = 'rgba(0, 204, 204, 0.15)' }: { color?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          ${color} 2px,
          ${color} 4px
        )`,
      }}
    />
  )
}

// ============================================
// MAIN ASCII SIGIL COMPONENT WITH AUDIO REACTIVITY
// ============================================

export function AsciiSigilBackground() {
  const [mounted, setMounted] = useState(false)
  const [displayText, setDisplayText] = useState(DEFAULT_SIGIL)
  const [currentColor, setCurrentColor] = useState('#3a9a9a')
  const [glowColor, setGlowColor] = useState('rgba(0, 255, 255, 0.4)')
  const [scale, setScale] = useState(1)
  const [glitchIntensity, setGlitchIntensity] = useState(0.02)

  const frameRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const currentSigilRef = useRef<string>(DEFAULT_SIGIL)
  const targetSigilRef = useRef<string>(DEFAULT_SIGIL)
  const transitionRef = useRef<number>(0)
  const currentSigilIndexRef = useRef<number>(0)
  const currentColorIndexRef = useRef<number>(0)
  const autoCycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to genre hover changes
  const { genre, isHovering } = useActiveFrequency()

  // Auto-cycle sigils when not hovering on a specific genre
  useEffect(() => {
    if (!mounted) return

    const triggerAutoCycle = () => {
      // Only auto-cycle if not hovering on a genre
      if (!isHovering) {
        // Pick a different random sigil
        let newSigilIndex = currentSigilIndexRef.current
        while (newSigilIndex === currentSigilIndexRef.current && ALL_SIGILS.length > 1) {
          newSigilIndex = Math.floor(Math.random() * ALL_SIGILS.length)
        }
        currentSigilIndexRef.current = newSigilIndex
        targetSigilRef.current = ALL_SIGILS[newSigilIndex]

        // Pick a different random color
        let newColorIndex = currentColorIndexRef.current
        while (newColorIndex === currentColorIndexRef.current && SIGIL_COLORS.length > 1) {
          newColorIndex = Math.floor(Math.random() * SIGIL_COLORS.length)
        }
        currentColorIndexRef.current = newColorIndex
        const newColor = SIGIL_COLORS[newColorIndex]
        setCurrentColor(newColor.color)
        setGlowColor(newColor.glow)

        // Trigger heavy shatter transition
        transitionRef.current = 1.0
      }

      // Schedule next cycle (random 5-10 seconds)
      const nextDelay = 5000 + Math.random() * 5000
      autoCycleTimerRef.current = setTimeout(triggerAutoCycle, nextDelay)
    }

    // Start first cycle after initial delay
    const initialDelay = 3000 + Math.random() * 2000
    autoCycleTimerRef.current = setTimeout(triggerAutoCycle, initialDelay)

    return () => {
      if (autoCycleTimerRef.current) {
        clearTimeout(autoCycleTimerRef.current)
      }
    }
  }, [mounted, isHovering])

  // Update sigil and colors when genre changes
  useEffect(() => {
    if (genre && GENRE_SIGILS[genre]) {
      targetSigilRef.current = GENRE_SIGILS[genre]
      const genreConfig = GENRE_FREQUENCIES[genre]

      // Set color based on genre - use full color for visibility
      const hexColor = genreConfig.color
      setCurrentColor(hexColor)
      // Parse hex to rgba for glow
      const r = parseInt(hexColor.slice(1, 3), 16)
      const g = parseInt(hexColor.slice(3, 5), 16)
      const b = parseInt(hexColor.slice(5, 7), 16)
      setGlowColor(`rgba(${r}, ${g}, ${b}, 0.5)`)
    } else {
      targetSigilRef.current = DEFAULT_SIGIL
      setCurrentColor('#3a9a9a')
      setGlowColor('rgba(0, 255, 255, 0.4)')
    }

    // Trigger transition effect
    transitionRef.current = 1.0
  }, [genre])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation loop with audio reactivity
  useEffect(() => {
    if (!mounted) return

    const animate = (time: number) => {
      const delta = time - lastUpdateRef.current

      // Update at ~30fps for performance
      if (delta > 33) {
        lastUpdateRef.current = time

        // Get audio levels
        const bass = getBass()
        const mids = getMids()
        const highs = getHighs()

        // Bass affects scale (the "bop")
        const bassScale = 1 + bass * 0.08 // subtle 8% scale on kick
        setScale(bassScale)

        // Calculate glitch intensity
        // Base glitch + bass spike + transition spike
        let intensity = 0.01 // base
        intensity += bass * 0.15 // bass adds glitch
        intensity += mids * 0.05 // mids add subtle glitch

        // During transition, increase glitch
        if (transitionRef.current > 0) {
          intensity += transitionRef.current * 0.3
          transitionRef.current = Math.max(0, transitionRef.current - 0.05)

          // Swap to new sigil midway through transition
          if (transitionRef.current < 0.5 && currentSigilRef.current !== targetSigilRef.current) {
            currentSigilRef.current = targetSigilRef.current
          }
        }

        setGlitchIntensity(intensity)

        // Apply glitch to current sigil
        setDisplayText(glitchSigil(currentSigilRef.current, intensity))
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 -z-10 overflow-hidden overflow-x-hidden',
        'flex items-center justify-center',
        'bg-[#050505]',
        'transition-colors duration-500'
      )}
    >
      {/* Main sigil with audio-reactive scale */}
      <pre
        className={clsx(
          'font-mono text-[3px] xs:text-[4px] sm:text-[8px] md:text-[10px] lg:text-sm',
          'select-none whitespace-pre',
          'transition-transform duration-75' // fast transition for bop
        )}
        style={{
          color: currentColor,
          textShadow: `
            0 0 10px ${glowColor},
            0 0 20px ${glowColor},
            0 0 40px ${glowColor},
            0 0 80px ${glowColor}
          `,
          lineHeight: 1.1,
          transform: `scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {displayText}
      </pre>

      {/* Scanline overlay with genre color */}
      <ScanlineOverlay color={glowColor} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(${glowColor} 1px, transparent 1px),
            linear-gradient(90deg, ${glowColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Genre indicator (visible on hover) */}
      {isHovering && genre && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest opacity-50 transition-opacity duration-300"
          style={{ color: GENRE_FREQUENCIES[genre].color }}
        >
          [{genre.replace(/_/g, ' ')}]
        </div>
      )}
    </div>
  )
}

export default AsciiSigilBackground
