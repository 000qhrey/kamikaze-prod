'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MerchItem } from '@/data/merch'
import { MERCH } from '@/data/siteCopy'
import clsx from 'clsx'

interface MerchCardProps {
  item: MerchItem
  index: number
  onAddToCart: (item: MerchItem, size: string) => void
  onSelect: (item: MerchItem) => void
}

export function MerchCard({ item, index, onAddToCart, onSelect }: MerchCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mouseX, setMouseX] = useState(0.5)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const [selectedSize, setSelectedSize] = useState(item.sizes[0])
  const [showAcquired, setShowAcquired] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Glitch animation on hover
  useEffect(() => {
    if (!isHovered) {
      setGlitchOffset({ x: 0, y: 0 })
      return
    }

    const interval = setInterval(() => {
      setGlitchOffset({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 3,
      })
    }, 80)

    return () => clearInterval(interval)
  }, [isHovered])

  // Track mouse X for image rotation effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setMouseX(x)
  }

  const handleAcquire = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.stock === 'DEPLETED') return
    onAddToCart(item, selectedSize)
    setShowAcquired(true)
    setTimeout(() => setShowAcquired(false), 1500)
  }

  // Calculate rotation based on mouse position
  const rotateY = isHovered ? (mouseX - 0.5) * 20 : 0

  // Stock status styling
  const stockColor = {
    HIGH: 'text-signal',
    LOW: 'text-yellow-500',
    CRITICAL: 'text-arterial',
    DEPLETED: 'text-white/50',
  }[item.stock]

  // Stagger offset for asymmetric grid
  const verticalOffset = index % 3 === 1 ? 'mt-12' : index % 3 === 2 ? 'mt-6' : ''

  return (
    <div
      ref={cardRef}
      className={clsx(
        'group relative cursor-crosshair',
        verticalOffset
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(item)}
    >
      {/* Image container with glitch effects */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-void border border-white/30/20"
        style={{
          transform: `perspective(1000px) rotateY(${rotateY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/25 group-hover:border-arterial/70 transition-colors z-10" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/25 group-hover:border-arterial/70 transition-colors z-10" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/25 group-hover:border-arterial/70 transition-colors z-10" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/25 group-hover:border-arterial/70 transition-colors z-10" />

        {/* Serial number */}
        <div className="absolute top-3 left-6 font-mono text-[10px] text-white/50 group-hover:text-arterial/80 transition-colors z-10">
          #{item.serial}
        </div>

        {/* RGB Split - Red layer */}
        <div
          className={clsx(
            'absolute inset-0 transition-opacity duration-200',
            isHovered ? 'opacity-40' : 'opacity-0'
          )}
          style={{
            transform: `translate(${glitchOffset.x - 4}px, ${glitchOffset.y}px)`,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src={item.images[0]}
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'grayscale(1) brightness(1.1)', opacity: 0.7 }}
          />
          <div className="absolute inset-0 bg-red-600 mix-blend-multiply" />
        </div>

        {/* RGB Split - Cyan layer */}
        <div
          className={clsx(
            'absolute inset-0 transition-opacity duration-200',
            isHovered ? 'opacity-30' : 'opacity-0'
          )}
          style={{
            transform: `translate(${glitchOffset.x + 4}px, ${-glitchOffset.y}px)`,
            mixBlendMode: 'screen',
          }}
        >
          <Image
            src={item.images[0]}
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'grayscale(1) brightness(1.1)', opacity: 0.7 }}
          />
          <div className="absolute inset-0 bg-cyan-500 mix-blend-multiply" />
        </div>

        {/* Main image */}
        <Image
          src={item.images[0]}
          alt={item.name}
          fill
          className="object-cover transition-all duration-300"
          style={{
            filter: isHovered
              ? 'brightness(1.1) contrast(1.3) grayscale(0.3)'
              : 'brightness(0.9) contrast(1.2) grayscale(0.8)',
          }}
        />

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.4) 2px,
              rgba(0, 0, 0, 0.4) 4px
            )`,
          }}
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Technical readout on hover */}
        <div
          className={clsx(
            'absolute inset-x-4 bottom-4 p-3 bg-black/80 border border-arterial/40 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            <div>
              <span className="text-white/50 block">STOCK</span>
              <span className={stockColor}>{item.stock}</span>
            </div>
            {item.fabric && (
              <div>
                <span className="text-white/50 block">FABRIC</span>
                <span className="text-white">{item.fabric.split(' ')[0]}</span>
              </div>
            )}
            <div>
              <span className="text-white/50 block">{MERCH.rating}</span>
              <span className="text-arterial">{item.signal}/10</span>
            </div>
          </div>
        </div>

        {/* ACQUIRED flash */}
        {showAcquired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <span className="font-mono text-sm text-signal animate-pulse">
              [{MERCH.addedToCart}]
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3
              className={clsx(
                'font-mono text-sm tracking-wider transition-colors duration-200',
                isHovered ? 'text-arterial' : 'text-white'
              )}
              style={{
                textShadow: isHovered
                  ? `${glitchOffset.x}px 0 rgba(0, 255, 255, 0.4), ${-glitchOffset.x}px 0 rgba(255, 0, 0, 0.4)`
                  : 'none',
              }}
            >
              {item.name}
            </h3>
            <p className="font-mono text-xs text-white/50 mt-1">
              {item.category}
            </p>
          </div>
          <span className="font-mono text-sm text-white">
            €{item.price.toFixed(2)}
          </span>
        </div>

        {/* Size selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/50">SIZE:</span>
          <div className="flex gap-1">
            {item.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSize(size)
                }}
                className={clsx(
                  'font-mono text-[10px] px-2 py-1 border transition-all duration-200',
                  selectedSize === size
                    ? 'border-arterial text-arterial bg-arterial/10'
                    : 'border-white/30/30 text-white/50 hover:border-white/60 hover:text-white/80'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Acquire button */}
        <button
          onClick={handleAcquire}
          disabled={item.stock === 'DEPLETED'}
          className={clsx(
            'w-full py-3 font-mono text-xs tracking-widest border transition-all duration-300',
            item.stock === 'DEPLETED'
              ? 'border-white/30/30 text-white/50 cursor-not-allowed'
              : 'border-white/30/50 text-white hover:border-arterial hover:text-arterial hover:bg-arterial/5'
          )}
        >
          {item.stock === 'DEPLETED' ? `[ ${MERCH.soldOut} ]` : `[ ${MERCH.addToCart} ]`}
        </button>
      </div>
    </div>
  )
}
