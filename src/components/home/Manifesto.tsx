'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import clsx from 'clsx'

const MANIFESTO_TEXT = `KAMIKAZE is not a label. It's a rupture in the membrane between noise and transcendence. We curate moments of controlled collapse—events where the boundary between performer and audience dissolves into pure frequency. Every bass drop is a demolition. Every beat is a heartbeat synchronized across hundreds of bodies. This is not entertainment. This is congregation.`

export function Manifesto() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3, triggerOnce: true })
  const [visibleWords, setVisibleWords] = useState(0)
  const words = MANIFESTO_TEXT.split(' ')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isInView && visibleWords === 0) {
      intervalRef.current = setInterval(() => {
        setVisibleWords((prev) => {
          if (prev >= words.length) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return prev
          }
          return prev + 1
        })
      }, 80)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isInView, visibleWords, words.length])

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-lg sm:text-xl leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={clsx(
                'transition-all duration-300',
                index < visibleWords
                  ? 'opacity-100 blur-0'
                  : 'opacity-0 blur-sm'
              )}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
