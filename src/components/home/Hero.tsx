'use client'

import { useRef, useEffect, useState } from 'react'
import { useSigilAnimation } from '@/hooks/useSigilAnimation'
import clsx from 'clsx'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [glitchSeed, setGlitchSeed] = useState(0)
  const [scale, setScale] = useState(1)

  const {
    isLoaded,
    loadProgress,
    currentFrame,
    scrollProgress,
  } = useSigilAnimation(canvasRef, sectionRef)

  // Text reveals only after all 120 frames are exhausted (scrollProgress >= 0.95)
  const showText = scrollProgress >= 0.95

  // Constant subtle breathing animation on the logo
  useEffect(() => {
    if (!showText) return

    let frame: number
    let start: number | null = null

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start

      // Slow breathing scale (1% variation over 4 seconds)
      const breath = 1 + Math.sin(elapsed * 0.0005) * 0.01
      setScale(breath)

      // Random glitch seed for turbulence (changes every ~2 seconds)
      if (Math.random() < 0.002) {
        setGlitchSeed(Math.random())
      }

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [showText])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '500vh' }} // Tall section for scroll journey through 120 frames
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

        {/* Scroll hint - only show before text appears */}
        {isLoaded && !showText && (
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

      {/* SVG Filter for glitch effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="logo-glitch" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={0.01 + glitchSeed * 0.005}
              numOctaves="2"
              result="turbulence"
              seed={Math.floor(glitchSeed * 100)}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={glitchSeed > 0.8 ? 4 : 1}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Text reveal - only shows after frame 120 */}
      <div
        className={clsx(
          'fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none transition-all duration-1000',
          showText ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Title - blend with sigil, with breathing and glitch */}
        <div className="relative overflow-hidden">
          <h1
            className={clsx(
              'font-display text-hero text-center text-white transition-all duration-1000',
              'mix-blend-difference',
              showText ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: showText ? '200ms' : '0ms',
              textShadow: '0 0 80px rgba(204, 0, 0, 0.3)',
              transform: showText ? `scale(${scale})` : 'translateY(100%)',
              filter: showText ? 'url(#logo-glitch)' : 'none',
            }}
          >
            KAMIKAZE
          </h1>
        </div>

        {/* Tagline - blend with sigil */}
        <div className="relative overflow-hidden mt-6">
          <p
            className={clsx(
              'font-mono text-sm sm:text-base text-white/90 tracking-[0.3em] uppercase transition-all duration-700',
              'mix-blend-difference',
              showText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: showText ? '500ms' : '0ms',
            }}
          >
            UNDERGROUND NEVER DIES
          </p>
        </div>

        {/* Moto - no blend, sits on top */}
        <div
          className={clsx(
            'relative mt-8 transition-all duration-700',
            showText ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            transitionDelay: showText ? '800ms' : '0ms',
          }}
        >
          <span className="font-mono text-xs text-arterial tracking-widest">
            {'// ENTER OR BE ENTERED'}
          </span>
        </div>
      </div>
    </section>
  )
}
