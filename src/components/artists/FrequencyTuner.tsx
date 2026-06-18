'use client'

import { useState, useRef, useEffect } from 'react'
import { Genre, GENRE_FREQUENCIES } from '@/data/signals'
import { setActiveFrequency } from '@/components/canvas/NeuralVoid'
import { playChannelSwitch, playHoverSound } from '@/hooks/useSonicFeedback'
import { ARTISTS } from '@/data/siteCopy'
import clsx from 'clsx'

interface FrequencyTunerProps {
  selectedGenre: Genre | null
  onGenreChange: (genre: Genre | null) => void
}

const GENRES: Genre[] = [
  'INDUSTRIAL_BOUNCE',
  'DARK_TECHNO',
  'ACID',
  'HARDCORE',
  'GABBER',
  'BREAKCORE',
  'EBM',
  'NOISE',
  'AMBIENT_DRONE',
]

export function FrequencyTuner({ selectedGenre, onGenreChange }: FrequencyTunerProps) {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const dialRef = useRef<HTMLDivElement>(null)
  const lastAngleRef = useRef(0)

  // Calculate genre from rotation
  const getGenreFromRotation = (rot: number): Genre | null => {
    const normalized = ((rot % 360) + 360) % 360
    const index = Math.floor(normalized / (360 / GENRES.length))
    return GENRES[index] || null
  }

  // Handle dial interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updateRotation(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    updateRotation(e)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const updateRotation = (e: React.PointerEvent) => {
    if (!dialRef.current) return

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
    const degrees = (angle * 180) / Math.PI + 90

    // Snap to genre positions
    const snapAngle = 360 / GENRES.length
    const snapped = Math.round(degrees / snapAngle) * snapAngle

    if (Math.abs(snapped - lastAngleRef.current) > snapAngle / 2) {
      // Trigger glitch and sound on genre change
      setIsGlitching(true)
      playChannelSwitch()
      setTimeout(() => setIsGlitching(false), 200)
      lastAngleRef.current = snapped
    }

    setRotation(snapped)
  }

  // Update selected genre when rotation changes
  useEffect(() => {
    const genre = getGenreFromRotation(rotation)
    if (genre !== selectedGenre) {
      onGenreChange(genre)
      if (genre) {
        setActiveFrequency(genre, true)
        setTimeout(() => setActiveFrequency(null, false), 500)
      }
    }
  }, [rotation, selectedGenre, onGenreChange])

  const currentGenre = getGenreFromRotation(rotation)
  const genreConfig = currentGenre ? GENRE_FREQUENCIES[currentGenre] : null

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs text-arterial tracking-widest">
          [{ARTISTS.filterTitle}]
        </span>
        <div className="flex-1 h-px bg-white/20" />
        <button
          onClick={() => {
            setRotation(0)
            onGenreChange(null)
            playHoverSound()
          }}
          className="font-mono text-xs text-white/50 hover:text-arterial transition-colors px-3 py-2 min-h-[44px] focus:ring-2 focus:ring-arterial focus:outline-none"
        >
          [ RESET ]
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        {/* Dial */}
        <div
          ref={dialRef}
          tabIndex={0}
          role="slider"
          aria-valuenow={rotation}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-label="Frequency tuner dial"
          className={clsx(
            'relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 cursor-grab active:cursor-grabbing',
            'transition-all duration-200',
            isDragging ? 'border-arterial scale-105' : 'border-white/40',
            isGlitching && 'animate-pulse',
            'focus:ring-2 focus:ring-arterial focus:outline-none'
          )}
          style={{
            background: `conic-gradient(from 0deg,
              ${GENRES.map((g, i) => `${GENRE_FREQUENCIES[g].color}20 ${(i / GENRES.length) * 100}% ${((i + 1) / GENRES.length) * 100}%`).join(', ')}
            )`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onKeyDown={(e) => {
            const snapAngle = 360 / GENRES.length
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault()
              setRotation((r) => (r + snapAngle) % 360)
              playChannelSwitch()
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault()
              setRotation((r) => (((r - snapAngle) % 360) + 360) % 360)
              playChannelSwitch()
            }
          }}
        >
          {/* Center indicator */}
          <div className="absolute inset-4 rounded-full bg-void border border-white/30 flex items-center justify-center">
            <div
              className={clsx(
                'w-3 h-3 rounded-full transition-colors duration-200',
                currentGenre ? 'bg-arterial' : 'bg-white/30'
              )}
              style={{
                backgroundColor: genreConfig?.color || undefined,
                boxShadow: genreConfig ? `0 0 10px ${genreConfig.color}` : 'none',
              }}
            />
          </div>

          {/* Rotation indicator */}
          <div
            className="absolute top-1 left-1/2 w-0.5 h-6 bg-arterial origin-bottom"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: '50% 200%',
            }}
          />

          {/* Genre markers */}
          {GENRES.map((genre, i) => {
            const angle = (i / GENRES.length) * 360 - 90
            const rad = (angle * Math.PI) / 180
            const x = Math.cos(rad) * 56 + 64
            const y = Math.sin(rad) * 56 + 64

            return (
              <div
                key={genre}
                className={clsx(
                  'absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1 transition-all duration-200',
                  currentGenre === genre ? 'scale-150' : 'scale-100'
                )}
                style={{
                  left: x,
                  top: y,
                  backgroundColor: GENRE_FREQUENCIES[genre].color,
                  boxShadow: currentGenre === genre ? `0 0 8px ${GENRE_FREQUENCIES[genre].color}` : 'none',
                }}
              />
            )
          })}

          {/* Static overlay when glitching */}
          {isGlitching && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-50"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 255, 255, 0.1) 2px,
                  rgba(255, 255, 255, 0.1) 4px
                )`,
              }}
            />
          )}
        </div>

        {/* Current frequency display */}
        <div className="flex-1">
          <div className="font-mono text-xs text-white/50 mb-2">
            {ARTISTS.currentFilter}
          </div>
          <div
            className={clsx(
              'font-mono text-lg tracking-wider transition-all duration-200',
              currentGenre ? 'text-white' : 'text-white/50'
            )}
            style={{
              color: genreConfig?.color || undefined,
              textShadow: genreConfig ? `0 0 10px ${genreConfig.color}40` : 'none',
            }}
          >
            {currentGenre ? currentGenre.replace(/_/g, ' ') : `[ ${ARTISTS.allGenres} ]`}
          </div>

          {/* Frequency stats */}
          {genreConfig && (
            <div className="mt-4 space-y-1 font-mono text-xs text-white/70">
              <div>
                CURL: <span className="text-white">{genreConfig.curl.toFixed(1)}</span>
              </div>
              <div>
                SPEED: <span className="text-white">{genreConfig.speed.toFixed(1)}</span>
              </div>
              <div>
                INTENSITY: <span className="text-white">{(genreConfig.intensity * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instruction */}
      <p className="mt-4 font-mono text-xs text-white/50">
        {ARTISTS.filterHint}
      </p>
    </div>
  )
}
