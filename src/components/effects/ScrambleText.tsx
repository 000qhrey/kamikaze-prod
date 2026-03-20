'use client'

import { useRef, useEffect, useState, useCallback, ReactNode } from 'react'
import { scrambleText } from '@/lib/animations/scrambleText'
import clsx from 'clsx'

interface ScrambleTextProps {
  children: ReactNode
  className?: string
  triggerOnHover?: boolean
  triggerOnView?: boolean
  duration?: number
  resolveToColor?: string
  finalColor?: string
}

export function ScrambleText({
  children,
  className,
  triggerOnHover = true,
  triggerOnView = false,
  duration = 400,
  resolveToColor = '#CC0000',
  finalColor = '#EFEFEF',
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isScrambling, setIsScrambling] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const hasTriggeredView = useRef(false)

  const triggerScramble = useCallback(() => {
    if (isScrambling || !ref.current) return

    setIsScrambling(true)
    cleanupRef.current = scrambleText({
      element: ref.current,
      duration,
      resolveToColor,
      finalColor,
      onComplete: () => {
        setIsScrambling(false)
        cleanupRef.current = null
      },
    })
  }, [isScrambling, duration, resolveToColor, finalColor])

  // Trigger on view
  useEffect(() => {
    if (!triggerOnView || hasTriggeredView.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredView.current) {
          hasTriggeredView.current = true
          setTimeout(triggerScramble, 100)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [triggerOnView, triggerScramble])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return (
    <span
      ref={ref}
      className={clsx('inline-block', className)}
      onMouseEnter={triggerOnHover ? triggerScramble : undefined}
    >
      {children}
    </span>
  )
}
