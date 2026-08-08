'use client'

/**
 * Featured-event thumbnail — always-on lineup channel-surf (desktop + mobile).
 * Reduced-motion / lite: static artist collage (no animation).
 */

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { getArtistBySlug } from '@/data/artists'
import { getAssetPath } from '@/lib/basePath'
import { useLiteMode } from '@/hooks/useLiteMode'

const FRAME_MS = 280 // brisk channel flip, readable on mobile

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
  const collageOnly = lite || reduced

  const frames = useMemo(
    () =>
      artistSlugs
        .map((slug) => getArtistBySlug(slug)?.photo)
        .filter((p): p is string => Boolean(p))
        .map((p) => getAssetPath(p)),
    [artistSlugs]
  )

  const collage = useMemo(() => frames.slice(0, 4), [frames])
  const [armed, setArmed] = useState(false)
  const [frame, setFrame] = useState(0)

  // Prefetch then unlock surf (skip when collage-only)
  useEffect(() => {
    if (collageOnly || frames.length === 0) {
      setArmed(false)
      return
    }
    let cancelled = false
    void Promise.all(
      frames.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image()
            img.decoding = 'async'
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          })
      )
    ).then(() => {
      if (!cancelled) setArmed(true)
    })
    return () => {
      cancelled = true
    }
  }, [frames, collageOnly])

  useEffect(() => {
    if (!armed || collageOnly || frames.length === 0) return
    const id = window.setInterval(() => {
      setFrame((i) => (i + 1) % frames.length)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [armed, collageOnly, frames.length])

  const surfing = armed && !collageOnly && frames.length > 0
  const sigilSrc = getAssetPath('/logo-sigil-384.webp')

  // Static collage for lite / reduced-motion
  if (collageOnly && collage.length > 0) {
    return (
      <div className="k-efv k-efv--collage" aria-hidden>
        <div className="k-efv-collage">
          {collage.map((src, i) => (
            <div key={src + i} className="k-efv-collage-cell">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center brightness-95 contrast-110"
                sizes="110px"
              />
            </div>
          ))}
        </div>
        <div className="k-efv-scan" />
        <span className="k-efv-cross">+</span>
        <style jsx>{`
          .k-efv {
            position: absolute;
            inset: 0;
            background: #0a0a0a;
            overflow: hidden;
          }
          .k-efv-collage {
            position: absolute;
            inset: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
          }
          .k-efv-collage-cell {
            position: relative;
            overflow: hidden;
          }
          .k-efv-scan {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.35) 2px,
              rgba(0, 0, 0, 0.35) 4px
            );
            opacity: 0.5;
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
        `}</style>
      </div>
    )
  }

  return (
    <div
      className="k-efv"
      data-surf={surfing ? 'true' : undefined}
      aria-hidden
    >
      <div className="k-efv-glow" />

      <div className="k-efv-sigil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sigilSrc} alt="" width={384} height={384} draggable={false} />
      </div>

      {frames.length > 0 ? (
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
          transition: opacity 120ms ease;
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
          transition: opacity 80ms linear;
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
