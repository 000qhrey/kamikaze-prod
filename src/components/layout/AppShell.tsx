'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/providers/ThemeProvider'
import HomeShell from '@/components/layout/HomeShell'
import InteriorShell from '@/components/layout/InteriorShell'

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
