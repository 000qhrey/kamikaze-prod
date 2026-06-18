'use client'

import { useEffect, useState } from 'react'

/** Compact sigil — avoids multi-KB strings and per-frame glitch work */
const SIGIL = `
            .     |     .
         .--+-----+-----+--.
        /   \\    |    /   \\
       +-----+---+---+-----+
        \\   /    |    \\   /
         '--+-----+-----+--'
            |     |     |
            '-----+-----'
                  |
`

export function ArtistsBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-[#050505]" aria-hidden="true" />
  }

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-[#050505] flex items-center justify-center"
      aria-hidden="true"
      style={{ contain: 'strict' }}
    >
      <pre
        className="font-mono text-[6px] sm:text-[9px] md:text-[11px] select-none whitespace-pre text-[#3a9a9a]/40 leading-tight pointer-events-none"
        style={{ textShadow: '0 0 30px rgba(0, 180, 180, 0.15)' }}
      >
        {SIGIL}
      </pre>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 35%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </div>
  )
}
