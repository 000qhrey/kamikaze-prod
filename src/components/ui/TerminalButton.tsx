'use client'

import { ReactNode, useState } from 'react'
import clsx from 'clsx'

interface TerminalButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  loading?: boolean
  success?: boolean
  successText?: string
}

export function TerminalButton({
  children,
  onClick,
  disabled = false,
  className,
  loading = false,
  success = false,
  successText = 'DONE',
}: TerminalButtonProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (disabled || loading) return
    setIsClicked(true)
    onClick?.()
    setTimeout(() => setIsClicked(false), 200)
  }

  if (success) {
    return (
      <div className={clsx('font-mono text-red-bright', className)}>
        {successText} <span className="text-white">✓</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={clsx(
        'font-mono text-white transition-all duration-200',
        'hover:text-red-bright focus:text-red-bright',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isClicked && 'scale-95',
        className
      )}
    >
      <span className="text-grey-mid">&gt; </span>
      {loading ? (
        <span>PROCESSING<span className="animate-blink">_</span></span>
      ) : (
        <>
          {children}
          <span className="animate-blink">_</span>
        </>
      )}
    </button>
  )
}
