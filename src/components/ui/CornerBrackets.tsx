'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

interface CornerBracketsProps {
  children: ReactNode
  className?: string
  isActive?: boolean
}

export function CornerBrackets({
  children,
  className,
  isActive = false,
}: CornerBracketsProps) {
  const bracketClass = clsx(
    'absolute w-4 h-4 transition-all duration-300',
    isActive ? 'text-arterial scale-110' : 'text-grey-mid'
  )

  const glowStyle = isActive
    ? {
        filter: 'drop-shadow(0 0 4px rgba(204, 0, 0, 0.6))',
      }
    : {}

  return (
    <div className={clsx('relative', className)}>
      {/* Top Left Bracket */}
      <svg
        className={clsx(bracketClass, 'top-0 left-0')}
        viewBox="0 0 16 16"
        fill="none"
        style={glowStyle}
      >
        <path
          d="M1 15V1H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>

      {/* Top Right Bracket */}
      <svg
        className={clsx(bracketClass, 'top-0 right-0')}
        viewBox="0 0 16 16"
        fill="none"
        style={glowStyle}
      >
        <path
          d="M15 15V1H1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>

      {/* Bottom Left Bracket */}
      <svg
        className={clsx(bracketClass, 'bottom-0 left-0')}
        viewBox="0 0 16 16"
        fill="none"
        style={glowStyle}
      >
        <path
          d="M1 1V15H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>

      {/* Bottom Right Bracket */}
      <svg
        className={clsx(bracketClass, 'bottom-0 right-0')}
        viewBox="0 0 16 16"
        fill="none"
        style={glowStyle}
      >
        <path
          d="M15 1V15H1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>

      {/* Content with padding for brackets */}
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}
