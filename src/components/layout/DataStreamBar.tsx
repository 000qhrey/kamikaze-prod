'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import clsx from 'clsx'

// ============================================
// SYSTEM DATA CONFIG
// ============================================

// Static codes - BRIGHT VIVID COLORS (red, yellow, green, white)
const STATIC_CODES = [
  // Audio/DJ data - bright and visible
  { key: 'BPM', dynamicKey: 'bpm', color: 'text-red-500' },
  { key: 'FREQ', value: '40.2Hz', color: 'text-white' },
  { key: 'KICK', value: 'LOCKED', color: 'text-green-400' },
  { key: 'BASS', dynamicKey: 'bass', color: 'text-red-400' },
  { key: 'dB', dynamicKey: 'db', color: 'text-yellow-400' },
  { key: 'PEAK', value: 'OK', color: 'text-green-400' },

  // System/Network
  { key: 'BUFFER', value: '98%', color: 'text-green-400' },
  { key: 'LATENCY', value: '12ms', color: 'text-yellow-400' },
  { key: 'NODE', value: 'SYNC', color: 'text-white' },
  { key: 'ENCRYPTION', value: 'AES-256', color: 'text-yellow-300' },

  // Venue/Rave data
  { key: 'ZONE', value: 'MAIN_FLOOR', color: 'text-white' },
  { key: 'CAPACITY', dynamicKey: 'capacity', color: 'text-yellow-400' },
  { key: 'TEMP', dynamicKey: 'temp', color: 'text-red-400' },
  { key: 'HAZE', value: 'ACTIVE', color: 'text-green-400' },
  { key: 'STROBE', value: '8Hz', color: 'text-yellow-300' },

  // Identity/Protocol
  { key: 'ROUTING', value: 'IBLIIIZ_OTW', color: 'text-white' },
  { key: 'PROTOCOL', value: 'INDEPENDENT', color: 'text-red-500' },
  { key: 'ACCESS', value: 'ONE_FLOOR', color: 'text-green-400' },
] as const

// 神風 takeover phrases - used during full 5-second takeover
const KAMIKAZE_PHRASES = [
  '神風',
  '神風_SYSTEM',
  '死ぬ覚悟',
  'カミカゼ',
  '地下',
  '暴走',
  'NO_VIP_神風',
  '信号_受信中',
  'UNDERGROUND_神風',
  '破壊',
  '狂気',
  '無秩序',
]

// Generate random 神風 stream text for takeover
function generateTakeoverStream(): string {
  const items: string[] = []
  for (let i = 0; i < 20; i++) {
    items.push(KAMIKAZE_PHRASES[Math.floor(Math.random() * KAMIKAZE_PHRASES.length)])
  }
  return items.join(' // ')
}

type DynamicValues = {
  bass: string
  bpm: string
  capacity: string
  temp: string
  db: string
}

function getCodeValue(
  code: (typeof STATIC_CODES)[number],
  dynamicValues: DynamicValues
): string {
  if ('dynamicKey' in code && code.dynamicKey) {
    return dynamicValues[code.dynamicKey as keyof DynamicValues]
  }
  return code.value || ''
}

// Cyber glitch characters - 神風 aesthetic (Japanese heavy)
const GLITCH_CHARS = '神風死暴走地下01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン█▓▒░'
const CORRUPTION_CHARS = '神風カミカゼ!@#$%^&*死暴走地下信号'

// ============================================
// GLITCH UTILITIES
// ============================================

function glitchString(str: string, intensity: number = 0.3): string {
  return str
    .split('')
    .map((char) => {
      if (char === ' ' || char === ':') return char
      if (Math.random() < intensity) {
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      }
      return char
    })
    .join('')
}

function corruptString(str: string, intensity: number = 0.5): string {
  return str
    .split('')
    .map((char) => {
      if (char === ' ') return char
      if (Math.random() < intensity) {
        return CORRUPTION_CHARS[Math.floor(Math.random() * CORRUPTION_CHARS.length)]
      }
      return char
    })
    .join('')
}


