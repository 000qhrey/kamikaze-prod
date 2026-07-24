'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/providers/ThemeProvider'
import HomeShell from '@/components/layout/HomeShell'

// Interior chrome (boot / cursor / Lenis / R3F sigil) — separate async chunk.
// Keep SSR so interior static HTML still includes page chrome + content.
const InteriorShell = dynamic(() => import('@/components/layout/InteriorShell'))

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <ThemeProvider>
      {isHome ? (
        <HomeShell>{children}</HomeShell>
      ) : (
        <InteriorShell>{children}</InteriorShell>
      )}
    </ThemeProvider>
  )
}
