'use client'

import { useEffect, useRef, useMemo } from 'react'
import clsx from 'clsx'

interface RitualSigilProps {
  progress: number // 0-1 (0 = dormant, 1 = fully awakened)
  className?: string
}

export function RitualSigil({ progress, className }: RitualSigilProps) {
  const sigilRef = useRef<SVGSVGElement>(null)

  // Calculate how many limbs should be illuminated (0-8)
  const activeLimbs = Math.ceil(progress * 8)

  // Pulse rate increases with progress
  const pulseSpeed = useMemo(() => {
    if (progress < 0.3) return 4 // Slow
    if (progress < 0.6) return 3 // Medium
    if (progress < 0.9) return 2 // Fast
    return 1 // Critical
  }, [progress])

  // Chromatic aberration intensity
  const chromaticOffset = useMemo(() => {
    return 2 + progress * 4 // 2px to 6px
  }, [progress])

  // Generate spike paths - 8 main spikes with sub-thorns
  const generateSpikes = () => {
    const spikes = []
    const numSpikes = 8
    const centerX = 200
    const centerY = 200

    for (let i = 0; i < numSpikes; i++) {
      const angle = (i * 360) / numSpikes - 90
      const rad = (angle * Math.PI) / 180
      const isActive = i < activeLimbs

      // Main spike
      const innerRadius = 40
      const outerRadius = 140 + (i % 2) * 30

      const x1 = centerX + Math.cos(rad) * innerRadius
      const y1 = centerY + Math.sin(rad) * innerRadius
      const x2 = centerX + Math.cos(rad) * outerRadius
      const y2 = centerY + Math.sin(rad) * outerRadius

      // Control points for curved shape
      const perpRad = rad + Math.PI / 2
      const curveOffset = 8

      const cx1 = centerX + Math.cos(rad) * (outerRadius * 0.6) + Math.cos(perpRad) * curveOffset
      const cy1 = centerY + Math.sin(rad) * (outerRadius * 0.6) + Math.sin(perpRad) * curveOffset
      const cx2 = centerX + Math.cos(rad) * (outerRadius * 0.6) - Math.cos(perpRad) * curveOffset
      const cy2 = centerY + Math.sin(rad) * (outerRadius * 0.6) - Math.sin(perpRad) * curveOffset

      spikes.push(
        <path
          key={`spike-${i}`}
          d={`M ${x1} ${y1} Q ${cx1} ${cy1} ${x2} ${y2} Q ${cx2} ${cy2} ${x1} ${y1}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={clsx(
            'transition-all duration-700',
            isActive ? 'opacity-100' : 'opacity-20'
          )}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none',
          }}
        />
      )

      // Sub-thorns
      const numThorns = 3
      for (let j = 1; j <= numThorns; j++) {
        const thornDist = innerRadius + ((outerRadius - innerRadius) * j) / (numThorns + 1)
        const thornLen = 20 + j * 5
        const thornAngleOffset = (j % 2 === 0 ? 1 : -1) * (25 + j * 5)
        const thornRad = ((angle + thornAngleOffset) * Math.PI) / 180

        const tx1 = centerX + Math.cos(rad) * thornDist
        const ty1 = centerY + Math.sin(rad) * thornDist
        const tx2 = tx1 + Math.cos(thornRad) * thornLen
        const ty2 = ty1 + Math.sin(thornRad) * thornLen

        spikes.push(
          <line
            key={`thorn-${i}-${j}`}
            x1={tx1}
            y1={ty1}
            x2={tx2}
            y2={ty2}
            stroke="currentColor"
            strokeWidth="1"
            className={clsx(
              'transition-all duration-700',
              isActive ? 'opacity-80' : 'opacity-10'
            )}
          />
        )
      }
    }

    // Inner wire ring
    spikes.push(
      <circle
        key="inner-ring"
        cx={centerX}
        cy={centerY}
        r={35}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="opacity-60"
      />
    )

    // Barbed wire connecting ring
    const wirePoints = []
    for (let i = 0; i < 16; i++) {
      const angle = (i * 360) / 16 - 90
      const rad = (angle * Math.PI) / 180
      const radius = 55 + (i % 2) * 15
      wirePoints.push(`${centerX + Math.cos(rad) * radius},${centerY + Math.sin(rad) * radius}`)
    }
    spikes.push(
      <polygon
        key="barbed-wire"
        points={wirePoints.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        className="opacity-40"
      />
    )

    return spikes
  }

  // Countdown ring progress
  const ringCircumference = 2 * Math.PI * 180
  const ringOffset = ringCircumference * (1 - progress)

  return (
    <div className={clsx('relative', className)}>
      {/* Chromatic aberration layers */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
        style={{ transform: `translateX(-${chromaticOffset}px)` }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full text-red-500">
          {generateSpikes()}
        </svg>
      </div>
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
        style={{ transform: `translateX(${chromaticOffset}px)` }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full text-cyan-400">
          {generateSpikes()}
        </svg>
      </div>

      {/* Main sigil */}
      <svg
        ref={sigilRef}
        viewBox="0 0 400 400"
        className={clsx(
          'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80',
          progress > 0.5 ? 'text-arterial' : 'text-white/70'
        )}
        style={{
          animation: `sigil-pulse ${pulseSpeed}s ease-in-out infinite`,
          filter: `drop-shadow(0 0 ${10 + progress * 20}px rgba(204, 0, 0, ${0.3 + progress * 0.4}))`,
        }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="ritual-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2 + progress * 4} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Countdown ring */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(0, 255, 65, 0.2)"
          strokeWidth="2"
        />
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="var(--signal)"
          strokeWidth="3"
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringOffset}
          strokeLinecap="round"
          transform="rotate(-90 200 200)"
          className="transition-all duration-1000"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0, 255, 65, 0.6))',
          }}
        />

        {/* Sigil content */}
        <g filter={progress > 0.3 ? 'url(#ritual-glow)' : 'none'}>
          {generateSpikes()}

          {/* Center eye */}
          <circle
            cx="200"
            cy="200"
            r={12 + progress * 5}
            fill="currentColor"
            className="transition-all duration-500"
            style={{
              animation: `eye-pulse ${pulseSpeed * 0.5}s ease-in-out infinite`,
            }}
          />
          <circle cx="200" cy="200" r="6" fill="#0a0a0a" />
        </g>

        {/* Progress markers (8 dots around ring) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8 - 90
          const rad = (angle * Math.PI) / 180
          const x = 200 + Math.cos(rad) * 180
          const y = 200 + Math.sin(rad) * 180
          const isLit = i < activeLimbs

          return (
            <circle
              key={`marker-${i}`}
              cx={x}
              cy={y}
              r={isLit ? 6 : 4}
              fill={isLit ? 'var(--arterial)' : 'rgba(255, 255, 255, 0.2)'}
              className="transition-all duration-500"
              style={{
                filter: isLit ? 'drop-shadow(0 0 8px rgba(204, 0, 0, 0.8))' : 'none',
              }}
            />
          )
        })}
      </svg>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(204, 0, 0, ${0.1 + progress * 0.15}) 0%, transparent 70%)`,
          animation: `glow-pulse ${pulseSpeed * 2}s ease-in-out infinite`,
        }}
      />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes sigil-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes eye-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
