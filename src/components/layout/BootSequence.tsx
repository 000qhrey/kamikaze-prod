'use client'

import { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { initAudioEngine, play } from '@/hooks/useAudioEngine'
import { playBootSound } from '@/hooks/useSonicFeedback'

interface BootSequenceProps {
  onComplete: () => void
}

const BOOT_LINES = [
  { text: 'KAMIKAZE_SYSTEM v2.0.26', delay: 0 },
  { text: '> ESTABLISHING_UPLINK...', delay: 200 },
  { text: '> FREQUENCY_LOCK: 140BPM', delay: 600 },
  { text: '> AUDIO_CORE: STANDBY', delay: 900 },
  { text: '> SIGIL_MATRIX: LOADED', delay: 1200 },
  { text: '> VISUAL_SYNC: ENABLED', delay: 1500 },
  { text: '', delay: 1800 },
  { text: '[SYSTEM_READY]', delay: 2000 },
  { text: '', delay: 2200 },
  { text: '> CLICK_TO_INITIALIZE', delay: 2400 },
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [isReady, setIsReady] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [glitchFrame, setGlitchFrame] = useState(0)

  // Type out boot sequence
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

  // Glitch effect on ready
  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      setGlitchFrame((f) => (f + 1) % 10)
    }, 100)

    return () => clearInterval(interval)
  }, [isReady])

  const handleEnter = useCallback(() => {
    if (!isReady || isExiting) return

    // Initialize audio engine (this requires user interaction)
    initAudioEngine()

    // Play boot confirmation sound
    playBootSound()

    // Start exit animation
    setIsExiting(true)

    // After animation, complete
    setTimeout(() => {
      play() // Start playing
      onComplete()
    }, 1000)
  }, [isReady, isExiting, onComplete])

  // Handle keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleEnter])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] bg-void flex items-center justify-center cursor-pointer',
        'transition-all duration-1000',
        isExiting && 'opacity-0 scale-110'
      )}
      onClick={handleEnter}
    >
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* CRT flicker */}
      <div
        className={clsx(
          'absolute inset-0 pointer-events-none bg-arterial/5',
          'transition-opacity duration-75',
          glitchFrame % 3 === 0 ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Terminal content */}
      <div className="relative max-w-lg w-full px-8">
        {/* Terminal window */}
        <div className="border border-arterial/30 bg-void/80">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-arterial/20">
            <div className="w-3 h-3 rounded-full bg-arterial/60" />
            <div className="w-3 h-3 rounded-full bg-white/20/40" />
            <div className="w-3 h-3 rounded-full bg-white/20/40" />
            <span className="ml-4 font-mono text-xs text-white/70">KAMIKAZE://init</span>
          </div>

          {/* Terminal body */}
          <div className="p-6 font-mono text-sm space-y-1 min-h-[300px]">
            {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
              <div
                key={index}
                className={clsx(
                  'transition-all duration-200',
                  line.text.includes('SYSTEM_READY') && 'text-arterial font-bold',
                  line.text.includes('CLICK') && 'text-white animate-pulse mt-4',
                  !line.text.includes('SYSTEM_READY') && !line.text.includes('CLICK') && 'text-white/70'
                )}
              >
                {line.text}
                {index === visibleLines - 1 && !isReady && (
                  <span className="animate-pulse">_</span>
                )}
              </div>
            ))}

            {/* Ready state - big enter prompt */}
            {isReady && !isExiting && (
              <div className="mt-8 text-center">
                <div
                  className={clsx(
                    'inline-block text-4xl md:text-6xl font-display text-arterial',
                    'animate-pulse tracking-wider',
                    'transition-all duration-100',
                    glitchFrame % 5 === 0 && 'translate-x-1',
                    glitchFrame % 7 === 0 && '-translate-x-1'
                  )}
                  style={{
                    textShadow: `
                      ${glitchFrame % 3 === 0 ? '2px' : '0'} 0 #00ffff,
                      ${glitchFrame % 4 === 0 ? '-2px' : '0'} 0 #ff00ff
                    `,
                  }}
                >
                  ENTER
                </div>
                <div className="mt-4 text-white/50 text-xs tracking-widest">
                  [ PRESS ENTER OR CLICK ]
                </div>
              </div>
            )}

            {/* Exit animation - shatter effect */}
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

        {/* Bottom status bar */}
        <div className="flex justify-between items-center mt-2 font-mono text-[10px] text-white/50">
          <span>SYS_STATUS: {isReady ? 'READY' : 'LOADING'}</span>
          <span>AUDIO_CTX: {isReady ? 'AWAIT_INIT' : '---'}</span>
        </div>
      </div>

      {/* Corner decorations */}
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
        {isReady ? '[INTERACTIVE]' : '[LOADING...]'}
      </div>
    </div>
  )
}
