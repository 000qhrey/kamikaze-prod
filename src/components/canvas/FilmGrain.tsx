'use client'

import { useEffect, useRef } from 'react'
import { FilmGrainRenderer } from '@/lib/canvas/filmGrain'

export function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<FilmGrainRenderer | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new FilmGrainRenderer(canvas)
    renderer.start()
    rendererRef.current = renderer

    return () => {
      renderer.stop()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
      aria-hidden="true"
    />
  )
}
