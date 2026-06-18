'use client'

import { useInView } from '@/hooks/useInView'
import { useTransition } from '@/providers/TransitionProvider'
import { ABOUT_HOME } from '@/data/siteCopy'
import clsx from 'clsx'

export function AboutSection() {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.15, triggerOnce: true })
  const { navigateTo } = useTransition()

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 px-4 sm:px-6 border-t border-white/10 bg-void"
      aria-labelledby="about-home-heading"
    >
      <div
        className={clsx(
          'max-w-3xl mx-auto transition-all duration-700',
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <p className="font-mono text-xs text-arterial tracking-[0.35em] mb-4">
          [{ABOUT_HOME.eyebrow}]
        </p>

        <h2
          id="about-home-heading"
          className="font-display text-3xl md:text-5xl tracking-wider text-white mb-6"
        >
          {ABOUT_HOME.title}
        </h2>

        <p className="font-mono text-sm md:text-base text-white/80 leading-relaxed mb-10">
          {ABOUT_HOME.body}
        </p>

        <ul className="space-y-4 mb-10">
          {ABOUT_HOME.pillars.map((pillar) => (
            <li
              key={pillar.label}
              className="flex gap-4 font-mono text-sm border-l-2 border-arterial/40 pl-4"
            >
              <span className="text-arterial shrink-0">{pillar.label}</span>
              <span className="text-white/70">{pillar.text}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => navigateTo(ABOUT_HOME.ctaHref)}
          className="font-mono text-xs tracking-widest text-arterial border border-arterial/50 px-5 py-3 hover:bg-arterial/10 transition-colors"
        >
          [ {ABOUT_HOME.cta} → ]
        </button>
      </div>
    </section>
  )
}
