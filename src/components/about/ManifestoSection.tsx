'use client'

import { useRef, useEffect, useState } from 'react'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { ABOUT, ABOUT_STORY, type StoryBlock } from '@/data/siteCopy'
import clsx from 'clsx'

function ManifestoLine({
  line,
  index,
  isVisible,
}: {
  line: StoryBlock
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
          'font-display text-2xl sm:text-3xl md:text-4xl tracking-wider mb-4 text-white'
        )}
        style={{ transitionDelay: `${index * 80}ms` }}
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
          'font-mono text-base sm:text-lg text-arterial tracking-wide mb-4'
        )}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        {line.text}
      </p>
    )
  }

  return (
    <p
      className={clsx(
        baseClass,
        'font-mono text-sm sm:text-base text-white/75 leading-relaxed mb-4'
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {line.text}
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
    <section ref={sectionRef} className="relative py-12 md:py-16">
      <div className="flex items-center gap-4 mb-12">
        <span className="font-mono text-xs text-arterial tracking-widest">
          [ORIGIN]
        </span>
        <div className="flex-1 h-px bg-white/20" />
        <span className="font-mono text-xs text-white/50">
          {isVisible ? 'LOADED' : ABOUT.loading}
        </span>
      </div>

      <div className="max-w-3xl">
        {ABOUT_STORY.map((line, index) => (
          <ManifestoLine
            key={`${line.type}-${index}`}
            line={line}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/20">
        <p className="font-mono text-xs text-white/50 tracking-widest">
          {ABOUT.attribution}
        </p>
      </div>
    </section>
  )
}
