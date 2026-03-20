'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import clsx from 'clsx'

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
  onComplete?: () => void
}

export function TypewriterText({
  text,
  className,
  speed = 30,
  delay = 0,
  cursor = true,
  onComplete,
}: TypewriterTextProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3, triggerOnce: true })
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return

    hasStarted.current = true

    const startTyping = () => {
      setIsTyping(true)
      let index = 0

      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
          onComplete?.()
        }
      }, speed)

      return () => clearInterval(interval)
    }

    const timeout = setTimeout(startTyping, delay)
    return () => clearTimeout(timeout)
  }, [isInView, text, speed, delay, onComplete])

  return (
    <div ref={ref} className={clsx('font-mono', className)}>
      <span>{displayText}</span>
      {cursor && (isTyping || displayText.length < text.length) && (
        <span className="animate-blink">_</span>
      )}
    </div>
  )
}
