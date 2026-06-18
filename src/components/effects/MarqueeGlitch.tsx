'use client'

import clsx from 'clsx'

interface MarqueeGlitchProps {
  text: string
  className?: string
  speed?: number
  /** @deprecated Character glitch disabled site-wide for performance */
  glitchInterval?: number
}

/** CSS-only marquee — no JS timers or per-character updates */
export function MarqueeGlitch({
  text,
  className,
  speed = 50,
}: MarqueeGlitchProps) {
  const animationDuration = (text.length * 20) / speed

  return (
    <div className={clsx('overflow-hidden whitespace-nowrap', className)}>
      <div
        className="inline-flex animate-marquee"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        {[0, 1].map((copy) => (
          <span key={copy} className="mx-8">
            {text}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  )
}
