'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LenisProvider } from '@/providers/LenisProvider'
import { CursorProvider } from '@/providers/CursorProvider'
import { TransitionProvider } from '@/providers/TransitionProvider'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollTracker } from '@/components/layout/ScrollTracker'
import { BootSequence } from '@/components/layout/BootSequence'
import { FastBoot } from '@/components/layout/FastBoot'
import { FontLoader } from '@/components/layout/FontLoader'

// Dynamic imports for performance - these don't block initial render
const SigilScene3D = dynamic(
  () => import('@/components/canvas/SigilScene3D'),
  { ssr: false }
)

const DepthLayers = dynamic(
  () => import('@/components/canvas/DepthLayers').then(mod => ({ default: mod.DepthLayers })),
  { ssr: false }
)

const ScreenCorruption = dynamic(
  () => import('@/components/effects/ScreenCorruption').then(mod => ({ default: mod.ScreenCorruption })),
  { ssr: false }
)

const TerminalAudioPlayer = dynamic(
  () => import('@/components/audio/TerminalAudioPlayer').then(mod => ({ default: mod.TerminalAudioPlayer })),
  { ssr: false }
)

// localStorage key for visitor state
const VISITOR_STORAGE_KEY = 'kamikaze_visitor'

interface VisitorState {
  firstVisit: string
  visitCount: number
  lastVisit: string
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [hasBooted, setHasBooted] = useState(false)
  const [bootMode, setBootMode] = useState<'full' | 'fast' | 'none'>('none')

  // Check visitor state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY)

      if (stored) {
        // Returning visitor - update state and show fast boot
        const visitor: VisitorState = JSON.parse(stored)
        visitor.visitCount++
        visitor.lastVisit = new Date().toISOString()
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitor))
        setBootMode('fast')
      } else {
        // First visit - create visitor record and show full boot
        const newVisitor: VisitorState = {
          firstVisit: new Date().toISOString(),
          visitCount: 1,
          lastVisit: new Date().toISOString(),
        }
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(newVisitor))
        setBootMode('full')
      }
    } catch {
      // localStorage unavailable (SSR or privacy mode) - show full boot
      setBootMode('full')
    }
  }, [])

  const handleBootComplete = () => {
    setHasBooted(true)
    setBootMode('none')
  }

  return (
    <>
      {/* Load fonts with correct base path */}
      <FontLoader />

      {/* Boot sequence - full for first visit, fast for returning */}
      {bootMode === 'full' && (
        <BootSequence onComplete={handleBootComplete} />
      )}
      {bootMode === 'fast' && (
        <FastBoot onComplete={handleBootComplete} />
      )}

      {/* Global screen corruption overlay - responds to danger level */}
      <ScreenCorruption />

      {/* Main app */}
      <ScrollTracker />
      <SigilScene3D />
      <LenisProvider>
        <CursorProvider>
          <TransitionProvider>
            <Navigation />
            <main className="relative z-10 pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
            <Footer />
            <DepthLayers />
            {hasBooted && <TerminalAudioPlayer />}
          </TransitionProvider>
        </CursorProvider>
      </LenisProvider>
    </>
  )
}
