'use client'

import { useState, useEffect } from 'react'
import { checkIsMobile } from '@/hooks/useIsMobile'

/** Mobile or prefers-reduced-motion — skip heavy animations/effects */
export function checkLiteMode(): boolean {
  if (typeof window === 'undefined') return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return checkIsMobile() || reduced
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
