'use client'

import { useState, useEffect } from 'react'
import { checkIsMobile } from '@/hooks/useIsMobile'

/** Mobile or prefers-reduced-motion — skip heavy animations/effects */
export function checkLiteMode(): boolean {
  if (typeof window === 'undefined') return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return checkIsMobile() || reduced
}

/**
 * Skip hero WebGL (logo.glb) — static sigil image instead.
 * Phones, touch viewports, and reduced motion never mount R3F.
 */
export function checkSkipHeroWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (window.matchMedia('(max-width: 767px)').matches) return true
  if (window.matchMedia('(pointer: coarse)').matches) return true
  return checkIsMobile()
}

export function useLiteMode(): boolean {
  const [lite, setLite] = useState(false)

  useEffect(() => {
    const update = () => setLite(checkLiteMode())
    update()
    window.addEventListener('resize', update)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener('change', update)
    }
  }, [])

  return lite
}

/**
 * Whether to skip the R3F hero logo. Stays `true` until mounted so we never
 * begin loading three.js on the first paint of a phone / reduced-motion client.
 */
export function useSkipHeroWebGL(): boolean {
  const [skip, setSkip] = useState(true)

  useEffect(() => {
    const update = () => setSkip(checkSkipHeroWebGL())
    update()
    window.addEventListener('resize', update)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)')
    const small = window.matchMedia('(max-width: 767px)')
    reduced.addEventListener('change', update)
    coarse.addEventListener('change', update)
    small.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      reduced.removeEventListener('change', update)
      coarse.removeEventListener('change', update)
      small.removeEventListener('change', update)
    }
  }, [])

  return skip
}
