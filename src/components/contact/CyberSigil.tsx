'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

interface CyberSigilProps {
  isActive: boolean
  onHover: (active: boolean) => void
}

export function CyberSigil({ isActive, onHover }: CyberSigilProps) {
  const sigilRef = useRef<SVGSVGElement>(null)
  const [turbulence, setTurbulence] = useState(0)

  // Animate turbulence on hover
  useEffect(() => {
    if (!isActive) {
      setTurbulence(0)
      return
    }

    let frame: number
    let start: number | null = null

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start

      // Pulsing turbulence effect
      const pulse = Math.sin(elapsed * 0.003) * 0.5 + 0.5
      setTurbulence(0.01 + pulse * 0.02)

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [isActive])

  // Generate spike paths - 8 main spikes with sub-thorns
  const generateSpikes = () => {
    const spikes = []
    const numSpikes = 8
    const centerX = 200
    const centerY = 200

    for (let i = 0; i < numSpikes; i++) {
      const angle = (i * 360) / numSpikes - 90
      const rad = (angle * Math.PI) / 180

      // Main spike
      const innerRadius = 40
      const outerRadius = 140 + (i % 2) * 30 // Alternating lengths

      const x1 = centerX + Math.cos(rad) * innerRadius
      const y1 = centerY + Math.sin(rad) * innerRadius
      const x2 = centerX + Math.cos(rad) * outerRadius
      const y2 = centerY + Math.sin(rad) * outerRadius

      // Control points for curved, needle-like shape
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
          className="transition-all duration-300"
        />
      )

      // Sub-thorns branching off main spike
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
            className="transition-all duration-300"
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
      />
    )

    // Barbed wire connecting inner thorns
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
        className="opacity-60"
      />
    )

    return spikes
  }

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={() => onHover(!isActive)}
    >
      <svg
        ref={sigilRef}
        viewBox="0 0 400 400"
        className={clsx(
          'w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 transition-all duration-500',
          isActive ? 'text-arterial' : 'text-white/70'
        )}
        style={{
          filter: isActive ? 'url(#displace)' : 'none',
          transform: isActive ? 'rotate(22.5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        }}
      >
        <defs>
          {/* Displacement filter for throbbing effect */}
          <filter id="displace" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={turbulence}
              numOctaves="3"
              result="turbulence"
              seed="1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={isActive ? 8 : 0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={isActive ? 'url(#glow)' : 'none'}>
          {generateSpikes()}

          {/* Center eye/void */}
          <circle
            cx="200"
            cy="200"
            r="15"
            fill="currentColor"
            className={clsx(
              'transition-all duration-300',
              isActive ? 'opacity-100' : 'opacity-40'
            )}
          />
          <circle
            cx="200"
            cy="200"
            r="8"
            fill="#0a0a0a"
          />
        </g>
      </svg>

      {/* Pulsing outer glow on hover */}
      <div
        className={clsx(
          'absolute inset-0 rounded-full transition-opacity duration-500',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: 'radial-gradient(circle, rgba(204,0,0,0.15) 0%, transparent 70%)',
          animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  )
}
