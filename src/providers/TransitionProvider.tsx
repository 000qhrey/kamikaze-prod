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
    const [path, hash = ''] = href.split('#')

    // Same-page hash navigation (e.g. /events#kamikaze-override while already on /events)
    if (path === pathname || href.startsWith(`${pathname}#`)) {
      if (hash) {
        playClickSound()
        window.location.hash = hash
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
      return
    }

    if (isTransitioning) return

    playClickSound()
    setIsTransitioning(true)

    const transition = transitionRef.current

    if (transition) {
      router.push(href)
      await transition.glitchOut(180)
      await transition.glitchIn(120)

      if (hash) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    } else {
      router.push(href)
      if (hash) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    }

    setIsTransitioning(false)
  }, [isTransitioning, pathname, router])

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  )
}
