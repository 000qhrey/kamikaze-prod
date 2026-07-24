'use client'

/**
 * Homepage shell — no boot overlay, cursor trail, Lenis, or SigilScene3D.
 * Music bar mounts after idle so it doesn't compete with LCP.
 */

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { SiteMenu } from '@/components/layout/SiteMenu'
import { PageTransition } from '@/components/layout/PageTransition'
import { FontLoader } from '@/components/layout/FontLoader'

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

    // Prefer idle; fall back to short timeout + first input
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
      <SiteMenu />
      <main className="relative z-10 pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))]">
        <PageTransition>{children}</PageTransition>
      </main>
      {showAudio && <TerminalAudioPlayer />}
    </>
  )
}
