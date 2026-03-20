'use client'

import { useRef } from 'react'
import { useSigilAnimation } from '@/hooks/useSigilAnimation'
import clsx from 'clsx'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    isLoaded,
    loadProgress,
    currentFrame,
    scrollProgress,
  } = useSigilAnimation(canvasRef, sectionRef)

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '500vh' }}
    >
      {/* Fixed fullscreen canvas */}
      <div className="fixed inset-0 z-0">
        {/* Loading screen */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-void">
            <div className="font-mono text-sm text-grey-mid mb-4 tracking-widest">
              LOADING SIGIL
            </div>
            <div className="w-64 h-[2px] bg-grey-dark overflow-hidden">
              <div
                className="h-full bg-arterial transition-all duration-100"
                style={{ width: `${loadProgress * 100}%` }}
              />
            </div>
            <div className="font-mono text-xs text-grey-dark mt-3">
              {Math.round(loadProgress * 100)}%
            </div>
          </div>
        )}

        {/* Fullscreen canvas */}
        <canvas
          ref={canvasRef}
          className={clsx(
            'w-full h-full transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Frame counter - top right */}
        {isLoaded && (
          <div className="absolute top-20 right-6 font-mono text-xs text-grey-dark z-10">
            {String(currentFrame + 1).padStart(3, '0')}/120
          </div>
        )}

        {/* Scroll hint - only show while scrolling through frames */}
        {isLoaded && scrollProgress < 0.95 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] text-grey-dark tracking-widest animate-pulse">
                SCROLL TO REVEAL
              </span>
              <div className="w-px h-12 bg-grey-dark relative overflow-hidden">
                <div
                  className="w-full bg-arterial transition-all duration-75"
                  style={{ height: `${scrollProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
