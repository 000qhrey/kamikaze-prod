'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { gsap } from 'gsap'
import clsx from 'clsx'

interface GlitchSliceProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  bands?: number
  maxOffset?: number
}

export function GlitchSlice({
  children,
  className,
  delay = 0,
  threshold = 0.2,
  bands = 4,
  maxOffset = 20,
}: GlitchSliceProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold, triggerOnce: true })
  const hasAnimated = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInView || hasAnimated.current || !contentRef.current) return

    hasAnimated.current = true
    const element = contentRef.current

    // Create band elements
    const bandElements: HTMLDivElement[] = []
    const bandHeight = 100 / bands

    // Store original content
    const originalHTML = element.innerHTML

    for (let i = 0; i < bands; i++) {
      const band = document.createElement('div')
      band.style.cssText = `
        position: absolute;
        inset: 0;
        clip-path: inset(${i * bandHeight}% 0 ${100 - (i + 1) * bandHeight}% 0);
        overflow: hidden;
      `
      band.innerHTML = originalHTML
      bandElements.push(band)
    }

    // Hide original, add bands
    element.style.position = 'relative'
    const children = Array.from(element.children)
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.visibility = 'hidden'
      }
    })
    bandElements.forEach((band) => element.appendChild(band))

    // Animate
    gsap.fromTo(
      bandElements,
      {
        x: () => (Math.random() - 0.5) * 2 * maxOffset,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.02,
        delay,
        onComplete: () => {
          // Cleanup
          bandElements.forEach((band) => band.remove())
          children.forEach((child) => {
            if (child instanceof HTMLElement) {
              child.style.visibility = 'visible'
            }
          })
        },
      }
    )
  }, [isInView, delay, bands, maxOffset])

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <div ref={contentRef}>{children}</div>
    </div>
  )
}
