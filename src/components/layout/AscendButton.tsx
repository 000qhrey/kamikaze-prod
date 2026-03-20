'use client'

import { useState, useCallback } from 'react'

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/'

export function AscendButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [displayText, setDisplayText] = useState('ASCEND')

  // Glitch text on hover
  const scrambleTo = useCallback((targetText: string) => {
    let frame = 0
    const maxFrames = 8
    const interval = setInterval(() => {
      frame++

      if (frame >= maxFrames) {
        setDisplayText(targetText)
        clearInterval(interval)
        return
      }

      const revealed = Math.floor((frame / maxFrames) * targetText.length)
      const scrambled = targetText
        .split('')
        .map((char, i) => {
          if (i < revealed) return targetText[i]
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        })
        .join('')

      setDisplayText(scrambled)
    }, 40)

    return () => clearInterval(interval)
  }, [])

  const handleHoverStart = () => {
    setIsHovered(true)
    scrambleTo('ASCEND')
  }

  const handleHoverEnd = () => {
    setIsHovered(false)
    setDisplayText('ASCEND')
  }

  const handleClick = () => {
    // Glitchy scroll to top
    const scrollDuration = 800
    const startPosition = window.scrollY
    const startTime = performance.now()

    // Add screen shake class
    document.body.classList.add('screen-shake')

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / scrollDuration, 1)

      // Easing function with slight glitch
      const eased = 1 - Math.pow(1 - progress, 3)
      const glitchOffset = progress < 0.8 ? (Math.random() - 0.5) * 10 : 0

      window.scrollTo(0, startPosition * (1 - eased) + glitchOffset)

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        window.scrollTo(0, 0)
        document.body.classList.remove('screen-shake')
      }
    }

    requestAnimationFrame(animateScroll)
  }

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        className={`
          group flex items-center gap-2 font-mono text-xs tracking-wider
          transition-all duration-200
          ${isHovered ? 'text-arterial' : 'text-white/70'}
        `}
      >
        <span className="text-white/40">[</span>
        <span className="flex items-center gap-1">
          {/* Upward sigil */}
          <span
            className={`
              inline-block transition-transform duration-200
              ${isHovered ? '-translate-y-0.5' : ''}
            `}
          >
            ^
          </span>
          <span>{displayText}</span>
        </span>
        <span className="text-white/40">]</span>
      </button>

      {/* Screen shake styles */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
        .screen-shake {
          animation: shake 0.1s ease-in-out 3;
        }
      `}</style>
    </>
  )
}
