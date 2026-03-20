'use client'

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface RuptureTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  isInView: boolean
}

// Generate deterministic random values from character position
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function RuptureText({ text, className = '', style, isInView }: RuptureTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const charsRef = useRef<HTMLSpanElement[]>([])

  // Generate random initial styles for each character
  const charStyles = useMemo(() => {
    return text.split('').map((_, i) => {
      const rand1 = seededRandom(i + 1)
      const rand2 = seededRandom(i + 100)
      const rand3 = seededRandom(i + 200)

      return {
        // Randomize letter spacing: -0.05em to 0.15em
        letterSpacing: `${-0.05 + rand1 * 0.2}em`,
        // Slight random rotation: -3deg to 3deg
        rotation: (rand2 - 0.5) * 6,
        // Random y offset: -5px to 5px
        yOffset: (rand3 - 0.5) * 10,
        // Rupture direction (where it flies on scroll)
        ruptureX: (rand1 - 0.5) * 200,
        ruptureY: (rand2 - 0.5) * 150,
        ruptureRotation: (rand3 - 0.5) * 90,
      }
    })
  }, [text])

  useEffect(() => {
    if (!containerRef.current || !isInView) return

    const chars = charsRef.current.filter(Boolean)
    if (chars.length === 0) return

    // Initial animation - stagger in with randomized positions
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: (i) => 50 + charStyles[i].yOffset,
        rotation: (i) => charStyles[i].rotation * 2,
        scale: 0.8,
      },
      {
        opacity: 1,
        y: (i) => charStyles[i].yOffset,
        rotation: (i) => charStyles[i].rotation,
        scale: 1,
        duration: 0.8,
        stagger: 0.02,
        ease: 'power3.out',
      }
    )

    // Scroll-triggered rupture animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'center center',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress

        chars.forEach((char, i) => {
          const style = charStyles[i]
          gsap.to(char, {
            x: style.ruptureX * progress,
            y: style.yOffset + style.ruptureY * progress,
            rotation: style.rotation + style.ruptureRotation * progress,
            opacity: 1 - progress * 0.8,
            duration: 0.1,
            overwrite: true,
          })
        })
      },
    })

    return () => {
      scrollTrigger.kill()
      gsap.killTweensOf(chars)
    }
  }, [isInView, charStyles])

  // Reset on leaving view
  useEffect(() => {
    if (!isInView) {
      const chars = charsRef.current.filter(Boolean)
      gsap.set(chars, { x: 0, y: 0, rotation: 0, opacity: 0 })
    }
  }, [isInView])

  return (
    <div ref={containerRef} className={className} style={style}>
      {text.split('').map((char, i) => {
        const charStyle = charStyles[i]
        const isSpace = char === ' '

        return (
          <span
            key={i}
            ref={(el) => {
              if (el) charsRef.current[i] = el
            }}
            className="inline-block will-change-transform"
            style={{
              letterSpacing: charStyle.letterSpacing,
              // Add slight weight variation via text-shadow
              textShadow: i % 3 === 0
                ? '1px 0 0 currentColor'
                : i % 5 === 0
                  ? '-1px 0 0 currentColor'
                  : 'none',
              opacity: 0,
            }}
          >
            {isSpace ? '\u00A0' : char}
          </span>
        )
      })}
    </div>
  )
}