// ============================================
// GLITCH LINE - Horizontal interference
// ============================================

function GlitchLines() {
  const [lines, setLines] = useState<{ y: number; width: number; id: number }[]>([])

  useEffect(() => {
    let lineId = 0

    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        const newLine = {
          id: lineId++,
          y: Math.random() * 100,
          width: 20 + Math.random() * 80,
        }
        setLines((prev) => [...prev.slice(-3), newLine])

        // Remove after flash
        setTimeout(() => {
          setLines((prev) => prev.filter((l) => l.id !== newLine.id))
        }, 50 + Math.random() * 100)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((line) => (
        <div
          key={line.id}
          className="absolute h-[1px]"
          style={{
            top: `${line.y}%`,
            left: `${(100 - line.width) / 2}%`,
            width: `${line.width}%`,
            background: Math.random() > 0.5
              ? 'linear-gradient(90deg, transparent, #cc0000, transparent)'
              : 'linear-gradient(90deg, transparent, #eab308, transparent)',
            boxShadow: Math.random() > 0.5
              ? '0 0 8px rgba(204, 0, 0, 0.8)'
              : '0 0 8px rgba(234, 179, 8, 0.8)',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// DATA ITEM COMPONENT
// ============================================

interface DataItemProps {
  dataKey: string
  value: string
  colorClass: string
  isGlitching: boolean
  isCorrupted: boolean
}

function DataItem({ dataKey, value, colorClass, isGlitching, isCorrupted }: DataItemProps) {
  const displayValue = isCorrupted
    ? corruptString(value, 0.6)
    : isGlitching
      ? glitchString(value, 0.4)
      : value

  return (
    <span
      className={clsx(
        'font-mono text-[10px] transition-all duration-75',
        isGlitching && 'animate-pulse',
        isCorrupted && 'text-arterial'
      )}
      style={{
        textShadow: isGlitching
          ? '-1px 0 #eab308, 1px 0 #cc0000, 0 0 8px currentColor'
          : isCorrupted
            ? '0 0 10px #ff0000'
            : undefined,
        transform: isGlitching ? `translateX(${Math.random() * 2 - 1}px)` : undefined,
      }}
    >
      <span className="text-white/70">{dataKey}: </span>
      <span className={colorClass}>{displayValue}</span>
    </span>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

// Dynamic value generators
function generateBassBar(): string {
  const level = 4 + Math.floor(Math.random() * 5) // 4-8 filled
  return '▓'.repeat(level) + '░'.repeat(8 - level)
}

function generateBPM(): string {
  return String(140 + Math.floor(Math.random() * 20)) // 140-159
}

function generateCapacity(): string {
  return String(75 + Math.floor(Math.random() * 20)) + '%' // 75-94%
}

function generateTemp(): string {
  return String(28 + Math.floor(Math.random() * 8)) + '°C' // 28-35°C
}

function generateDB(): string {
  const db = -6 + Math.random() * 5 // -6 to -1
  return db.toFixed(1)
}

export function DataStreamBar() {
  const [uptime, setUptime] = useState('00:00:00')
  const [glitchIndices, setGlitchIndices] = useState<Set<number>>(new Set())
  const [corruptedIndex, setCorruptedIndex] = useState<number | null>(null)
  const [systemLogGlitch, setSystemLogGlitch] = useState(false)
  const [crtFlicker, setCrtFlicker] = useState(false)
  // Full 5-second takeover mode
  const [isTakeoverActive, setIsTakeoverActive] = useState(false)
  const [takeoverStream, setTakeoverStream] = useState('')
  const [dynamicValues, setDynamicValues] = useState({
    bass: generateBassBar(),
    bpm: generateBPM(),
    capacity: generateCapacity(),
    temp: generateTemp(),
    db: generateDB(),
  })

  // Update uptime every second
  useEffect(() => {
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const hours = Math.floor(elapsed / 3600000)
      const minutes = Math.floor((elapsed % 3600000) / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setUptime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update dynamic rave values
  useEffect(() => {
    // Bass updates fast (simulates audio reactivity)
    const bassInterval = setInterval(() => {
      setDynamicValues((prev) => ({ ...prev, bass: generateBassBar(), db: generateDB() }))
    }, 150)

    // BPM fluctuates occasionally
    const bpmInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setDynamicValues((prev) => ({ ...prev, bpm: generateBPM() }))
      }
    }, 3000)

    // Venue stats update slowly
    const venueInterval = setInterval(() => {
      setDynamicValues((prev) => ({
        ...prev,
        capacity: generateCapacity(),
        temp: generateTemp(),
      }))
    }, 8000)

    return () => {
      clearInterval(bassInterval)
      clearInterval(bpmInterval)
      clearInterval(venueInterval)
    }
  }, [])

  // Random glitch effects - MORE FREQUENT
  useEffect(() => {
    // Standard glitch - multiple items at once (more frequent)
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.3) { // was 0.6 - now 70% chance
        const count = 1 + Math.floor(Math.random() * 4) // 1-4 items
        const indices = new Set<number>()
        for (let i = 0; i < count; i++) {
          indices.add(Math.floor(Math.random() * STATIC_CODES.length))
        }
        setGlitchIndices(indices)
        setTimeout(() => setGlitchIndices(new Set()), 50 + Math.random() * 100)
      }
    }, 800) // was 1500

    // Corruption burst - more frequent
    const corruptInterval = setInterval(() => {
      if (Math.random() > 0.6) { // was 0.85
        const idx = Math.floor(Math.random() * STATIC_CODES.length)
        setCorruptedIndex(idx)
        setTimeout(() => setCorruptedIndex(null), 120)
      }
    }, 2000) // was 4000

    // System log glitch - more frequent
    const sysLogInterval = setInterval(() => {
      if (Math.random() > 0.4) { // was 0.7
        setSystemLogGlitch(true)
        setTimeout(() => setSystemLogGlitch(false), 80)
      }
    }, 1500) // was 3000

    // CRT flicker - more frequent
    const flickerInterval = setInterval(() => {
      if (Math.random() > 0.7) { // was 0.9
        setCrtFlicker(true)
        setTimeout(() => setCrtFlicker(false), 40)
      }
    }, 1000) // was 2000

    // 神風 TAKEOVER - Full 5-second stream takeover every 15-30 seconds
    const scheduleNextTakeover = () => {
      const delay = 15000 + Math.random() * 15000 // 15-30 seconds
      return setTimeout(() => {
        // Start takeover
        setIsTakeoverActive(true)
        setTakeoverStream(generateTakeoverStream())

        // Update stream text rapidly during takeover for "hacked" effect
        const streamUpdateInterval = setInterval(() => {
          setTakeoverStream(generateTakeoverStream())
        }, 200)

        // End takeover after 5 seconds
        setTimeout(() => {
          setIsTakeoverActive(false)
          clearInterval(streamUpdateInterval)
          // Schedule next takeover
          scheduleNextTakeover()
        }, 5000)
      }, delay)
    }

    const takeoverTimeout = scheduleNextTakeover()

    return () => {
      clearInterval(glitchInterval)
      clearInterval(corruptInterval)
      clearInterval(sysLogInterval)
      clearInterval(flickerInterval)
      clearTimeout(takeoverTimeout)
    }
  }, [])

  const systemLogDisplay = isTakeoverActive
    ? `[ 神風_OVERRIDE ]`
    : systemLogGlitch
      ? glitchString('[ SYSTEM_LOG: 0xFF21 ]', 0.5)
      : '[ SYSTEM_LOG: 0xFF21 ]'

  return (
    <div
      className={clsx(
        'relative border-y bg-black overflow-hidden transition-all duration-300',
        crtFlicker && 'opacity-80',
        isTakeoverActive
          ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
          : 'border-arterial/20'
      )}
    >
      {/* Scanline overlay - red tint */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(204, 0, 0, 0.15) 1px,
            rgba(204, 0, 0, 0.15) 2px
          )`,
        }}
      />


      {/* Glitch lines */}
      <GlitchLines />

      <div className="relative h-8 flex items-center">
        {/* Scrolling content */}
        <div
          className="flex items-center gap-6 whitespace-nowrap"
          style={{
            animation: 'dataScroll 50s linear infinite',
          }}
        >
          {/* Duplicate content for seamless loop */}
          {[0, 1].map((dupeIndex) => (
            <div key={dupeIndex} className="flex items-center gap-6 px-4">
              {/* System Log */}
              <span
                className={clsx(
                  'font-mono text-[10px]',
                  isTakeoverActive ? 'text-red-500' : 'text-green-400',
                  systemLogGlitch && 'text-yellow-300'
                )}
                style={{
                  textShadow: isTakeoverActive
                    ? '0 0 10px #ef4444, 0 0 20px #ef4444'
                    : systemLogGlitch
                      ? '-2px 0 #eab308, 2px 0 #ef4444, 0 0 10px #ef4444'
                      : '0 0 8px rgba(74, 222, 128, 0.5)',
                }}
              >
                {systemLogDisplay}
              </span>

              {/* Separator */}
              <span className="text-white/40 font-mono text-[10px]">│</span>

              {/* Content: Normal data OR takeover stream */}
              {isTakeoverActive ? (
                // 神風 TAKEOVER MODE - Full Japanese stream
                <span
                  className="font-mono text-[10px] text-red-500 animate-pulse"
                  style={{
                    textShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444',
                    letterSpacing: '2px',
                  }}
                >
                  {takeoverStream}
                </span>
              ) : (
                // Normal data items
                <>
                  {STATIC_CODES.map((code, index) => (
                    <DataItem
                      key={`${dupeIndex}-${index}`}
                      dataKey={code.key}
                      value={getCodeValue(code, dynamicValues)}
                      colorClass={code.color}
                      isGlitching={glitchIndices.has(index)}
                      isCorrupted={corruptedIndex === index}
                    />
                  ))}
                </>
              )}

              {/* Separator */}
              <span className="text-white/40 font-mono text-[10px]">│</span>

              {/* Uptime or takeover timer */}
              <span className="font-mono text-[10px]">
                <span className="text-white/70">
                  {isTakeoverActive ? '神風_MODE: ' : 'UPTIME: '}
                </span>
                <span
                  className={isTakeoverActive ? 'text-red-500 animate-pulse' : 'text-red-500'}
                  style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
                >
                  {isTakeoverActive ? 'ACTIVE' : uptime}
                </span>
              </span>

              {/* Decorative slashes or takeover chars */}
              <span
                className={clsx(
                  'font-mono text-[10px]',
                  isTakeoverActive ? 'text-red-500/70' : 'text-yellow-500/50'
                )}
                style={{ letterSpacing: '-1px' }}
              >
                {isTakeoverActive ? '神風神風神風神風神風神風' : '////////////////////'}
              </span>
            </div>
          ))}
        </div>

        {/* Static indicators on right */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3 px-4 bg-gradient-to-l from-black via-black to-transparent">
          {/* Signal indicator */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[8px] text-white/70">SIG</span>
            <div className="flex gap-[2px]">
              {[0.9, 0.8, 0.6, 0.4, 0.2].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-green-400"
                  style={{
                    height: `${h * 12}px`,
                    opacity: i < 3 ? 1 : 0.4,
                    boxShadow: i < 3 ? '0 0 4px rgba(74, 222, 128, 0.6)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Status LED */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
              style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 1)' }}
            />
            <span className="font-mono text-[8px] text-green-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Inline styles for scroll animation */}
      <style jsx>{`
        @keyframes dataScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
