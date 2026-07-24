'use client'

/**
 * Homepage OVERRIDE feature tile visual.
 * Rest: red-phosphor sigil. Hover (desktop): fast lineup channel-surf.
 * Lite / reduced-motion: static sigil only — no image fetch / no timer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getArtistBySlug } from '@/data/artists'
import { getAssetPath } from '@/lib/basePath'
import { useLiteMode } from '@/hooks/useLiteMode'

const FRAME_MS = 55 // ~18fps — reads as 10× channel surf, not cinema

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function EventFeatureVisual({
  artistSlugs,
}: {
  artistSlugs: string[]
}) {
  const lite = useLiteMode()
  const reduced = usePrefersReducedMotion()
  const staticOnly = lite || reduced

  const frames = useMemo(
    () =>
      artistSlugs
        .map((slug) => getArtistBySlug(slug)?.photo)
        .filter((p): p is string => Boolean(p))
        .map((p) => getAssetPath(p)),
    [artistSlugs]
  )

  const [live, setLive] = useState(false)
  const [armed, setArmed] = useState(false)
  const [frame, setFrame] = useState(0)
  const readyRef = useRef(false)

  const prefetch = useCallback(() => {
    if (staticOnly || readyRef.current || frames.length === 0) return
    readyRef.current = true
    void Promise.all(
      frames.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image()
            img.decoding = 'async'
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          })
      )
    ).then(() => setArmed(true))
  }, [frames, staticOnly])

  useEffect(() => {
    if (!live || staticOnly || !armed || frames.length === 0) return
    const id = window.setInterval(() => {
      setFrame((i) => (i + 1) % frames.length)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [live, staticOnly, armed, frames.length])

  const onEnter = () => {
    if (staticOnly) return
    prefetch()
    setLive(true)
  }
  const onLeave = () => setLive(false)

  const surfing = live && armed && !staticOnly && frames.length > 0
  const sigilSrc = getAssetPath('/logo-sigil-384.webp')

  return (
    <div
      className="k-event-feature-visual"
      data-surf={surfing ? 'true' : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <div className="k-event-feature-glow" />

      <div className="k-event-feature-sigil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sigilSrc} alt="" width={384} height={384} draggable={false} />
      </div>

      {armed && frames.length > 0 ? (
        <div
          className="k-event-feature-feed"
          style={{ backgroundImage: `url(${frames[frame]})` }}
        />
      ) : null}

      <span className="k-event-feature-cross">+</span>
      {surfing ? (
        <span className="k-event-feature-ch">
          CH {(frame % frames.length) + 1}/{frames.length}
        </span>
      ) : null}
    </div>
  )
}
