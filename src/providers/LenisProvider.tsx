'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import Lenis from '@studio-freight/lenis'

interface LenisContextValue {
  lenis: Lenis | null
  scrollTo: (target: string | number | HTMLElement, options?: object) => void
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
})

export function useLenisContext() {
  return useContext(LenisContext)
}

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Expose lenis to window for debugging
    if (typeof window !== 'undefined') {
      ;(window as unknown as { lenis: Lenis }).lenis = lenis
    }

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = (target: string | number | HTMLElement, options = {}) => {
    lenisRef.current?.scrollTo(target, {
      offset: 0,
      duration: 1.2,
      ...options,
    })
  }

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </LenisContext.Provider>
  )
}
