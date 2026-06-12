'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { triggerSigilGlitch } from '@/hooks/useSigilGlitch'
import { playSubmitSound } from '@/hooks/useSonicFeedback'

const STORAGE_KEY = 'kamikaze-transmission-dismissed'

const TRANSMISSION_LINES = [
  'TRANSMISSION // KAMIKAZE OVERRIDE',
  '',
  'The hall is a mask. The hill remembers.',
  'The capital bows south. So must you.',
  'Beneath the white arch, the black signal prays.',
  '',
  'Camouflage holds.',
  'Substrate waits.',
  'T−48 burns the lie away.',
  '',
  'You are close.',
  'You are watched.',
  'Step back or commit.',
  '',
  '— END FRAGMENT',
]

export function TransmissionPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasTriggeredRef = useRef(false)

  const dismiss = useCallback(() => {
    setIsOpen(false)
    sessionStorage.setItem(STORAGE_KEY, '1')
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          setIsOpen(true)
          triggerSigilGlitch(0.6, 500)
          playSubmitSound()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Stagger line reveal when panel opens
  useEffect(() => {
    if (!isOpen) {
      setVisibleLines(0)
      return
    }

    let line = 0
    const interval = setInterval(() => {
      line++
      setVisibleLines(line)
      if (line >= TRANSMISSION_LINES.length) {
        clearInterval(interval)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [isOpen])

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      {/* Backdrop — subtle, doesn't block scroll */}
      <div
        className={clsx(
          'fixed inset-0 z-40 pointer-events-none transition-opacity duration-700',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(204,0,0,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Pop-out panel */}
      <div
        className={clsx(
          'fixed bottom-6 right-4 md:bottom-10 md:right-10 z-50',
          'max-w-sm md:max-w-md w-[calc(100%-2rem)]',
          'transition-all duration-700 ease-out',
          isOpen
            ? 'opacity-100 translate-x-0 translate-y-0'
            : 'opacity-0 translate-x-8 translate-y-4 pointer-events-none'
        )}
        role="dialog"
        aria-label="Intercepted transmission"
      >
        <div className="relative border border-arterial/40 bg-void/95 backdrop-blur-md glass-card">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-arterial/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-arterial/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-arterial/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-arterial/60" />

          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-arterial/20 bg-arterial/5">
            <span className="font-mono text-[10px] text-arterial tracking-widest animate-pulse">
              INCOMING_FRAGMENT
            </span>
            <button
              onClick={dismiss}
              className="font-mono text-[10px] text-white/50 hover:text-arterial transition-colors tracking-wider"
            >
              [DISMISS]
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 font-mono text-xs leading-relaxed space-y-1">
            {TRANSMISSION_LINES.map((line, i) => (
              <p
                key={i}
                className={clsx(
                  'transition-opacity duration-300',
                  i < visibleLines ? 'opacity-100' : 'opacity-0',
                  line.startsWith('TRANSMISSION') ? 'text-arterial tracking-widest text-[10px]' :
                  line.startsWith('—') ? 'text-white/40 mt-2' :
                  line === '' ? 'h-2' :
                  'text-white/70'
                )}
              >
                {line || '\u00A0'}
              </p>
            ))}

            {visibleLines >= TRANSMISSION_LINES.length && (
              <p className="text-[10px] text-white/30 pt-2 animate-pulse">
                SIGNAL_SOURCE: HOME_UPLINK // DEPTH_SCAN_COMPLETE
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
