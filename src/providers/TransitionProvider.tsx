'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PixelDissolveTransition } from '@/lib/canvas/pixelDissolve'
import { useImagePreloader, generateFramePaths } from '@/hooks/useImagePreloader'

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
  const transitionRef = useRef<PixelDissolveTransition | null>(null)

  // Preload sigil frames for the flash effect
  const framePaths = generateFramePaths(120)
  const { images: sigilFrames } = useImagePreloader(framePaths)

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

    const transition = new PixelDissolveTransition(canvas)
    transitionRef.current = transition

    return () => {
      transition.stop()
      canvas.remove()
    }
  }, [])

  // Update sigil frames when loaded
  useEffect(() => {
    if (sigilFrames.length > 0 && transitionRef.current) {
      transitionRef.current.setSigilFrames(sigilFrames)
    }
  }, [sigilFrames])

  const navigateTo = useCallback(async (href: string) => {
    if (isTransitioning || href === pathname) return

    setIsTransitioning(true)

    const canvas = canvasRef.current
    const transition = transitionRef.current

    if (canvas && transition) {
      // Capture current page as black (simplified)
      const currentImageData = new ImageData(
        new Uint8ClampedArray(window.innerWidth * window.innerHeight * 4),
        window.innerWidth,
        window.innerHeight
      )

      // Create blocks and scatter
      transition.createBlocks(currentImageData, true)
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Flash
      const ctx = canvas.getContext('2d')
      if (ctx && sigilFrames.length > 0) {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 0.8
        const frame = sigilFrames[Math.floor(sigilFrames.length / 2)]
        const scale = Math.min(canvas.width, canvas.height) * 0.5 / Math.max(frame.width, frame.height)
        const x = (canvas.width - frame.width * scale) / 2
        const y = (canvas.height - frame.height * scale) / 2
        ctx.drawImage(frame, x, y, frame.width * scale, frame.height * scale)
        ctx.globalAlpha = 1
      }

      await new Promise((resolve) => setTimeout(resolve, 83))

      // Clear for navigation
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Navigate
    router.push(href)

    // Wait for navigation then assemble
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }, [isTransitioning, pathname, router, sigilFrames])

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  )
}
