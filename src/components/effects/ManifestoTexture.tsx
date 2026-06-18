'use client'

interface ManifestoTextureProps {
  phrase?: string
  offsetY?: number
  /** @deprecated Parallax disabled site-wide for scroll performance */
  parallaxSpeed?: number
}

/** Static background typography — no scroll listeners or timers */
export function ManifestoTexture({
  phrase = 'KAMIKAZE',
  offsetY = 0,
}: ManifestoTextureProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      <div
        className="absolute whitespace-nowrap font-display text-white/[0.04] select-none"
        style={{
          fontSize: 'clamp(150px, 25vw, 350px)',
          lineHeight: 1,
          transform: 'translateX(-10%)',
          top: '20%',
        }}
      >
        {phrase}
      </div>

      <div
        className="absolute whitespace-nowrap font-display text-arterial/[0.02] select-none"
        style={{
          fontSize: 'clamp(100px, 18vw, 250px)',
          lineHeight: 1,
          transform: 'translateX(5%)',
          top: '55%',
        }}
      >
        {phrase}
      </div>

      <div
        className="absolute font-mono text-white/[0.03] select-none"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: 'clamp(60px, 8vw, 100px)',
          right: '5%',
          top: '10%',
        }}
      >
        {phrase.split(' ').slice(0, 2).join(' ')}
      </div>
    </div>
  )
}
