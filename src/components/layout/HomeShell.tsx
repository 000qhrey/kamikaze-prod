'use client'

/**
 * Homepage shell — mirrors 000qhrey/kamikaze-prod AppShell home chrome:
 * rotating logo.glb, CRT scanlines (DepthLayers), footer, SiteMenu.
 */

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { SiteMenu } from '@/components/layout/SiteMenu'
import { PageTransition } from '@/components/layout/PageTransition'
import { FontLoader } from '@/components/layout/FontLoader'
import { ScrollTracker } from '@/components/layout/ScrollTracker'
import { Footer } from '@/components/layout/Footer'
import { TransitionProvider } from '@/providers/TransitionProvider'
import { getAssetPath } from '@/lib/basePath'
import { NAV_LINKS } from '@/data/siteCopy'

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
  const router = useRouter()

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

  // Warm interior routes so home→events/artists doesn't hitch on first click
  useEffect(() => {
    const warm = () => {
      for (const link of NAV_LINKS) {
        if (link.href === '/') continue
        router.prefetch(getAssetPath(link.href))
      }
    }

    const ric = window.requestIdleCallback?.(warm, { timeout: 2500 })
    const timer = window.setTimeout(warm, 1800)
    return () => {
      window.clearTimeout(timer)
      if (ric != null && window.cancelIdleCallback) window.cancelIdleCallback(ric)
    }
  }, [router])

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
