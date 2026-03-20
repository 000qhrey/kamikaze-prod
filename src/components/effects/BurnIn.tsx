'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { burnInText } from '@/lib/animations/burnIn'
import clsx from 'clsx'

interface BurnInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  threshold?: number
}

export function BurnIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  threshold = 0.5,
}: BurnInProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold, triggerOnce: true })
  const contentRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current || !contentRef.current) return

    hasAnimated.current = true

    setTimeout(() => {
      if (contentRef.current) {
        burnInText({
          element: contentRef.current,
          duration,
        })
      }
    }, delay * 1000)
  }, [isInView, delay, duration])

  return (
    <div ref={ref} className={className}>
      <div ref={contentRef} className="opacity-0">
        {children}
      </div>
    </div>
  )
}
