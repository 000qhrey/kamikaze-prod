'use client'

/**
 * CSS-based film grain effect.
 * Uses SVG noise filter with CSS animation - zero JS overhead.
 * Previous implementation used canvas ImageData which was extremely expensive
 * (8M+ pixel operations per frame at 20fps).
 */
export function FilmGrain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
      style={{
        opacity: 0.04,
        mixBlendMode: 'overlay',
      }}
    >
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="film-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            >
              {/* Animate seed to create grain movement */}
              <animate
                attributeName="seed"
                values="0;100"
                dur="1s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>
    </div>
  )
}
