'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { CursorTrailRenderer } from '@/lib/canvas/cursorTrail'

interface CursorContextValue {
  isHovering: boolean
  setIsHovering: (hovering: boolean) => void
}

const CursorContext = createContext<CursorContextValue>({
  isHovering: false,
  setIsHovering: () => {},
})

export function useCursor() {
  return useContext(CursorContext)
}

interface CursorProviderProps {
  children: ReactNode
}

export function CursorProvider({ children }: CursorProviderProps) {
  const [isHovering, setIsHovering] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const trailRef = useRef<CursorTrailRenderer | null>(null)

  useEffect(() => {
    // Create canvas for cursor trail
    const canvas = document.createElement('canvas')
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
    `
    document.body.appendChild(canvas)
    canvasRef.current = canvas

    // Initialize trail renderer
    const trail = new CursorTrailRenderer(canvas)
    trail.start()
    trailRef.current = trail

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      trail.addPoint(e.clientX, e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      trail.stop()
      canvas.remove()
    }
  }, [])

  return (
    <CursorContext.Provider value={{ isHovering, setIsHovering }}>
      {children}
    </CursorContext.Provider>
  )
}
