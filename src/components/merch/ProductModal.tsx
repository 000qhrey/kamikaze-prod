'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MerchItem } from '@/data/merch'
import { MERCH } from '@/data/siteCopy'
import clsx from 'clsx'

interface ProductModalProps {
  item: MerchItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MerchItem, size: string) => void
}

export function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [mouseX, setMouseX] = useState(0.5)
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const [showAcquired, setShowAcquired] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Set default size when item changes
  useEffect(() => {
    if (item) {
      setSelectedSize(item.sizes[0])
    }
  }, [item])

  // Glitch animation
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setGlitchOffset({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isOpen])

  // Track mouse for 3D rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setMouseX(x)
  }

  const handleAcquire = () => {
    if (!item || item.stock === 'DEPLETED') return
    onAddToCart(item, selectedSize)
    setShowAcquired(true)
    setTimeout(() => {
      setShowAcquired(false)
      onClose()
    }, 1200)
  }

  if (!item) return null

  // Calculate rotation based on mouse
  const rotateY = (mouseX - 0.5) * 25
  const rotateX = -5

  // Stock color
  const stockColor = {
    HIGH: 'text-signal',
    LOW: 'text-yellow-500',
    CRITICAL: 'text-arterial animate-pulse',
    DEPLETED: 'text-white/50',
  }[item.stock]

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          'fixed inset-4 md:inset-12 z-50 overflow-hidden',
          'bg-void border border-white/30/30',
          'transition-all duration-500',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 font-mono text-xs text-white/80 hover:text-arterial transition-colors"
        >
          [CLOSE]
        </button>

        <div className="h-full flex flex-col md:flex-row">
          {/* Image section */}
          <div
            ref={imageRef}
            className="relative flex-1 md:w-1/2 bg-black overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
          >
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 z-10" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30 z-10" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30 z-10" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 z-10" />

            {/* Serial number */}
            <div className="absolute top-6 left-12 font-mono text-xs text-white/70 z-10">
              ITEM_REF: <span className="text-arterial">{item.serial}</span>
            </div>

            {/* RGB Split layers */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                transform: `translate(${glitchOffset.x - 6}px, ${glitchOffset.y}px)`,
                mixBlendMode: 'screen',
              }}
            >
              <Image
                src={item.images[0]}
                alt=""
                fill
                className="object-contain p-12"
                style={{ filter: 'grayscale(1)' }}
              />
              <div className="absolute inset-0 bg-red-600 mix-blend-multiply" />
            </div>

            <div
              className="absolute inset-0 opacity-25"
              style={{
                transform: `translate(${glitchOffset.x + 6}px, ${-glitchOffset.y}px)`,
                mixBlendMode: 'screen',
              }}
            >
              <Image
                src={item.images[0]}
                alt=""
                fill
                className="object-contain p-12"
                style={{ filter: 'grayscale(1)' }}
              />
              <div className="absolute inset-0 bg-cyan-500 mix-blend-multiply" />
            </div>

            {/* Main image with 3D rotation */}
            <div
              className="absolute inset-0 transition-transform duration-100"
              style={{
                transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
              }}
            >
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                className="object-contain p-12"
                style={{
                  filter: 'brightness(1.1) contrast(1.2) grayscale(0.2)',
                }}
              />
            </div>

            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.5) 2px,
                  rgba(0, 0, 0, 0.5) 4px
                )`,
              }}
            />

            {/* Acquired flash */}
            {showAcquired && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                <div className="text-center">
                  <span className="font-mono text-lg text-signal animate-pulse block">
                    [{MERCH.addedToCart}]
                  </span>
                  <span className="font-mono text-xs text-white/50 mt-2 block">
                    REDIRECTING_TO_CART...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Details section */}
          <div className="flex-1 md:w-1/2 p-6 md:p-8 overflow-y-auto border-t md:border-t-0 md:border-l border-white/30/30">
            <div className="max-w-md">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-arterial">#{item.serial}</span>
                  <span className="font-mono text-[10px] text-white/50 px-2 py-0.5 border border-white/30/30">
                    {item.category}
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl tracking-wider text-white">
                  {item.name}
                </h2>
                <p className="font-mono text-2xl text-arterial mt-2">
                  €{item.price.toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-8">
                {item.description}
              </p>

              {/* Technical specs */}
              <div className="mb-8 p-4 border border-white/30/30 bg-black/30">
                <h4 className="font-mono text-xs text-arterial mb-3">[SPECIFICATIONS]</h4>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-white/50 block">STOCK_STATUS:</span>
                    <span className={stockColor}>{item.stock}</span>
                  </div>
                  {item.fabric && (
                    <div>
                      <span className="text-white/50 block">MATERIAL:</span>
                      <span className="text-white">{item.fabric}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50 block">{MERCH.rating}:</span>
                    <span className="text-arterial">{item.signal}/10</span>
                  </div>
                  <div>
                    <span className="text-white/50 block">RELEASE_DATE:</span>
                    <span className="text-white/70">{item.releaseDate}</span>
                  </div>
                </div>
              </div>

              {/* Size selector */}
              <div className="mb-6">
                <h4 className="font-mono text-xs text-white/50 mb-3">{MERCH.selectSize}</h4>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={clsx(
                        'font-mono text-sm px-4 py-2 border transition-all duration-200',
                        selectedSize === size
                          ? 'border-arterial text-arterial bg-arterial/10'
                          : 'border-white/30/40 text-white/70 hover:border-white/60'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size guide link */}
              <button className="font-mono text-[10px] text-white/50 hover:text-white/70 mb-8 underline underline-offset-2">
                [{MERCH.sizeGuide}]
              </button>

              {/* Acquire button */}
              <button
                onClick={handleAcquire}
                disabled={item.stock === 'DEPLETED'}
                className={clsx(
                  'w-full py-4 font-mono text-sm tracking-widest border transition-all duration-300',
                  item.stock === 'DEPLETED'
                    ? 'border-white/30/30 text-white/50 cursor-not-allowed'
                    : 'border-arterial text-arterial hover:bg-arterial hover:text-black'
                )}
              >
                {item.stock === 'DEPLETED' ? `[ ${MERCH.soldOut} ]` : `[ ${MERCH.addToCart} ]`}
              </button>

              {/* Warning */}
              <p className="font-mono text-[9px] text-white/50 text-center mt-4">
                {MERCH.finalSaleNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
