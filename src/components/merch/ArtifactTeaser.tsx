'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MerchItem } from '@/data/merch'
import clsx from 'clsx'

interface ArtifactTeaserProps {
  items: MerchItem[]
  progress: number // 0-1
  className?: string
}

// Map of item categories to ritual names
const ARTIFACT_NAMES: Record<string, string> = {
  'APPAREL': 'VESSEL',
  'ACCESSORY': 'MARK',
  'ARTIFACT': 'SIGIL',
}

function ArtifactCard({
  item,
  index,
  progress,
}: {
  item: MerchItem
  index: number
  progress: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Blur decreases as progress increases
  // At progress 0, blur = 15px. At progress 1, blur = 0px
  const blurAmount = Math.max(0, (1 - progress) * 15)

  // Brightness increases with progress
  const brightness = 0.1 + progress * 0.4

  // Random offset for staggered reveal effect
  const revealOffset = (index % 4) * 0.1

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div
        className={clsx(
          'relative aspect-square overflow-hidden bg-black/40 border transition-all duration-500',
          isHovered ? 'border-arterial' : 'border-white/10'
        )}
      >
        {/* Actual image (heavily obscured) */}
        <Image
          src={item.images[0]}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-all duration-700"
          style={{
            filter: `
              brightness(${brightness + (isHovered ? 0.1 : 0)})
              blur(${isHovered ? Math.max(0, blurAmount - 3) : blurAmount}px)
              grayscale(${1 - progress * 0.5})
            `,
          }}
        />

        {/* Corruption overlay */}
        <div
          className={clsx(
            'absolute inset-0 transition-opacity duration-300',
            isHovered ? 'opacity-60' : 'opacity-80'
          )}
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(0, 0, 0, 0.3) 2px,
                rgba(0, 0, 0, 0.3) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 10px,
                rgba(204, 0, 0, 0.05) 10px,
                rgba(204, 0, 0, 0.05) 12px
              )
            `,
          }}
        />

        {/* Hover message */}
        {isHovered && progress < 0.9 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="font-mono text-xs text-arterial animate-pulse tracking-wider">
              INSUFFICIENT SIGNAL
            </span>
          </div>
        )}

        {/* Glitch line on hover */}
        {isHovered && (
          <div
            className="absolute left-0 right-0 h-[2px] bg-arterial/50"
            style={{
              top: `${30 + Math.random() * 40}%`,
              animation: 'glitch-line 0.2s steps(2) infinite',
            }}
          />
        )}
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className="font-mono text-[10px] text-white/50 tracking-[0.2em]">
          ARTIFACT_{String(index + 1).padStart(3, '0')}
        </div>
        <div className="font-mono text-xs text-white/30 mt-1">
          {`// ${ARTIFACT_NAMES[item.category] || 'RELIC'}`}
        </div>
      </div>

      <style jsx>{`
        @keyframes glitch-line {
          0% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(3px); opacity: 0.5; }
          100% { transform: translateX(-2px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export function ArtifactTeaser({ items, progress, className }: ArtifactTeaserProps) {
  // Show first 4 items as teasers
  const teaserItems = items.slice(0, 4)

  return (
    <div className={clsx('w-full max-w-4xl', className)}>
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="font-mono text-xs text-arterial tracking-[0.3em] mb-2">
          {'>'} ARTIFACTS MATERIALIZING {'<'}
        </div>
        <div className="font-mono text-[10px] text-white/30">
          {Math.round(progress * 100)}% DECODED
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {teaserItems.map((item, index) => (
          <ArtifactCard
            key={item.id}
            item={item}
            index={index}
            progress={progress}
          />
        ))}
      </div>

      {/* More artifacts indicator */}
      {items.length > 4 && (
        <div className="text-center mt-6 font-mono text-xs text-white/30">
          +{items.length - 4} MORE ARTIFACTS SEALED
        </div>
      )}
    </div>
  )
}
