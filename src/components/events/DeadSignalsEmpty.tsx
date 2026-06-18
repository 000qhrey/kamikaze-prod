'use client'

import { useState, useEffect, useCallback } from 'react'
import { EVENTS } from '@/data/siteCopy'

const GLITCH_CHARS = '神風死暴走地下▓▒░█カミカゼ'

const TERMINAL_LINES = [
  { prefix: 'Archive:', text: EVENTS.emptySearching },
  { prefix: 'Status:', text: EVENTS.emptyStatus },
]

function GlitchTypeLine({
  prefix,
  text,
  delay,
  onComplete
}: {
  prefix: string
  text: string
  delay: number
  onComplete?: () => void
}) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
      let index = 0

      const interval = setInterval(() => {
        if (index < text.length) {
          if (Math.random() > 0.85) {
            const glitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            setDisplayText(text.slice(0, index) + glitchChar)
            setTimeout(() => {
              setDisplayText(text.slice(0, index + 1))
            }, 50)
          } else {
            setDisplayText(text.slice(0, index + 1))
          }
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
          onComplete?.()
        }
      }, 35)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, onComplete])

  if (!hasStarted) return null

  return (
    <div className="flex items-center gap-2 font-mono text-xs md:text-sm">
      <span className="text-arterial">{prefix}</span>
      <span className="text-white/70">{displayText}</span>
      {isTyping && <span className="text-arterial animate-pulse">█</span>}
    </div>
  )
}

export function DeadSignalsEmpty() {
  const [completedLines, setCompletedLines] = useState(0)

  const handleLineComplete = useCallback(() => {
    setCompletedLines(prev => prev + 1)
  }, [])

  return (
    <div className="relative border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-arterial/60" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
        <span className="font-mono text-[10px] text-white/40 ml-2">
          {EVENTS.past}
        </span>
      </div>

      <div className="p-6 space-y-3">
        {TERMINAL_LINES.map((line, index) => (
          <GlitchTypeLine
            key={index}
            prefix={line.prefix}
            text={line.text}
            delay={index * 800}
            onComplete={index === completedLines ? handleLineComplete : undefined}
          />
        ))}

        {completedLines >= TERMINAL_LINES.length && (
          <div className="flex flex-col gap-2 font-mono text-xs mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white/30">&gt;</span>
              <span className="text-white/50">{EVENTS.emptyPrompt}</span>
              <span className="text-arterial animate-pulse">_</span>
            </div>
            <p className="text-white/40 text-[10px] pl-4">
              {EVENTS.emptyMessage}
            </p>
          </div>
        )}
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
        }}
      />
    </div>
  )
}
