'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { gsap } from 'gsap'
import clsx from 'clsx'

interface LetterBurnProps {
  text: string
  className?: string
  stagger?: number
  flashColor?: string
  finalColor?: string
  delay?: number
  onComplete?: () => void
}

export function LetterBurn({
  text,
  className,
  stagger = 0.08,
  flashColor = '#CC0000',
  finalColor = '#EFEFEF',
  delay = 0,
  onComplete,
}: LetterBurnProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const [letters, setLetters] = useState<string[]>([])

  useEffect(() => {
    setLetters(text.split(''))
  }, [text])

  useEffect(() => {
    if (!isInView || hasAnimated.current || !containerRef.current) return

    hasAnimated.current = true
    const spans = containerRef.current.querySelectorAll('span')

    const timeline = gsap.timeline({
      delay,
      onComplete,
    })

    spans.forEach((span, i) => {
      timeline.to(
        span,
        {
          opacity: 1,
          color: flashColor,
          filter: 'brightness(2)',
          textShadow: `0 0 20px ${flashColor}`,
          duration: 0.05,
        },
        i * stagger
      )
      timeline.to(
        span,
        {
          color: finalColor,
          filter: 'brightness(1)',
          textShadow: 'none',
          duration: 0.15,
          ease: 'power2.out',
        },
        i * stagger + 0.05
      )
    })
  }, [isInView, delay, stagger, flashColor, finalColor, onComplete])

  return (
    <div ref={ref} className={className}>
      <div ref={containerRef} className="inline-block">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="inline-block opacity-0"
            style={{ minWidth: letter === ' ' ? '0.3em' : undefined }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
    </div>
  )
}
