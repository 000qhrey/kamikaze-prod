'use client'

import { useEffect, useState } from 'react'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import clsx from 'clsx'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  links: { href: string; label: string }[]
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
        'fixed inset-0 z-[100] bg-black transition-opacity duration-500',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
        {links.map((link, index) => (
          <GlitchSlice key={link.href} delay={index * 0.15}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLinkClick(link.href)
              }}
              className={clsx(
                'font-display text-4xl sm:text-6xl tracking-wider transition-colors',
                currentPath === link.href
                  ? 'text-red-bright'
                  : 'text-white hover:text-red-bright'
              )}
            >
              {link.label}
            </button>
          </GlitchSlice>
        ))}
      </div>

      {/* Close hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="font-mono text-xs text-grey-mid">
          TAP ANYWHERE TO CLOSE
        </span>
      </div>
    </div>
  )
}
