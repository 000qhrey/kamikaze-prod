'use client'

import { useRef, useEffect, useState } from 'react'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { ABOUT } from '@/data/siteCopy'
import clsx from 'clsx'

interface ManifestoLine {
  text: string
  type: 'heading' | 'body' | 'emphasis'
}

const MANIFESTO_LINES: ManifestoLine[] = [
  { text: 'WE ARE NOT HERE TO BUILD IDOLS.', type: 'heading' },
  { text: 'WE ARE HERE TO AMPLIFY SOUND.', type: 'heading' },
  { text: '', type: 'body' },
  {
    text: 'The underground was never about names—it was about energy.',
    type: 'body',
  },
  {
    text: 'Every bass drop is a demolition. Every beat is a heartbeat synchronized across hundreds of bodies.',
    type: 'body',
  },
  { text: '', type: 'body' },
  {
    text: 'KAMIKAZE is not a label. It is a rupture in the membrane between noise and transcendence.',
    type: 'emphasis',
  },
  { text: '', type: 'body' },
  {
    text: 'We curate moments of controlled collapse—events where the boundary between performer and audience dissolves into pure frequency.',
    type: 'body',
  },
  { text: '', type: 'body' },
  { text: 'This is not entertainment.', type: 'emphasis' },
  { text: 'This is congregation.', type: 'emphasis' },
]

function ManifestoLine({
  line,
  index,
  isVisible,
}: {
  line: ManifestoLine
  index: number
  isVisible: boolean
}) {
  if (line.text === '') {
    return <div className="h-6" />
  }

  const baseClass = clsx(
    'transition-all duration-700',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
  )

  if (line.type === 'heading') {
    return (
      <h2
        className={clsx(
          baseClass,
          'font-display text-3xl sm:text-4xl md:text-5xl tracking-wider mb-4'
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <ScrambleText triggerOnView triggerOnHover={false} duration={600}>
          {line.text}
        </ScrambleText>
      </h2>
    )
  }

  if (line.type === 'emphasis') {
    return (
      <p
        className={clsx(
          baseClass,
          'font-mono text-lg sm:text-xl text-arterial tracking-wide mb-4'
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <ScrambleText
          triggerOnView
          triggerOnHover={false}
          duration={500}
          resolveToColor="#cc0000"
          finalColor="#cc0000"
        >
          {line.text}
        </ScrambleText>
      </p>
    )
  }

  return (
    <p
      className={clsx(
        baseClass,
        'font-mono text-sm sm:text-base text-white/70 leading-relaxed mb-4'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <ScrambleText triggerOnView triggerOnHover={false} duration={400}>
        {line.text}
      </ScrambleText>
    </p>
  )
}

export function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24">
      {/* Decryption indicator */}
      <div className="flex items-center gap-4 mb-12">
        <span className="font-mono text-xs text-arterial tracking-widest">
          [{ABOUT.loading}]
        </span>
        <div className="flex-1 h-px bg-white/20/30" />
        <span className="font-mono text-xs text-white/50">
          {isVisible ? 'ACCESS_GRANTED' : 'LOCKED'}
        </span>
      </div>

      {/* Manifesto content */}
      <div className="max-w-3xl">
        {MANIFESTO_LINES.map((line, index) => (
          <ManifestoLine
            key={index}
            line={line}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>

      {/* Footer attribution */}
      <div className="mt-16 pt-8 border-t border-white/30">
        <p className="font-mono text-xs text-white/50 tracking-widest">
          — KAMIKAZE COLLECTIVE // EST. 2026
        </p>
      </div>
    </section>
  )
}
