'use client'

/**
 * Featured-event thumbnail: sigil at rest, fast lineup channel-surf on hover.
 * Lite / reduced-motion: static sigil only.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getArtistBySlug } from '@/data/artists'
import { getAssetPath } from '@/lib/basePath'
import { useLiteMode } from '@/hooks/useLiteMode'

const FRAME_MS = 55 // ~18fps — reads as 10× channel surf

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
      className="k-efv"
      data-surf={surfing ? 'true' : undefined}
      data-static={staticOnly ? 'true' : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <div className="k-efv-glow" />

      <div className="k-efv-sigil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sigilSrc} alt="" width={384} height={384} draggable={false} />
      </div>

      {armed && frames.length > 0 ? (
        <div
          className="k-efv-feed"
          style={{ backgroundImage: `url(${frames[frame]})` }}
        />
      ) : null}

      <span className="k-efv-cross">+</span>
      {surfing ? (
        <span className="k-efv-ch">
          CH {(frame % frames.length) + 1}/{frames.length}
        </span>
      ) : null}

      <style jsx>{`
        .k-efv {
          position: absolute;
          inset: 0;
          background: #0a0a0a;
          overflow: hidden;
        }
        .k-efv-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(
              ellipse 70% 65% at 50% 48%,
              rgba(204, 0, 0, 0.38) 0%,
              rgba(204, 0, 0, 0.12) 42%,
              transparent 72%
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.4) 0 2px,
              transparent 2px 4px
            );
          transition: opacity 160ms ease;
        }
        .k-efv-sigil {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: grid;
          place-items: center;
          transition: opacity 120ms ease, filter 160ms ease, transform 200ms ease;
        }
        .k-efv-sigil img {
          width: min(58%, 160px);
          height: auto;
          object-fit: contain;
          opacity: 0.92;
          filter:
            brightness(0.9) sepia(1) saturate(9) hue-rotate(-25deg) contrast(1.2)
            drop-shadow(0 0 18px rgba(204, 0, 0, 0.45));
          animation: k-efv-sigil-idle 4.2s ease-in-out infinite;
        }
        .k-efv[data-static='true'] .k-efv-sigil img {
          animation: none;
        }
        @keyframes k-efv-sigil-idle {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.88;
          }
          50% {
            transform: rotate(6deg) scale(1.04);
            opacity: 1;
          }
        }
        .k-efv-feed {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0;
          pointer-events: none;
          background-color: #050505;
          background-size: cover;
          background-position: center 20%;
          background-repeat: no-repeat;
          filter: contrast(1.15) saturate(0.85) brightness(0.92);
          transition: opacity 60ms linear;
        }
        .k-efv-feed::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 45%),
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.45) 0 1px,
              transparent 1px 3px
            );
          mix-blend-mode: multiply;
        }
        .k-efv[data-surf='true'] .k-efv-sigil {
          opacity: 0;
        }
        .k-efv[data-surf='true'] .k-efv-glow {
          opacity: 0.35;
        }
        .k-efv[data-surf='true'] .k-efv-feed {
          opacity: 1;
          animation: k-efv-feed-glitch 0.22s steps(3) infinite;
        }
        .k-efv[data-static='true'][data-surf='true'] .k-efv-feed {
          animation: none;
        }
        @keyframes k-efv-feed-glitch {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            clip-path: inset(0 0 0 0);
            filter: contrast(1.15) saturate(0.85) brightness(0.92);
          }
          33% {
            transform: translate3d(-3px, 0, 0);
            clip-path: inset(12% 0 48% 0);
            filter:
              contrast(1.25) saturate(1.1) brightness(1.05)
              drop-shadow(-3px 0 0 rgba(204, 0, 0, 0.55))
              drop-shadow(3px 0 0 rgba(255, 255, 255, 0.2));
          }
          66% {
            transform: translate3d(3px, 1px, 0);
            clip-path: inset(50% 0 18% 0);
            filter:
              contrast(1.2) saturate(0.7) brightness(0.95)
              drop-shadow(2px 0 0 rgba(204, 0, 0, 0.4))
              drop-shadow(-2px 0 0 rgba(255, 255, 255, 0.18));
          }
        }
        .k-efv-cross {
          position: absolute;
          top: 8px;
          right: 10px;
          z-index: 3;
          color: #cc0000;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }
        .k-efv-ch {
          position: absolute;
          left: 10px;
          bottom: 8px;
          z-index: 3;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.28em;
          color: #cc0000;
          text-shadow: 0 0 8px rgba(204, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
