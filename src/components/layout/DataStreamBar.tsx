'use client'

import { useState, useEffect, useRef } from 'react'

const SYSTEM_CODES = [
  'LATENCY: 24MS',
  'SYSTEM_STATUS: STABLE',
  'SIGNAL_LOCK: ACTIVE',
  'FREQ: 140.2KHz',
  'BPM: 128',
  'BUFFER: 98%',
  'NODE: IN',
  'ENCRYPTION: AES-256',
  'ROUTING: IBLIIIZ_OTW',
  'PROTOCOL: UNDERGROUND',
]

export function DataStreamBar() {
  const [uptime, setUptime] = useState('00:00:00')
  const [glitchIndex, setGlitchIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const idx = Math.floor(Math.random() * SYSTEM_CODES.length)
        setGlitchIndex(idx)
        setTimeout(() => setGlitchIndex(-1), 100)
      }
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  const glitchText = (text: string, isGlitched: boolean) => {
    if (!isGlitched) return text
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789'
    return text
      .split('')
      .map((char) =>
        char === ' ' || char === ':' || char === '_'
          ? char
          : Math.random() > 0.5
            ? chars[Math.floor(Math.random() * chars.length)]
            : char
      )
      .join('')
  }

  return (
    <div className="border-y border-white/10 bg-black overflow-hidden">
      <div className="relative h-7 flex items-center">
        {/* Scrolling content */}
        <div
          ref={containerRef}
          className="flex items-center gap-8 whitespace-nowrap"
          style={{
            animation: 'scroll 40s linear infinite',
          }}
        >
          {/* Duplicate content for seamless loop */}
          {[...Array(2)].map((_, dupeIndex) => (
            <div key={dupeIndex} className="flex items-center gap-8 px-4">
              <span className="font-mono text-[10px] text-white/80">
                [ SYSTEM_LOG: 0xFF21 ]
              </span>

              {SYSTEM_CODES.map((code, index) => (
                <span
                  key={`${dupeIndex}-${index}`}
                  className="font-mono text-[10px] text-white/50"
                >
                  {glitchText(code, glitchIndex === index)}
                </span>
              ))}

              <span className="font-mono text-[10px] text-arterial">
                UPTIME: {uptime}
              </span>

              <span className="font-mono text-[10px] text-white/20">
                {'//'}{'//'}{'//'}{'//'}{'//'}{'//'}{'//'}{'//'}{'//'}{'//'}
              </span>
            </div>
          ))}
        </div>

        {/* Volume indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-white/60 bg-black px-2">
          VOL: <span className="text-arterial">■■■■</span><span className="text-white/30">□□□□</span>
        </div>
      </div>

      {/* Inline styles for scroll animation */}
      <style jsx>{`
        @keyframes scroll {
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
