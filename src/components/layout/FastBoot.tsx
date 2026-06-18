'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { BOOT } from '@/data/siteCopy'

interface FastBootProps {
  onComplete: () => void
}

export function FastBoot({ onComplete }: FastBootProps) {
  const [phase, setPhase] = useState<'loading' | 'welcome' | 'done'>('loading')
  const [glitchFrame, setGlitchFrame] = useState(0)

  useEffect(() => {
    if (phase !== 'loading') return

    const interval = setInterval(() => {
      setGlitchFrame((f) => (f + 1) % 10)
    }, 100)

    const welcomeTimer = setTimeout(() => setPhase('welcome'), 800)

    return () => {
      clearInterval(interval)
      clearTimeout(welcomeTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'welcome') return

    const doneTimer = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 600)

    return () => clearTimeout(doneTimer)
  }, [phase, onComplete])

  if (phase === 'done') return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] bg-void flex items-center justify-center',
        'transition-all duration-500',
        phase === 'welcome' && 'opacity-0'
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {phase === 'loading' && (
        <div className="relative">
          <div
            className={clsx(
              'absolute -top-4 left-0 right-0 h-px bg-arterial',
              'transition-opacity duration-75',
              glitchFrame % 3 === 0 ? 'opacity-100' : 'opacity-60'
            )}
          />
          <div
            className={clsx(
              'font-mono text-sm tracking-widest transition-all duration-100',
              glitchFrame % 5 === 0 ? 'text-white' : 'text-arterial'
            )}
            style={{
              textShadow:
                glitchFrame % 4 === 0 ? '2px 0 #00ffff, -2px 0 #ff00ff' : 'none',
            }}
          >
            [ {BOOT.fastResume} ]
          </div>
          <div
            className={clsx(
              'absolute -bottom-4 left-0 right-0 h-px bg-arterial',
              'transition-opacity duration-75',
              glitchFrame % 4 === 0 ? 'opacity-100' : 'opacity-60'
            )}
          />
        </div>
      )}

      {phase === 'welcome' && (
        <div className="font-mono text-sm text-white tracking-widest animate-pulse">
          [ WELCOME BACK ]
        </div>
      )}

      <div className="absolute top-4 left-4 font-mono text-[10px] text-white/50">
        [FAST_BOOT]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-arterial/50">
        {BOOT.fastCorner}
      </div>
    </div>
  )
}
