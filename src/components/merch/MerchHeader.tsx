'use client'

import { useEffect, useRef } from 'react'

import { MERCH } from '@/data/siteCopy'

const SCROLL_TEXT = 'LIMITED DROP // NO RESTOCKS // UNDERGROUND ONLY // '

export function MerchHeader() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let position = 0
    const speed = 0.5

    const animate = () => {
      position -= speed
      if (position <= -50) {
        position = 0
      }
      el.style.transform = `translateX(${position}%)`
      requestAnimationFrame(animate)
    }

    const frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="relative pt-24 pb-16 overflow-hidden">
      {/* Scrolling background text */}
      <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden opacity-[0.06]">
        <div
          ref={scrollRef}
          className="whitespace-nowrap font-display text-[15vw] tracking-tighter"
          style={{ width: '200%' }}
        >
          {SCROLL_TEXT.repeat(6)}
        </div>
      </div>

      {/* Main header content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="font-mono text-xs text-arterial tracking-widest">
            {MERCH.pageTitle}
          </span>
          <div className="flex-1 h-px bg-white/20/30 mt-2" />
        </div>

        <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-4">
          {MERCH.pageTitle}
        </h1>

        <div className="flex flex-wrap gap-6 font-mono text-xs text-white/70">
          <div>
            <span className="text-white/50">STATUS:</span>
            <span className="text-signal ml-2">ACTIVE</span>
          </div>
          <div>
            <span className="text-white/50">INVENTORY:</span>
            <span className="text-white ml-2">8 UNITS</span>
          </div>
          <div>
            <span className="text-white/50">SHIPPING:</span>
            <span className="text-arterial ml-2">WORLDWIDE</span>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mt-8 p-4 border border-arterial/30 bg-arterial/5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-arterial animate-pulse">[!]</span>
            <p className="font-mono text-xs text-white/70">
              {MERCH.finalSale}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
