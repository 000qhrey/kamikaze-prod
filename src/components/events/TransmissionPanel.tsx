'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { triggerSigilGlitch } from '@/hooks/useSigilGlitch'
import { playSubmitSound } from '@/hooks/useSonicFeedback'
import { useTransition } from '@/providers/TransitionProvider'
import {
  FRAGMENT_01_DISMISSED_KEY,
  FRAGMENT_01_SEEN_KEY,
  MASKED_TIMESTAMP,
  TRANSMISSION_PROGRESS,
  getProgressBar,
} from '@/data/transmission'

const TOTAL_STEPS = 7
const SCROLL_TRIGGER_PX = 8

export function TransmissionPanel() {
  const { navigateTo } = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [visibleStep, setVisibleStep] = useState(0)
  const hasTriggeredRef = useRef(false)

  const openFragment = useCallback(() => {
    if (hasTriggeredRef.current) return
    if (sessionStorage.getItem(FRAGMENT_01_DISMISSED_KEY)) return

    hasTriggeredRef.current = true
    sessionStorage.setItem(FRAGMENT_01_SEEN_KEY, '1')
    setIsOpen(true)
    triggerSigilGlitch(0.6, 500)
    playSubmitSound()
  }, [])

  const dismiss = useCallback(() => {
    setIsOpen(false)
    sessionStorage.setItem(FRAGMENT_01_DISMISSED_KEY, '1')
    sessionStorage.setItem(FRAGMENT_01_SEEN_KEY, '1')
  }, [])

  const continueToEvents = useCallback(() => {
    dismiss()
    navigateTo('/events#kamikaze-override')
  }, [dismiss, navigateTo])

  useEffect(() => {
    if (sessionStorage.getItem(FRAGMENT_01_DISMISSED_KEY)) return

    const onScroll = () => {
      if (window.scrollY >= SCROLL_TRIGGER_PX) {
        openFragment()
      }
    }

    const onTouch = () => {
      openFragment()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouch)
    }
  }, [openFragment])

  useEffect(() => {
    if (!isOpen) {
      setVisibleStep(0)
      return
    }

    let step = 0
    const interval = setInterval(() => {
      step++
      setVisibleStep(step)
      if (step >= TOTAL_STEPS) {
        clearInterval(interval)
      }
    }, 180)

    return () => clearInterval(interval)
  }, [isOpen])

  const show = (step: number) => visibleStep >= step

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 pointer-events-none transition-opacity duration-700',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(204,0,0,0.08) 0%, transparent 60%)',
        }}
      />

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
        aria-label="Recovered transmission fragment"
      >
        <div className="relative border border-arterial/40 bg-void/95 backdrop-blur-md glass-card">
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-arterial/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-arterial/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-arterial/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-arterial/60" />

          <div className="flex items-center justify-between px-4 py-2 border-b border-arterial/20 bg-arterial/5">
            <span className="font-mono text-[10px] text-arterial tracking-widest animate-pulse">
              DATA_RECOVERY // FRAGMENT_01
            </span>
            <button
              onClick={dismiss}
              className="font-mono text-[10px] text-white/50 hover:text-arterial transition-colors tracking-wider"
            >
              [DISMISS]
            </button>
          </div>

          <div className="px-5 py-4 font-mono text-xs leading-relaxed space-y-2">
            <p
              className={clsx(
                'text-[10px] text-white/40 tracking-wider transition-opacity duration-300',
                show(1) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {getProgressBar(TRANSMISSION_PROGRESS.FRAGMENT_01)}
            </p>

            <p
              className={clsx(
                'text-arterial tracking-widest text-[10px] transition-opacity duration-300',
                show(2) ? 'opacity-100' : 'opacity-0'
              )}
            >
              TRANSMISSION // FRAGMENT_01
            </p>

            <p
              className={clsx(
                'text-white/70 transition-opacity duration-300',
                show(2) ? 'opacity-100' : 'opacity-0'
              )}
            >
              TIMESTAMP:// {MASKED_TIMESTAMP}
            </p>

            <div
              className={clsx(
                'space-y-1 transition-opacity duration-300',
                show(3) ? 'opacity-100' : 'opacity-0'
              )}
            >
              <p className="text-white/70">The signal reaches the subcontinent.</p>
              <p className="text-signal">Month recovered.</p>
              <p className="text-signal">Year recovered.</p>
              <p className="text-white/50">Location data remains encrypted.</p>
            </div>

            <div
              className={clsx(
                'space-y-1 border-l-2 border-arterial/30 pl-3 transition-opacity duration-300',
                show(4) ? 'opacity-100' : 'opacity-0'
              )}
            >
              <p className="text-white/60">&gt;&gt;&gt; EVENTS_NODE contains additional fragments.</p>
              <p className="text-white/60">&gt;&gt;&gt; Decrypt remaining payload to recover coordinates.</p>
            </div>

            <p
              className={clsx(
                'text-red-bright text-[10px] tracking-wider animate-pulse transition-opacity duration-300',
                show(5) ? 'opacity-100' : 'opacity-0'
              )}
            >
              CAREFUL — YOU ARE BEING WATCHED!
            </p>

            <div
              className={clsx(
                'flex flex-col gap-2 pt-2 transition-opacity duration-300',
                show(6) ? 'opacity-100' : 'opacity-0'
              )}
            >
              <button
                onClick={continueToEvents}
                className="font-mono text-[10px] tracking-widest text-left text-arterial hover:text-white border border-arterial/40 hover:border-arterial px-3 py-2 transition-colors"
              >
                [ ACCESS FRAGMENT_02 → ]
              </button>
              <p className="text-[10px] text-white/30">
                SIGNAL_INTEGRITY: {TRANSMISSION_PROGRESS.FRAGMENT_01}% // RECONSTRUCTION INCOMPLETE
              </p>
            </div>

            {show(7) && (
              <p className="text-[10px] text-white/20 pt-1">
                ROUTE: EVENTS://KAMIKAZE_OVERRIDE
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
