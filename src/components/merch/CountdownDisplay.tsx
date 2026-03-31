'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

interface CountdownDisplayProps {
  days: number
  hours: number
  minutes: number
  seconds: number
  progress: number
  className?: string
}

function TimeSegment({
  value,
  label,
}: {
  value: number
  label: string
}) {
  const [prevValue, setPrevValue] = useState(value)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    if (value !== prevValue) {
      setIsChanging(true)
      setPrevValue(value)
      const timer = setTimeout(() => setIsChanging(false), 300)
      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <div className="flex flex-col items-center">
      {/* Label ABOVE the number - better hierarchy */}
      <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] uppercase mb-1">
        {label}
      </span>

      {/* Number - no box, just typography */}
      <span
        className={clsx(
          'font-display text-4xl md:text-5xl lg:text-6xl tabular-nums',
          'transition-all duration-300',
          isChanging ? 'text-white' : 'text-white/80'
        )}
        style={{
          textShadow: isChanging
            ? '0 0 20px rgba(204, 0, 0, 0.6)'
            : 'none',
        }}
      >
        {String(value).padStart(2, '0')}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="font-display text-3xl md:text-4xl lg:text-5xl text-arterial/60 mx-2 md:mx-3 self-end mb-1">
      :
    </span>
  )
}

export function CountdownDisplay({
  days,
  hours,
  minutes,
  seconds,
  className,
}: CountdownDisplayProps) {
  return (
    <div className={clsx('flex flex-col items-center gap-4', className)}>
      {/* Terminal-style prefix */}
      <div className="font-mono text-xs text-arterial tracking-[0.2em]">
        UNLOCK_IN://
      </div>

      {/* Single line countdown - terminal format */}
      <div className="flex items-end justify-center scale-[0.85] sm:scale-100 origin-center">
        <TimeSegment value={days} label="Days" />
        <Separator />
        <TimeSegment value={hours} label="Hours" />
        <Separator />
        <TimeSegment value={minutes} label="Mins" />
        <Separator />
        <TimeSegment value={seconds} label="Secs" />
      </div>

      {/* Status line */}
      <div className="font-mono text-[10px] text-white/30 tracking-[0.3em]">
        STATUS:// <span className="text-arterial">SEALED</span>
      </div>

      {/* Single subtle line below */}
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
