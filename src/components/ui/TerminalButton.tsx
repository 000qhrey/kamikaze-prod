'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'

interface TerminalButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  loading?: boolean
  success?: boolean
  successText?: string
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789'

export function TerminalButton({
  children,
  onClick,
  disabled = false,
  className,
  loading = false,
  success = false,
  successText = 'SUCCESS',
}: TerminalButtonProps) {
  const [displayText, setDisplayText] = useState<string>(
    typeof children === 'string' ? children : 'TRANSMIT'
  )
  const [isClicked, setIsClicked] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'sending' | 'success'>('idle')

  const originalText = typeof children === 'string' ? children : 'TRANSMIT'

  // Scramble animation function
  const scrambleTo = useCallback((targetText: string, onComplete?: () => void) => {
    let frame = 0
    const maxFrames = 12
    const interval = setInterval(() => {
      frame++

      if (frame >= maxFrames) {
        setDisplayText(targetText)
        clearInterval(interval)
        onComplete?.()
        return
      }

      const revealed = Math.floor((frame / maxFrames) * targetText.length)
      const scrambled = targetText
        .split('')
        .map((char, i) => {
          if (char === ' ' || char === '.' || char === '_') return char
          if (i < revealed) return targetText[i]
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        })
        .join('')

      setDisplayText(scrambled)
    }, 40)

    return () => clearInterval(interval)
  }, [])

  // Handle loading state
  useEffect(() => {
    if (loading && phase === 'idle') {
      setPhase('sending')
      // Trigger screen shake
      document.body.classList.add('screen-shake')
      setTimeout(() => document.body.classList.remove('screen-shake'), 300)
      scrambleTo('SENDING...')
    }
  }, [loading, phase, scrambleTo])

  // Handle success state
  useEffect(() => {
    if (success && phase === 'sending') {
      setPhase('success')
      scrambleTo(successText)
    }
  }, [success, phase, successText, scrambleTo])

  // Reset when not loading/success
  useEffect(() => {
    if (!loading && !success && phase !== 'idle') {
      setPhase('idle')
      setDisplayText(originalText)
    }
  }, [loading, success, phase, originalText])

  const handleClick = () => {
    if (disabled || loading) return
    setIsClicked(true)
    onClick?.()
    setTimeout(() => setIsClicked(false), 200)
  }

  if (success) {
    return (
      <div
        className={clsx(
          'font-mono text-lg transition-all duration-300',
          className
        )}
      >
        <span className="text-signal">{displayText}</span>
        <span className="ml-2 text-white animate-pulse"></span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={clsx(
          'group relative font-mono text-white transition-all duration-200',
          'border-2 px-8 py-3',
          'hover:border-arterial hover:text-arterial',
          'focus:outline-none focus:border-arterial',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isClicked && 'scale-95',
          loading ? 'border-arterial text-arterial' : 'border-grey-mid',
          className
        )}
      >
        {/* Glitch overlay on hover */}
        <span
          className={clsx(
            'absolute inset-0 opacity-0 group-hover:opacity-100',
            'bg-arterial/5 transition-opacity duration-200'
          )}
        />

        {/* Button content */}
        <span className="relative flex items-center justify-center gap-2">
          <span className="text-grey-mid group-hover:text-arterial transition-colors">
            &gt;
          </span>
          <span className="tracking-wider">{displayText}</span>
          {!loading && (
            <span className="animate-blink text-arterial">_</span>
          )}
          {loading && (
            <span className="inline-flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: '100ms' }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: '200ms' }}>
                .
              </span>
            </span>
          )}
        </span>

        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current" />
        <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current" />
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
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }
        .screen-shake {
          animation: shake 0.1s ease-in-out 3;
        }
      `}</style>
    </>
  )
}
