'use client'

import { useEffect, useState } from 'react'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import clsx from 'clsx'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  links: readonly { href: string; label: string }[]
  currentPath: string
  onNavigate: (href: string) => void
}

export function MobileNav({
  isOpen,
  onClose,
  links,
  currentPath,
  onNavigate,
}: MobileNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 50)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 500)
    }
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    setTimeout(() => {
      onNavigate(href)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[200] bg-black transition-opacity duration-500',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className="h-full flex flex-col items-stretch justify-center gap-2 p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {links.map((link, index) => (
          <GlitchSlice key={link.href} delay={index * 0.08}>
            <button
              onClick={() => handleLinkClick(link.href)}
              className={clsx(
                'w-full text-left font-mono text-2xl sm:text-3xl tracking-wider py-4 px-4 min-h-[52px] border-b border-white/10 transition-colors',
                currentPath === link.href
                  ? 'text-arterial'
                  : 'text-white hover:text-arterial'
              )}
            >
              {link.label}
            </button>
          </GlitchSlice>
        ))}
      </div>

      {/* Close hint */}
      <div className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-0 right-0 text-center pointer-events-none">
        <span className="font-mono text-xs text-white/60">
          Tap outside to close
        </span>
      </div>
    </div>
  )
}
