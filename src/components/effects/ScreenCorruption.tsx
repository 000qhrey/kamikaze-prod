'use client'

import { useState, useEffect, useRef } from 'react'
import { getDangerLevel, onGlitchChange } from '@/hooks/useSigilGlitch'
import clsx from 'clsx'

// VHS tracking band positions - randomized per danger event
interface TrackingBand {
  top: number
  height: number
  offset: number
}

export function ScreenCorruption() {
  const [dangerLevel, setDangerLevel] = useState(0)
  const [trackingBands, setTrackingBands] = useState<TrackingBand[]>([])
  const [flashActive, setFlashActive] = useState(false)
  const frameRef = useRef(0)

  // Subscribe to danger level changes
  useEffect(() => {
    const update = () => {
      const level = getDangerLevel()
      setDangerLevel(level)

      // Generate tracking bands on danger activation
      if (level > 0) {
        const bandCount = level === 3 ? 5 : level === 2 ? 3 : 1
        const bands: TrackingBand[] = []
        for (let i = 0; i < bandCount; i++) {
          bands.push({
            top: Math.random() * 80 + 10, // 10-90%
            height: Math.random() * 3 + 1, // 1-4%
            offset: (Math.random() - 0.5) * 20, // -10 to 10px
          })
        }
        setTrackingBands(bands)

        // Flash on level 3
        if (level === 3) {
          setFlashActive(true)
          setTimeout(() => setFlashActive(false), 100)
        }
      }
    }

    update() // Initial read
    const unsubscribe = onGlitchChange(update)
    return () => { unsubscribe() }
  }, [])

  // Animate tracking bands
  useEffect(() => {
    if (dangerLevel === 0) return

    const animate = () => {
      frameRef.current++

      // Randomize band positions occasionally
      if (frameRef.current % 5 === 0) {
        setTrackingBands((prev) =>
          prev.map((band) => ({
            ...band,
            top: band.top + (Math.random() - 0.5) * 2,
            offset: (Math.random() - 0.5) * (dangerLevel * 8),
          }))
        )
      }

      if (dangerLevel > 0) {
        requestAnimationFrame(animate)
      }
    }

    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [dangerLevel])

  if (dangerLevel === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[90]">
      {/* VHS Tracking bands - horizontal displacement (unique effect) */}
      {trackingBands.map((band, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 bg-arterial/30 mix-blend-screen"
          style={{
            top: `${band.top}%`,
            height: `${band.height}%`,
            transform: `translateX(${band.offset}px)`,
            transition: 'transform 0.05s linear',
          }}
        />
      ))}

      {/* Scanlines, noise, vignette removed - handled by SigilScene3D post-processing */}

      {/* Red flash on critical (level 3) */}
      <div
        className={clsx(
          'absolute inset-0 bg-arterial/30 transition-opacity duration-75',
          flashActive ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Corner warning indicators */}
      {dangerLevel >= 2 && (
        <>
          <div className="absolute top-4 left-4 font-mono text-[10px] text-arterial animate-pulse">
            [!] SYSTEM_ALERT
          </div>
          <div className="absolute top-4 right-4 font-mono text-[10px] text-arterial animate-pulse">
            DANGER_LVL: {dangerLevel}
          </div>
        </>
      )}

      {dangerLevel === 3 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-arterial animate-pulse tracking-widest">
          [ WARNING: UNAUTHORIZED ACCESS DETECTED ]
        </div>
      )}
    </div>
  )
}
