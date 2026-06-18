'use client'

import clsx from 'clsx'
import { useTransition } from '@/providers/TransitionProvider'

const QUICK_LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/artists', label: 'Artists' },
  { href: '/merch', label: 'Merch' },
] as const

interface MobileQuickNavProps {
  className?: string
}

export function MobileQuickNav({ className }: MobileQuickNavProps) {
  const { navigateTo } = useTransition()

  return (
    <nav
      className={clsx('w-full max-w-sm mx-auto', className)}
      aria-label="Quick navigation"
    >
      <div className="flex items-stretch gap-1 rounded-full border border-white/15 bg-black/75 backdrop-blur-md p-1 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => navigateTo(link.href)}
            className={clsx(
              'flex-1 min-h-[44px] rounded-full px-3',
              'font-mono text-xs tracking-wide text-white/90',
              'transition-colors active:scale-[0.98]',
              'hover:bg-white/10 active:bg-arterial/20'
            )}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
