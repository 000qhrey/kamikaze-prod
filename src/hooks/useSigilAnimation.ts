'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { getAssetPath } from '@/lib/basePath'

const TOTAL_FRAMES = 120
const DISTORTION_RADIUS = 150 // Pixels around cursor to distort

interface UseSigilAnimationReturn {
  isLoaded: boolean
  loadProgress: number
  currentFrame: number
  scrollProgress: number
}

export function useSigilAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scrollContainerRef?: React.RefObject<HTMLElement>
): UseSigilAnimationReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameIndexRef = useRef(0)
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const rafRef = useRef<number | null>(null)

  // Preload all frames
  useEffect(() => {
    let isMounted = true
    const images: HTMLImageElement[] = []
    let loadedCount = 0

    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          images[index] = img
          loadedCount++
          if (isMounted) {
            setLoadProgress(loadedCount / TOTAL_FRAMES)
          }
          resolve()
        }
        img.onerror = () => {
          loadedCount++
          if (isMounted) {
            setLoadProgress(loadedCount / TOTAL_FRAMES)
          }
          resolve()
        }
        img.src = getAssetPath(`/frames/frame_${String(index + 1).padStart(3, '0')}.webp`)
      })
    }

    const loadAllImages = async () => {
      const batchSize = 20
      for (let i = 0; i < TOTAL_FRAMES; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, TOTAL_FRAMES); j++) {
          batch.push(loadImage(j))
        }
        await Promise.all(batch)
      }

      if (isMounted) {
        imagesRef.current = images
        setIsLoaded(true)
      }
    }

    loadAllImages()
    return () => { isMounted = false }
  }, [])

  // Draw frame with localized cursor distortion
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const images = imagesRef.current

    if (!canvas || !ctx || images.length === 0) return

    const img = images[frameIndex]
    if (!img || !img.complete) return

    const dpr = window.devicePixelRatio || 1
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) {
      canvas.width = vw * dpr
      canvas.height = vh * dpr
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Scale to cover viewport
    const imgAspect = img.width / img.height
    const canvasAspect = canvas.width / canvas.height

    let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width
      drawHeight = canvas.width / imgAspect
      offsetX = 0
      offsetY = (canvas.height - drawHeight) / 2
    } else {
      drawHeight = canvas.height
      drawWidth = canvas.height * imgAspect
      offsetX = (canvas.width - drawWidth) / 2
      offsetY = 0
    }

    // Draw base image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    // Apply localized distortion around cursor
    const mouse = mouseRef.current
    if (mouse.active && mouse.x >= 0 && mouse.y >= 0) {
      const mx = mouse.x * dpr
      const my = mouse.y * dpr
      const radius = DISTORTION_RADIUS * dpr

      // Create distortion in the cursor area
      const sliceHeight = 3 * dpr

      for (let y = Math.max(0, my - radius); y < Math.min(canvas.height, my + radius); y += sliceHeight) {
        // Calculate distance from cursor
        const distY = Math.abs(y - my)
        const distRatio = distY / radius

        // Only distort if within radius
        if (distRatio < 1) {
          // Stronger distortion closer to cursor
          const intensity = 1 - distRatio
          const displacement = (Math.random() - 0.5) * 40 * intensity

          // Calculate horizontal span at this y level (circular area)
          const xSpan = Math.sqrt(1 - distRatio * distRatio) * radius
          const xStart = Math.max(0, mx - xSpan)
          const xEnd = Math.min(canvas.width, mx + xSpan)
          const width = xEnd - xStart

          if (width > 0) {
            // Get the slice from the image
            const srcY = ((y - offsetY) / drawHeight) * img.height
            const srcX = ((xStart - offsetX) / drawWidth) * img.width
            const srcW = (width / drawWidth) * img.width

            if (srcY >= 0 && srcY < img.height && srcW > 0) {
              // Clear the area first
              ctx.clearRect(xStart, y, width, sliceHeight)

              // RGB split effect
              if (Math.random() > 0.3) {
                ctx.globalCompositeOperation = 'screen'

                // Red channel
                ctx.globalAlpha = 0.7 * intensity + 0.3
                ctx.drawImage(
                  img,
                  Math.max(0, srcX), Math.max(0, srcY),
                  Math.min(srcW, img.width - srcX), Math.min(sliceHeight / dpr, img.height - srcY),
                  xStart + displacement - 4 * intensity, y,
                  width, sliceHeight
                )

                // Cyan channel
                ctx.globalAlpha = 0.5 * intensity + 0.3
                ctx.drawImage(
                  img,
                  Math.max(0, srcX), Math.max(0, srcY),
                  Math.min(srcW, img.width - srcX), Math.min(sliceHeight / dpr, img.height - srcY),
                  xStart + displacement + 4 * intensity, y,
                  width, sliceHeight
                )

                ctx.globalAlpha = 1
                ctx.globalCompositeOperation = 'source-over'
              } else {
                // Simple displacement
                ctx.drawImage(
                  img,
                  Math.max(0, srcX), Math.max(0, srcY),
                  Math.min(srcW, img.width - srcX), Math.min(sliceHeight / dpr, img.height - srcY),
                  xStart + displacement, y,
                  width, sliceHeight
                )
              }
            }
          }
        }
      }

      // Add noise particles near cursor
      const particleCount = 30
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius
        const px = mx + Math.cos(angle) * dist
        const py = my + Math.sin(angle) * dist

        if (Math.random() > 0.7) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)'
          ctx.fillRect(px, py, 2 * dpr, 2 * dpr)
        }
      }
    }

    setCurrentFrame(frameIndex)
  }, [canvasRef])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Animation loop - smooth continuous rendering
  useEffect(() => {
    if (!isLoaded) return

    const animate = () => {
      drawFrame(frameIndexRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isLoaded, drawFrame])

  // Scroll-driven frame changes
  useEffect(() => {
    if (!isLoaded) return

    const handleScroll = () => {
      const container = scrollContainerRef?.current

      let progress: number

      if (container) {
        const rect = container.getBoundingClientRect()
        const containerHeight = container.offsetHeight
        const viewportHeight = window.innerHeight
        const scrolled = -rect.top
        const totalScrollable = containerHeight - viewportHeight
        progress = totalScrollable > 0 ? Math.min(1, Math.max(0, scrolled / totalScrollable)) : 0
      } else {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0
      }

      setScrollProgress(progress)

      // Map scroll to frame
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES))
      frameIndexRef.current = frameIndex
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoaded, scrollContainerRef])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (isLoaded) drawFrame(frameIndexRef.current)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [isLoaded, drawFrame])

  return {
    isLoaded,
    loadProgress,
    currentFrame,
    scrollProgress,
  }
}
