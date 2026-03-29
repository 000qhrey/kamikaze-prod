'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GlitchTransition } from '@/lib/canvas/glitchTransition'
import { playClickSound } from '@/hooks/useSonicFeedback'

interface TransitionContextValue {
  isTransitioning: boolean
  navigateTo: (href: string) => void
}

const TransitionContext = createContext<TransitionContextValue>({
  isTransitioning: false,
  navigateTo: () => {},
})

export function useTransition() {
  return useContext(TransitionContext)
}

interface TransitionProviderProps {
  children: ReactNode
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const transitionRef = useRef<GlitchTransition | null>(null)

  // Initialize canvas and transition handler
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10000;
      background: transparent;
    `
    document.body.appendChild(canvas)
    canvasRef.current = canvas

    const transition = new GlitchTransition(canvas)
    transitionRef.current = transition

    return () => {
      transition.stop()
      canvas.remove()
    }
  }, [])

  const navigateTo = useCallback(async (href: string) => {
    if (isTransitioning || href === pathname) return

    // Play navigation click sound
    playClickSound()

    setIsTransitioning(true)

    const transition = transitionRef.current

    if (transition) {
      // Start navigation immediately (runs in parallel with animation)
      router.push(href)

      // Chromatic aberration flash out (covers navigation time)
      await transition.glitchOut(180)

      // Chromatic aberration flash in (reveals new page)
      await transition.glitchIn(120)
    } else {
      router.push(href)
    }

    setIsTransitioning(false)
  }, [isTransitioning, pathname, router])

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  )
}
