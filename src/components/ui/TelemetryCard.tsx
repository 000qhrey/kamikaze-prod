'use client'

import { useRef, useState, useEffect } from 'react'
import clsx from 'clsx'

interface TelemetryCardProps {
  children: React.ReactNode
  className?: string
  metadata?: string
  onClick?: () => void
  flickerMetadata?: boolean
}

export function TelemetryCard({
  children,
  className,
  metadata,
  onClick,
  flickerMetadata = true,
}: TelemetryCardProps) {
  const [isFlickering, setIsFlickering] = useState(false)

  // Random flicker effect for metadata
  useEffect(() => {
    if (!flickerMetadata || !metadata) return

    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        setIsFlickering(true)
        setTimeout(() => setIsFlickering(false), 80)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [flickerMetadata, metadata])

  return (
    <div
      className={clsx(
        'relative group transition-transform duration-150',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {/* Metadata label above */}
      {metadata && (
        <div
          className={clsx(
            'absolute -top-5 left-4 font-mono text-[8px] tracking-[0.3em] text-white/50',
            'transition-opacity duration-75',
            isFlickering && 'opacity-0'
          )}
        >
          [ {metadata} ]
        </div>
      )}

      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left bracket */}
        <svg className="absolute top-0 left-0 w-4 h-4" viewBox="0 0 16 16">
          <path
            d="M0 16 L0 0 L16 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-arterial/50 group-hover:text-arterial transition-colors"
          />
        </svg>
        {/* Top-right bracket */}
        <svg className="absolute top-0 right-0 w-4 h-4" viewBox="0 0 16 16">
          <path
            d="M0 0 L16 0 L16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-arterial/50 group-hover:text-arterial transition-colors"
          />
        </svg>
        {/* Bottom-left bracket */}
        <svg className="absolute bottom-0 left-0 w-4 h-4" viewBox="0 0 16 16">
          <path
            d="M0 0 L0 16 L16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-arterial/50 group-hover:text-arterial transition-colors"
          />
        </svg>
        {/* Bottom-right bracket */}
        <svg className="absolute bottom-0 right-0 w-4 h-4" viewBox="0 0 16 16">
          <path
            d="M16 0 L16 16 L0 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-arterial/50 group-hover:text-arterial transition-colors"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Hover/Active glow effect */}
      <div
        className={clsx(
          'absolute inset-0 bg-arterial/5 opacity-0 group-hover:opacity-100 group-active:opacity-100 group-active:bg-arterial/10',
          'transition-all duration-300 pointer-events-none'
        )}
      />
    </div>
  )
}

// Animated counter component
interface CounterProps {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', duration = 1000, className }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  const hasAnimated = useRef(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animateCounter()
        }
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [value, duration])

  const animateCounter = () => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out-expo)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (value - startValue) * eased)

      setDisplayValue(current)

      // Add occasional glitch during animation
      if (progress < 1) {
        if (Math.random() > 0.85) {
          setIsGlitching(true)
          setTimeout(() => setIsGlitching(false), 50)
        }
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  // Random glitch after animation
  useEffect(() => {
    if (!hasAnimated.current) return

    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true)
        const glitchValue = displayValue + Math.floor((Math.random() - 0.5) * 100)
        setDisplayValue(glitchValue)
        setTimeout(() => {
          setDisplayValue(value)
          setIsGlitching(false)
        }, 80)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [value, displayValue])

  const formatNumber = (n: number) => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    }
    return n.toString()
  }

  return (
    <span
      ref={elementRef}
      className={clsx(
        'transition-colors duration-75',
        isGlitching && 'text-arterial',
        className
      )}
    >
      {formatNumber(displayValue)}{suffix}
    </span>
  )
}
