'use client'

import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect touch device - use native scroll on mobile for better performance
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsMobile(isTouchDevice)

    // Skip Lenis on mobile - native scroll is smoother
    if (isTouchDevice) {
      return
    }

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
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
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: 0,
        duration: 1.2,
        ...options,
      })
    } else {
      // Fallback for mobile - use native smooth scroll
      const element = typeof target === 'string'
        ? document.querySelector(target)
        : target instanceof HTMLElement
          ? target
          : null

      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' })
      }
    }
  }

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </LenisContext.Provider>
  )
}
