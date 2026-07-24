'use client'

/**
 * Interior routes only — boot, cursor trail, Lenis, sigil 3D, glitch chrome.
 * Dynamically imported from AppShell so the homepage never downloads this chunk.
 */

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { LenisProvider } from '@/providers/LenisProvider'
import { CursorProvider } from '@/providers/CursorProvider'
import { TransitionProvider } from '@/providers/TransitionProvider'
import { SiteMenu } from '@/components/layout/SiteMenu'
import { PageTransition } from '@/components/layout/PageTransition'
import { Footer } from '@/components/layout/Footer'
import { ScrollTracker } from '@/components/layout/ScrollTracker'
import { FontLoader } from '@/components/layout/FontLoader'

const SigilScene3D = dynamic(
  () => import('@/components/canvas/SigilScene3D'),
  { ssr: false },
)

const DepthLayers = dynamic(
  () =>
    import('@/components/canvas/DepthLayers').then((mod) => ({
      default: mod.DepthLayers,
    })),
  { ssr: false },
)

const ScreenCorruption = dynamic(
  () =>
    import('@/components/effects/ScreenCorruption').then((mod) => ({
      default: mod.ScreenCorruption,
    })),
  { ssr: false },
)

const TerminalAudioPlayer = dynamic(
  () =>
    import('@/components/audio/TerminalAudioPlayer').then((mod) => ({
      default: mod.TerminalAudioPlayer,
    })),
  { ssr: false },
)

const BootSequence = dynamic(
  () =>
    import('@/components/layout/BootSequence').then((mod) => ({
      default: mod.BootSequence,
    })),
  { ssr: false },
)

const FastBoot = dynamic(
  () =>
    import('@/components/layout/FastBoot').then((mod) => ({
      default: mod.FastBoot,
    })),
  { ssr: false },
)

const VISITOR_STORAGE_KEY = 'kamikaze_visitor'

interface VisitorState {
  firstVisit: string
  visitCount: number
  lastVisit: string
}

export default function InteriorShell({ children }: { children: ReactNode }) {
  const [hasBooted, setHasBooted] = useState(false)
  const [bootMode, setBootMode] = useState<'full' | 'fast' | 'none'>('none')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY)

      if (stored) {
        const visitor: VisitorState = JSON.parse(stored)
        visitor.visitCount++
        visitor.lastVisit = new Date().toISOString()
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitor))
        setBootMode('fast')
      } else {
        const newVisitor: VisitorState = {
          firstVisit: new Date().toISOString(),
          visitCount: 1,
          lastVisit: new Date().toISOString(),
        }
        localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(newVisitor))
        setBootMode('full')
      }
    } catch {
      setBootMode('full')
    }
  }, [])

  const handleBootComplete = () => {
    setHasBooted(true)
    setBootMode('none')
  }

  return (
    <>
      <FontLoader />

      {bootMode === 'full' && <BootSequence onComplete={handleBootComplete} />}
      {bootMode === 'fast' && <FastBoot onComplete={handleBootComplete} />}

      <ScreenCorruption />
      <ScrollTracker />
      <SigilScene3D />
      <LenisProvider>
        <CursorProvider>
          <TransitionProvider>
            <SiteMenu />
            <main className="relative z-10 pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))]">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <DepthLayers />
            {hasBooted && <TerminalAudioPlayer />}
          </TransitionProvider>
        </CursorProvider>
      </LenisProvider>
    </>
  )
}
