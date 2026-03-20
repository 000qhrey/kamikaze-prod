'use client'

import { ReactNode, useState } from 'react'
import clsx from 'clsx'

interface JaggedCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  onClick?: () => void
}

export function JaggedCard({
  children,
  className,
  hoverEffect = true,
  onClick,
}: JaggedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={clsx(
        'relative bg-black border border-grey-dark transition-all duration-300',
        hoverEffect && 'hover:border-grey-mid',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        clipPath: `polygon(
          0% 2%, 3% 0%, 8% 3%, 15% 0%, 22% 2%, 28% 0%, 35% 1%, 42% 0%,
          48% 2%, 55% 0%, 62% 1%, 68% 0%, 75% 2%, 82% 0%, 88% 1%, 95% 0%,
          100% 2%, 100% 98%, 97% 100%, 92% 98%, 85% 100%, 78% 98%, 72% 100%,
          65% 99%, 58% 100%, 52% 98%, 45% 100%, 38% 99%, 32% 100%, 25% 98%,
          18% 100%, 12% 99%, 5% 100%, 0% 98%
        )`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Inner glow on hover */}
      {hoverEffect && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139, 0, 0, 0.1) 0%, transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
  )
}
