'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'

interface BootSequenceProps {
  onComplete: () => void
}

const BOOT_LINES = [
  { text: 'KAMIKAZE_SYSTEM v2.0.26', delay: 0 },
  { text: '> Connecting...', delay: 200 },
  { text: '> Loading visuals...', delay: 600 },
  { text: '> Audio: standby (press play later)', delay: 900 },
  { text: '> Almost ready...', delay: 1200 },
  { text: '', delay: 1500 },
  { text: '[SYSTEM_READY]', delay: 1800 },
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [isReady, setIsReady] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [glitchFrame, setGlitchFrame] = useState(0)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    BOOT_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1)
        if (index === BOOT_LINES.length - 1) {
          setIsReady(true)
        }
      }, line.delay)
      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      setGlitchFrame((f) => (f + 1) % 10)
    }, 100)

    return () => clearInterval(interval)
  }, [isReady])

  useEffect(() => {
    if (!isReady || isExiting) return

    const exitTimer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onComplete(), 1000)
    }, 1200)

    return () => clearTimeout(exitTimer)
  }, [isReady, isExiting, onComplete])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] bg-void flex items-center justify-center',
        'transition-all duration-1000',
        isExiting && 'opacity-0 scale-110'
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      <div
        className={clsx(
          'absolute inset-0 pointer-events-none bg-arterial/5',
          'transition-opacity duration-75',
          glitchFrame % 3 === 0 ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div className="relative max-w-lg w-full px-8">
        <div className="border border-arterial/30 bg-void/80">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-arterial/20">
            <div className="w-3 h-3 rounded-full bg-arterial/60" />
            <div className="w-3 h-3 rounded-full bg-white/20/40" />
            <div className="w-3 h-3 rounded-full bg-white/20/40" />
            <span className="ml-4 font-mono text-xs text-white/70">KAMIKAZE://init</span>
          </div>

          <div className="p-6 font-mono text-sm space-y-1 min-h-[300px]">
            {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
              <div
                key={index}
                className={clsx(
                  'transition-all duration-200',
                  line.text.includes('SYSTEM_READY') && 'text-arterial font-bold',
                  !line.text.includes('SYSTEM_READY') && 'text-white/70'
                )}
              >
                {line.text}
                {index === visibleLines - 1 && !isReady && (
                  <span className="animate-pulse">_</span>
                )}
              </div>
            ))}

            {isExiting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-8xl font-display text-arterial animate-ping"
                  style={{
                    textShadow: '0 0 60px #cc0000, 0 0 120px #cc0000',
                  }}
                >
                  K
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 font-mono text-[10px] text-white/50">
          <span>SYS_STATUS: {isReady ? 'READY' : 'LOADING'}</span>
          <span>AUDIO: OFF UNTIL YOU PRESS PLAY</span>
        </div>
      </div>

      <div className="absolute top-4 left-4 font-mono text-[10px] text-white/50">
        [BOOT_SEQ_2026.03.25]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-arterial/50">
        KAMIKAZE_NET
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/50">
        THE UNDERGROUND WILL NEVER DIE
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white/50">
        {isReady ? '[CONNECTING...]' : '[LOADING...]'}
      </div>
    </div>
  )
}
