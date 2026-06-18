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
} from '@/data/transmission'
import { EVENT_HINT } from '@/data/siteCopy'

const TOTAL_STEPS = 7
const SCROLL_TRIGGER_PX = 120

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
    }, 220)

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
        aria-label="Event riddle"
      >
        <div className="relative border border-arterial/40 bg-void/95 backdrop-blur-md glass-card">
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-arterial/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-arterial/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-arterial/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-arterial/60" />

          <div className="flex items-center justify-between px-4 py-2 border-b border-arterial/20 bg-arterial/5">
            <span className="font-mono text-[10px] text-arterial tracking-widest">
              {EVENT_HINT.panelTitle}
            </span>
            <button
              onClick={dismiss}
              className="font-mono text-[10px] text-white/50 hover:text-arterial transition-colors tracking-wider"
            >
              [{EVENT_HINT.dismiss}]
            </button>
          </div>

          <div className="px-5 py-4 font-mono text-xs leading-relaxed space-y-2.5">
            <p
              className={clsx(
                'text-white/70 transition-opacity duration-300',
                show(1) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {'>'} {EVENT_HINT.riddle1}
            </p>

            <p
              className={clsx(
                'text-white/60 transition-opacity duration-300',
                show(2) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {'>'} {EVENT_HINT.riddle2}
            </p>

            <p
              className={clsx(
                'text-white/50 transition-opacity duration-300',
                show(3) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {'>'} {EVENT_HINT.riddle3}
            </p>

            <p
              className={clsx(
                'text-signal transition-opacity duration-300',
                show(4) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {EVENT_HINT.monthFound}
            </p>

            <p
              className={clsx(
                'text-white/50 transition-opacity duration-300',
                show(5) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {EVENT_HINT.riddle4}
            </p>

            <p
              className={clsx(
                'text-white/40 transition-opacity duration-300',
                show(5) ? 'opacity-100' : 'opacity-0'
              )}
            >
              Timestamp fragment: {MASKED_TIMESTAMP}
            </p>

            <p
              className={clsx(
                'text-white/50 transition-opacity duration-300',
                show(6) ? 'opacity-100' : 'opacity-0'
              )}
            >
              {EVENT_HINT.locationHidden}
            </p>

            <div
              className={clsx(
                'flex flex-col gap-2 pt-2 transition-opacity duration-300',
                show(7) ? 'opacity-100' : 'opacity-0'
              )}
            >
              <button
                onClick={continueToEvents}
                className="font-mono text-[10px] tracking-widest text-left text-arterial hover:text-white border border-arterial/40 hover:border-arterial px-3 py-2 transition-colors"
              >
                [ {EVENT_HINT.cta} → ]
              </button>
              <p className="text-[10px] text-white/30">
                {EVENT_HINT.footer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
