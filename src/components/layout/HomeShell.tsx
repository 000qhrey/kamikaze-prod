'use client'

/**
 * Homepage shell — mirrors 000qhrey/kamikaze-prod AppShell home chrome:
 * rotating logo.glb, CRT scanlines (DepthLayers), footer, SiteMenu.
 */

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { SiteMenu } from '@/components/layout/SiteMenu'
import { PageTransition } from '@/components/layout/PageTransition'
import { FontLoader } from '@/components/layout/FontLoader'
import { ScrollTracker } from '@/components/layout/ScrollTracker'
import { Footer } from '@/components/layout/Footer'
import { TransitionProvider } from '@/providers/TransitionProvider'

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

export default function HomeShell({ children }: { children: ReactNode }) {
  const [showAudio, setShowAudio] = useState(false)

  useEffect(() => {
    let cancelled = false
    const enable = () => {
      if (!cancelled) setShowAudio(true)
    }

    const ric = window.requestIdleCallback?.(enable, { timeout: 3500 })
    const timer = window.setTimeout(enable, 4000)
    const onInteract = () => enable()
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true })
    window.addEventListener('keydown', onInteract, { once: true })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (ric != null && window.cancelIdleCallback) window.cancelIdleCallback(ric)
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
    }
  }, [])

  return (
    <>
      <FontLoader />
      <ScreenCorruption />
      <ScrollTracker />
      <SigilScene3D />
      <TransitionProvider>
        <SiteMenu />
        <main className="relative z-10 pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <DepthLayers />
        {showAudio && <TerminalAudioPlayer />}
      </TransitionProvider>
    </>
  )
}
