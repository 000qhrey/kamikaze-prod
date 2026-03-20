'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

const TOTAL_FRAMES = 120

interface SigilAnimationProps {
  className?: string
  size?: 'small' | 'medium' | 'large' | 'full'
}

export function SigilAnimation({
  className,
  size = 'medium',
}: SigilAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameRef = useRef(0)
  const animationRef = useRef<number | null>(null)

  const sizeClasses = {
    small: 'w-[120px] h-[120px]',
    medium: 'w-[200px] h-[200px]',
    large: 'w-[300px] h-[300px]',
    full: 'w-full h-full',
  }

  // Load images
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []
    let loaded = 0

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        loaded++
        if (mounted) setLoadProgress(loaded / TOTAL_FRAMES)
        if (loaded === TOTAL_FRAMES && mounted) {
          imagesRef.current = images
          setIsLoaded(true)
        }
      }
      img.onerror = () => {
        loaded++
        if (mounted) setLoadProgress(loaded / TOTAL_FRAMES)
        if (loaded === TOTAL_FRAMES && mounted) {
          imagesRef.current = images
          setIsLoaded(true)
        }
      }
      img.src = getAssetPath(`/sequence/${i + 1}.png`)
      images[i] = img
    }

    return () => { mounted = false }
  }, [])

  // Draw frame
  const drawFrame = useCallback((index: number, distort: boolean) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imagesRef.current[index]
    if (!canvas || !ctx || !img) return

    const container = canvas.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9
    const w = img.width * scale
    const h = img.height * scale
    const x = (canvas.width - w) / 2
    const y = (canvas.height - h) / 2

    if (distort) {
      const sliceH = 4
      for (let sy = 0; sy < h; sy += sliceH) {
        const dx = (Math.random() - 0.5) * 15
        ctx.drawImage(img, 0, sy / scale, img.width, sliceH / scale, x + dx, y + sy, w, sliceH)
      }
    } else {
      ctx.drawImage(img, x, y, w, h)
    }
  }, [])

  // Initial draw
  useEffect(() => {
    if (isLoaded) drawFrame(0, false)
  }, [isLoaded, drawFrame])

  // Hover animation
  useEffect(() => {
    if (!isLoaded) return

    if (isHovering) {
      let lastTime = 0
      const animate = (time: number) => {
        if (time - lastTime > 33) { // ~30fps
          frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES
          drawFrame(frameRef.current, true)
          lastTime = time
        }
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      frameRef.current = 0
      drawFrame(0, false)
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isLoaded, isHovering, drawFrame])

  return (
    <div
      className={clsx('relative', sizeClasses[size], className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[10px] text-grey-dark">
            {Math.round(loadProgress * 100)}%
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={clsx('w-full h-full', isLoaded ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
