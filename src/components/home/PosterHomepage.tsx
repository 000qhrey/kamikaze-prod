'use client'

/**
 * Kamikaze — dark poster homepage.
 *
 * Scroll: Hero → Upcoming (OVERRIDE) → Collective (IBLIIIZ) → Manifesto → footer.
 * Dual theme via data-theme (Pacific Punch / Heatmap). English-only lander.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import { getArtistBySlug } from '@/data/artists'
import {
  getFeaturedEvent,
  formatEventDate,
} from '@/data/events'
import { getAssetPath } from '@/lib/basePath'
import { useLiteMode, useSkipHeroWebGL } from '@/hooks/useLiteMode'
import { HOME_COPY, CONSTANT } from './homeCopy'
import { HomeFooter } from './HomeFooter'
import { SunLogoStatic } from './SunLogoStatic'
import { EventFeatureVisual } from './EventFeatureVisual'
import { ScrambleText } from '@/components/effects/ScrambleText'

const SunLogo3D = dynamic(
  () => import('./SunLogo3D').then((m) => m.SunLogo3D),
  { ssr: false },
)

// ─── shared meta / hooks ────────────────────────────────────────────────────

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

/**
 * Publishes smoothed scroll velocity to a CSS variable on <html> so the
 * waveform amplitude, slab skew, etc. can react without re-rendering React.
 * Pauses while the tab is hidden.
 */
function useScrollVelocity(disabled: boolean) {
  useEffect(() => {
    if (disabled) {
      document.documentElement.style.setProperty('--scroll-vel', '0')
      return
    }

    let lastY = window.scrollY
    let lastT = performance.now()
    let smoothed = 0
    let raf = 0
    let running = true

    const tick = () => {
      if (!running) return
      if (document.visibilityState !== 'hidden') {
        const now = performance.now()
        const y = window.scrollY
        const dt = Math.max(now - lastT, 16.6)
        const instant = Math.min(Math.abs(y - lastY) / dt / 2, 1)
        smoothed += (instant - smoothed) * 0.15
        lastY = y
        lastT = now
        document.documentElement.style.setProperty('--scroll-vel', smoothed.toFixed(3))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [disabled])
}

/** Mount children once near the viewport — defers below-fold work. */
function DeferredSection({
  children,
  minHeight = 280,
  rootMargin = '220px',
}: {
  children: ReactNode
  minHeight?: number
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || ready) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold: 0.01 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [ready, rootMargin])

  return (
    <div ref={ref} style={ready ? undefined : { minHeight }}>
      {ready ? children : null}
    </div>
  )
}

function useNowUTC() {
  const [now, setNow] = useState<string>('')
  useEffect(() => {
    const format = () => {
      const d = new Date()
      const iso = d.toISOString()
      const [date, time] = iso.split('T')
      const [Y, M, D] = date.split('-')
      const [h, m] = time.split(':')
      setNow(`${Y}·${M}·${D} · ${h}:${m} UTC`)
    }
    format()
    const i = setInterval(format, 30_000)
    return () => clearInterval(i)
  }, [])
  return now
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const mark = () => {
      node.dataset.inview = 'true'
    }
    // Already on screen when mounted (common after DeferredSection swaps in)
    const r = node.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) {
      mark()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            mark()
            io.unobserve(node)
          }
        }
      },
      // ponytail: low threshold — iOS was stranding opacity:0 cards at 0.12
      { threshold: 0, rootMargin: '120px 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])
  return ref
}

// ─── ambient scroll waveform (fixed to bottom of hero, and to page bottom) ─

function ScrollWaveform({
  reduced,
  lite = false,
  variant = 'page',
}: {
  reduced: boolean
  lite?: boolean
  variant?: 'page' | 'hero'
}) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    if (reduced || lite) return
    let raf = 0
    let frame = 0
    const W = 1600
    const H = 40
    const POINTS = window.matchMedia('(max-width: 767px)').matches ? 64 : 120
    // ~30fps — plenty for a decorative line
    const STRIDE = 2

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.visibilityState === 'hidden') return
      frame += 1
      if (frame % STRIDE !== 0) return

      const v = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--scroll-vel') ||
          '0',
      )
      const amp = 1.4 + v * 18
      phaseRef.current += 0.05 + v * 0.4

      let d = ''
      for (let i = 0; i <= POINTS; i++) {
        const t = i / POINTS
        const x = t * W
        const y =
          H / 2 +
          Math.sin(phaseRef.current + t * 12) * amp +
          Math.sin(phaseRef.current * 0.7 + t * 27) * amp * 0.5
        d += i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`
      }
      if (pathRef.current) pathRef.current.setAttribute('d', d)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, lite])

  if (variant === 'hero') {
    return (
      <div className="k-hero-waveform" aria-hidden>
        <svg viewBox="0 0 1600 40" preserveAspectRatio="none" width="100%" height="100%">
          <path
            ref={pathRef}
            d="M0,20 L1600,20"
            fill="none"
            stroke="var(--k-waveform)"
            strokeWidth="1"
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
          />
        </svg>
        <span className="k-hero-waveform-tick" style={{ left: '48%' }} />
        <span className="k-hero-waveform-tick" style={{ left: '62%' }} />
      </div>
    )
  }

  // Sit just above the fixed music bar so scroll waveform stays visible.
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 h-10"
      style={{ bottom: 'calc(2.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <svg
        viewBox="0 0 1600 40"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <path
          ref={pathRef}
          d="M0,20 L1600,20"
          fill="none"
          stroke="var(--k-waveform)"
          strokeWidth="1"
          strokeLinecap="round"
          shapeRendering="geometricPrecision"
        />
      </svg>
    </div>
  )
}

// ─── portrait silhouettes (residents) ──────────────────────────────────────

type PortraitCfg = {
  profile: string
  hair: string
  neck: string
  shoulders: string
  flip: boolean
  tilt: number
  keyStrength: number
  noseHighlight?: { x: number; y: number; r: number }
  earringSide?: 'front' | 'none'
}

const PROFILE_A =
  'M50 82 Q46 46 88 40 Q132 42 138 74 Q140 92 138 104 L146 118 L144 132 L134 138 L138 148 L134 156 L136 164 L128 178 Q118 188 100 188 Q76 188 60 172 Q46 148 48 118 Q46 96 50 82 Z'
const HAIR_A =
  'M48 84 Q44 44 90 40 Q134 42 140 76 Q140 60 100 56 Q60 60 52 88 Z'
const PROFILE_B =
  'M46 86 Q42 40 92 34 Q136 38 142 76 Q144 96 142 108 L150 120 L148 134 L136 140 L140 150 L136 158 L138 168 L130 184 Q116 192 100 192 Q74 192 58 176 Q42 150 44 118 Q42 100 46 86 Z'
const HAIR_B =
  'M40 92 Q30 30 100 26 Q160 30 148 96 Q152 76 130 66 Q152 58 138 42 Q120 30 96 32 Q60 34 50 66 Q34 70 40 92 Z'
const PROFILE_C =
  'M52 90 Q48 50 90 44 Q136 48 140 82 Q142 100 138 112 L144 124 L142 138 L130 142 L134 152 L130 160 L132 168 L124 182 Q114 192 96 192 Q72 192 58 174 Q46 152 48 122 Q48 104 52 90 Z'
const HAIR_C =
  'M52 90 Q48 48 92 44 Q138 48 140 84 Q140 66 100 62 Q64 66 54 92 Z'
const PROFILE_D =
  'M48 84 Q44 42 92 36 Q138 40 144 78 Q146 98 144 112 L152 124 L150 138 L138 142 L142 152 L138 160 L140 168 L130 186 Q120 194 100 194 Q74 194 58 176 Q42 152 44 118 Q42 96 48 84 Z'
const HAIR_D =
  'M40 90 Q28 26 96 30 Q158 34 150 92 Q152 60 132 50 Q120 40 96 40 Q66 42 54 68 Q30 74 40 90 Z'

const PORTRAIT_VARIANTS: PortraitCfg[] = [
  {
    profile: PROFILE_A,
    hair: HAIR_A,
    neck: 'M82 184 L82 218 Q102 226 118 218 L118 184 Z',
    shoulders:
      'M-20 260 L-20 226 Q30 214 62 222 Q82 218 100 222 Q120 218 140 222 Q170 214 220 226 L220 260 Z',
    flip: false,
    tilt: 0,
    keyStrength: 0.98,
    noseHighlight: { x: 146, y: 122, r: 4 },
  },
  {
    profile: PROFILE_B,
    hair: HAIR_B,
    neck: 'M84 188 L82 220 Q104 228 122 220 L120 188 Z',
    shoulders:
      'M-20 260 L-20 226 Q40 210 74 222 Q92 218 108 222 Q128 218 150 222 Q184 210 220 226 L220 260 Z',
    flip: true,
    tilt: 3,
    keyStrength: 0.88,
    earringSide: 'front',
  },
  {
    profile: PROFILE_C,
    hair: HAIR_C,
    neck: 'M82 186 L84 220 Q100 226 116 220 L118 186 Z',
    shoulders:
      'M-20 260 L-20 226 Q28 218 60 222 Q80 218 100 222 Q120 218 140 222 Q172 218 220 226 L220 260 Z',
    flip: false,
    tilt: -2,
    keyStrength: 0.92,
    noseHighlight: { x: 144, y: 128, r: 3 },
  },
  {
    profile: PROFILE_D,
    hair: HAIR_D,
    neck: 'M84 190 L82 222 Q104 228 122 220 L120 188 Z',
    shoulders:
      'M-20 260 L-20 226 Q34 214 66 224 Q86 220 108 224 Q130 220 152 224 Q188 216 220 226 L220 260 Z',
    flip: true,
    tilt: 2,
    keyStrength: 0.8,
    earringSide: 'front',
  },
]

function PortraitSilhouette({ variant }: { variant: number }) {
  const c = PORTRAIT_VARIANTS[variant % PORTRAIT_VARIANTS.length]
  const fid = `p-${variant}`
  const keyX = 140
  return (
    <svg
      viewBox="0 0 200 260"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id={`bg-${fid}`} cx="50%" cy="22%" r="90%">
          <stop offset="0%" stopColor="#191715" />
          <stop offset="65%" stopColor="#080706" />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>
        <radialGradient id={`key-${fid}`} cx={`${(keyX / 200) * 100}%`} cy="40%" r="55%">
          <stop offset="0%" stopColor={`rgba(241,237,228,${c.keyStrength})`} />
          <stop offset="40%" stopColor={`rgba(241,237,228,${c.keyStrength * 0.45})`} />
          <stop offset="75%" stopColor="rgba(241,237,228,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <clipPath id={`head-${fid}`}>
          <path d={c.profile} />
        </clipPath>
        <filter id={`grain-${fid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="2" seed={variant + 1} />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
        </filter>
      </defs>

      <rect width="200" height="260" fill={`url(#bg-${fid})`} />

      <g transform={`${c.flip ? 'translate(200 0) scale(-1 1)' : ''} rotate(${c.tilt} 100 130)`}>
        <path d={c.shoulders} fill="#0a0a0a" />
        <path d={c.neck} fill="#0e0c0c" />
        <path d={c.profile} fill="#0e0c0c" />
        <path d={c.hair} fill="#050505" />

        <g clipPath={`url(#head-${fid})`}>
          <rect width="200" height="260" fill="rgba(30,26,22,0.65)" />
          <rect width="200" height="260" fill={`url(#key-${fid})`} />
          <rect x="0" y="0" width="90" height="260" fill="rgba(0,0,0,0.6)" />
          {c.noseHighlight ? (
            <ellipse
              cx={c.noseHighlight.x}
              cy={c.noseHighlight.y}
              rx={c.noseHighlight.r}
              ry={c.noseHighlight.r * 1.6}
              fill="rgba(241,237,228,0.75)"
            />
          ) : null}
        </g>

        {c.earringSide === 'front' ? (
          <circle cx="58" cy="146" r="2.4" fill="#f1ede4" opacity="0.8" />
        ) : null}
      </g>

      <g opacity="0.24">
        {Array.from({ length: 130 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="200"
            y1={i * 2}
            y2={i * 2}
            stroke="#000"
            strokeWidth="0.5"
          />
        ))}
      </g>

      <rect width="200" height="260" filter={`url(#grain-${fid})`} opacity="0.28" />
    </svg>
  )
}

// ─── hero title — English cybersigil wordmark ─────────────────────────────

const WORDMARK = 'KAMIKAZE'

function useCybersigilBurst(reduced: boolean) {
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const burst = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 260)
  }, [reduced])

  const settle = useCallback(() => {
    setGlitching(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const onTouchBurst = useCallback(() => {
    burst()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(settle, 700)
  }, [burst, settle])

  useEffect(() => clearTimers, [clearTimers])

  return { glitching, burst, settle, onTouchBurst }
}

function EnglishWordmark() {
  return (
    <span className="k-hero-wordmark" aria-label={WORDMARK}>
      {WORDMARK}
    </span>
  )
}

function HeroSunStack({ reduced }: { reduced: boolean }) {
  const skipWebGL = useSkipHeroWebGL()
  const lite = useLiteMode()
  // Defer WebGL chunk until after first paint / idle so static LCP wins first
  const [allowWebGL, setAllowWebGL] = useState(false)
  const [hovered, setHovered] = useState(false)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile / lite: always the manifesto PNG — never mount logo.glb
  const useStatic = skipWebGL || lite || !allowWebGL

  useEffect(() => {
    if (skipWebGL || lite) {
      setAllowWebGL(false)
      return
    }
    let cancelled = false
    const enable = () => {
      if (!cancelled) setAllowWebGL(true)
    }
    const ric = window.requestIdleCallback?.(enable, { timeout: 2200 })
    const timer = window.setTimeout(enable, 2500)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (ric != null && window.cancelIdleCallback) window.cancelIdleCallback(ric)
    }
  }, [skipWebGL, lite])

  const onEnter = useCallback(() => setHovered(true), [])
  const onLeave = useCallback(() => {
    setHovered(false)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const onTouchStart = useCallback(() => {
    onEnter()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(onLeave, 700)
  }, [onEnter, onLeave])

  useEffect(
    () => () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    },
    [],
  )

  return (
    <div
      className={['k-hero-sun-stack', hovered ? 'k-hero-sun-stack--hover' : '']
        .filter(Boolean)
        .join(' ')}
      aria-hidden
      onMouseEnter={useStatic ? undefined : onEnter}
      onMouseLeave={useStatic ? undefined : onLeave}
      onTouchStart={useStatic ? undefined : onTouchStart}
    >
      <div className="k-hero-sun-bloom" />
      <div className="k-hero-sun">
        <div className="k-hero-sun-crt" />
        {useStatic ? (
          <SunLogoStatic />
        ) : (
          <SunLogo3D reduced={reduced} hovered={hovered} />
        )}
      </div>
      <div className="k-hero-sun-noise" />
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────
// Sitewide menu/topbar lives in AppShell (SiteMenu). Hero keeps a spacer so
// the composition still clears the fixed topbar.

function PanelHero() {
  const reduced = usePrefersReducedMotion()
  const ref = useReveal<HTMLElement>()
  const taglineLines = HOME_COPY.hero.tagline.split('\n')

  return (
    <section
      ref={ref}
      className="k-panel k-panel--void k-hero"
      data-panel="00"
      data-reduced={reduced ? 'true' : undefined}
    >
      <div className="k-hero-topbar-spacer" aria-hidden />

      <div className="k-hero-stage">
        <div className="k-hero-flank k-hero-flank--left" aria-hidden>
          <div className="k-hero-metastack">
            {HOME_COPY.hero.metaStack.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <div className="k-hero-mark">
          <HeroSunStack reduced={reduced} />
          <EnglishWordmark />
        </div>

        <div className="k-hero-flank k-hero-flank--right">
          <div className="k-hero-tagline">
            {taglineLines.map((line, i) => (
              <span key={`${line}-${i}`}>{line}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="k-hero-bottom">
        <div className="k-hero-scroll" aria-hidden>
          <span className="k-hero-scroll-label">{HOME_COPY.hero.scroll}</span>
          <span className="k-hero-scroll-arrow">↓</span>
        </div>
        <span className="k-hero-est-line">{HOME_COPY.hero.est}</span>
      </div>
    </section>
  )
}

// ─── HEATMAP TELEMETRY ────────────────────────────────────────────────────

function MiniWaveform({ reduced }: { reduced: boolean }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const W = 320
    const H = 48
    const POINTS = 64
    const tick = () => {
      phaseRef.current += 0.08
      let d = ''
      for (let i = 0; i <= POINTS; i++) {
        const t = i / POINTS
        const x = t * W
        const y =
          H / 2 +
          Math.sin(phaseRef.current + t * 10) * 12 +
          Math.sin(phaseRef.current * 0.6 + t * 22) * 6
        d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`
      }
      pathRef.current?.setAttribute('d', d)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <svg viewBox="0 0 320 48" preserveAspectRatio="none" className="k-telemetry-wave">
      <path
        ref={pathRef}
        d="M0,24 L320,24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function TerrainViz() {
  return (
    <svg viewBox="0 0 200 80" className="k-telemetry-terrain" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        points="0,60 20,52 40,58 60,40 80,48 100,28 120,36 140,22 160,34 180,18 200,30"
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.45"
        points="0,70 25,62 50,68 75,50 100,58 125,42 150,50 175,38 200,46"
      />
      <line x1="0" y1="78" x2="200" y2="78" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

function PanelTelemetry({ now }: { now: string }) {
  const reduced = usePrefersReducedMotion()
  const ref = useReveal<HTMLElement>()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const dd = String(d.getUTCDate()).padStart(2, '0')
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const yy = String(d.getUTCFullYear()).slice(-2)
      const hh = String(d.getUTCHours()).padStart(2, '0')
      const mi = String(d.getUTCMinutes()).padStart(2, '0')
      setClock(`${mm}.${dd}.${yy} · ${hh}:${mi} UTC`)
    }
    tick()
    const i = setInterval(tick, 15_000)
    return () => clearInterval(i)
  }, [])

  return (
    <section
      ref={ref}
      className="k-panel k-panel--void k-panel--telemetry"
      data-panel="telemetry"
      aria-label="Signal telemetry"
    >
      <div className="k-telemetry">
        <div className="k-telemetry-card">
          <span className="k-telemetry-label">{HOME_COPY.telemetry.frequency}</span>
          <MiniWaveform reduced={reduced} />
        </div>
        <div className="k-telemetry-card">
          <span className="k-telemetry-label">{HOME_COPY.telemetry.transmission}</span>
          <div className="k-telemetry-tx">
            <span className="k-telemetry-clock">{clock || now || '····'}</span>
            <span className="k-telemetry-live">
              <span className="k-telemetry-live-dot" aria-hidden />
              {HOME_COPY.telemetry.live}
            </span>
          </div>
        </div>
        <div className="k-telemetry-card">
          <span className="k-telemetry-label">{HOME_COPY.telemetry.signal}</span>
          <TerrainViz />
        </div>
      </div>
    </section>
  )
}

// ─── UPCOMING EVENTS (single featured: OVERRIDE) ──────────────────────────

function PanelEvents() {
  const ref = useReveal<HTMLElement>()
  const lite = useLiteMode()
  const event = getFeaturedEvent()
  if (!event) return null

  const dateLabel = formatEventDate(event.date)
  const location = event.isSecretLocation
    ? HOME_COPY.events.locationTbd
    : event.tbdFields?.includes('venue')
      ? `${event.city}, India`
      : `${event.venue} · ${event.city}`

  return (
    <section ref={ref} className="k-panel k-panel--warm k-panel--events" data-panel="01">
      <div className="k-strip">
        <header className="k-strip-head">
          <span className="k-strip-dash" aria-hidden />
          <h2 className="k-strip-title">{HOME_COPY.events.label}</h2>
        </header>

        <a
          href={getAssetPath(`/events`)}
          className="k-event-feature"
          aria-label={`${event.name}, ${dateLabel}`}
        >
          <EventFeatureVisual artistSlugs={event.lineupArtistSlugs ?? []} />
          <div className="k-event-feature-meta">
            <span className="k-event-feature-date">{dateLabel}</span>
            <ScrambleText
              className="k-event-feature-name"
              triggerOnHover={!lite}
              triggerOnView
              duration={600}
              resolveToColor="#CC0000"
              finalColor="#EFEFEF"
            >
              {event.name}
            </ScrambleText>
            <span className="k-event-feature-loc">{location}</span>
          </div>
          <span className="k-event-feature-cta">{HOME_COPY.events.cta}</span>
        </a>
      </div>
    </section>
  )
}

// ─── RESIDENTS ────────────────────────────────────────────────────────────

const RESIDENT_TAGLINE_ALT = 'never belonged'

function ResidentTagline({ en }: { en: string }) {
  const reduced = usePrefersReducedMotion()
  const { glitching, burst } = useCybersigilBurst(reduced)
  const [alt, setAlt] = useState(false)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onEnter = useCallback(() => {
    burst()
    setAlt(true)
  }, [burst])

  const onLeave = useCallback(() => {
    setAlt(false)
    burst()
  }, [burst])

  const onTouchStart = useCallback(() => {
    setAlt(true)
    burst()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(() => {
      setAlt(false)
    }, 700)
  }, [burst])

  useEffect(
    () => () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    },
    [],
  )

  return (
    <p
      className={[
        'k-resident-tagline',
        'k-resident-tagline--swap',
        alt ? 'k-resident-tagline--alt' : '',
        glitching ? 'k-resident-tagline--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onTouchStart}
      aria-label={alt ? RESIDENT_TAGLINE_ALT : en}
    >
      <span className="k-resident-tagline-en" aria-hidden={alt}>
        {en}
      </span>
      <span className="k-resident-tagline-alt" aria-hidden={!alt}>
        {RESIDENT_TAGLINE_ALT}
      </span>
    </p>
  )
}

function PanelCollective() {
  const ref = useReveal<HTMLElement>()
  const resident = CONSTANT.residents[0]
  if (!resident) return null

  const slug = resident.href.split('/').pop()
  const artist = slug ? getArtistBySlug(slug) : undefined

  return (
    <section ref={ref} className="k-panel k-panel--void k-panel--collective" data-panel="02">
      <div className="k-strip">
        <header className="k-strip-head">
          <span className="k-strip-dash" aria-hidden />
          <h2 className="k-strip-title">{HOME_COPY.residents.label}</h2>
        </header>

        <div className="k-collective-feature">
          <a href={getAssetPath(resident.href)} className="k-resident-card k-resident-card--solo">
            <div
              className={[
                'k-resident-portrait',
                'k-resident-portrait--solo',
                slug === 'ibliiiz' ? 'k-resident-portrait--glitch' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {artist?.photo ? (
                <img
                  src={getAssetPath(artist.photo)}
                  alt=""
                  className="k-resident-photo"
                  width={480}
                  height={640}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <PortraitSilhouette variant={0} />
              )}
              <span className="k-resident-cross" aria-hidden>
                +
              </span>
            </div>
            <div className="k-resident-name">{resident.name}</div>
            <div className="k-resident-role">{HOME_COPY.residents.role(1)}</div>
          </a>

          {artist && (
            <div className="k-resident-writeup k-resident-writeup--solo">
              <ResidentTagline en={artist.tagline} />
              <p className="k-resident-bio">{artist.bio}</p>
              <a href={getAssetPath('/artists')} className="k-section-cta">
                {HOME_COPY.residents.viewAll}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── SIGIL ────────────────────────────────────────────────────────────────

const SIGIL_DARK_EN = 'DARK.'

function SigilDarkWord() {
  const reduced = usePrefersReducedMotion()
  const { glitching, burst, settle, onTouchBurst } = useCybersigilBurst(reduced)

  return (
    <span
      className={[
        'k-sigil-title-three',
        'k-sigil-dark',
        glitching ? 'k-sigil-dark--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={burst}
      onMouseLeave={settle}
      onTouchStart={onTouchBurst}
      aria-label={SIGIL_DARK_EN}
    >
      {SIGIL_DARK_EN}
    </span>
  )
}

function PanelManifesto({ now }: { now: string }) {
  const reduced = usePrefersReducedMotion()
  const lite = useLiteMode()
  const ref = useReveal<HTMLElement>()
  const headingLines = HOME_COPY.sigil.heading.split('\n')

  return (
    <section ref={ref} className="k-panel k-panel--warm k-panel--sigil" data-panel="03">
      <header className="k-strip-head k-sigil-head">
        <span className="k-strip-dash" aria-hidden />
        <h2 className="k-strip-title">{HOME_COPY.sigil.label}</h2>
      </header>

      <h3 className="k-sigil-title">
        {headingLines.map((line, i) =>
          i === 2 ? (
            <SigilDarkWord key={line} />
          ) : (
            <span key={line} className={i === 1 ? 'k-sigil-title-two' : ''}>
              {line}
            </span>
          ),
        )}
      </h3>

      <div className="k-sigil-wave-row" aria-hidden>
        <ScrollWaveform reduced={reduced} lite={lite} variant="hero" />
        <a href={getAssetPath('/about')} className="k-sigil-readmore">
          {HOME_COPY.sigil.readMore}
        </a>
      </div>

      <div className="k-sigil-footerrow">
        <div className="k-coord">
          <div className="k-coord-line">{CONSTANT.coords.lat}</div>
          <div className="k-coord-line">{CONSTANT.coords.lon}</div>
          <div className="k-coord-sub">{HOME_COPY.sigil.zone}</div>
          <div className="k-coord-sub">{now || '····'}</div>
        </div>

        <div className="k-barcode" aria-hidden>
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: `${1 + ((i * 7) % 4)}px`,
                background: i % 5 === 0 ? 'transparent' : 'currentColor',
              }}
            />
          ))}
          <div className="k-barcode-num">{HOME_COPY.sigil.caption}</div>
        </div>

        <div className="k-hanko" aria-label="KM stamp">
          <img
            src={getAssetPath('/logo-sigil.png')}
            alt=""
            width={120}
            height={120}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="k-horizon" aria-hidden>
        <div className="k-horizon-grid" />
      </div>
    </section>
  )
}

// ─── fixed textures ────────────────────────────────────────────────────────

const PAPER_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 21,
  opacity: 0.045,
  mixBlendMode: 'soft-light',
  background:
    'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(241,237,228,0.12) 0%, transparent 70%), #0a0a0a',
}

const GRAIN_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 25,
  opacity: 0.04,
  mixBlendMode: 'overlay',
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")",
  backgroundSize: '256px 256px',
}

const DUST_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 24,
  opacity: 0.05,
  mixBlendMode: 'screen',
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='d'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='400' height='400' filter='url(%23d)' opacity='0.35'/></svg>\")",
  backgroundSize: '400px 400px',
}

const SCRATCH_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 23,
  opacity: 0.045,
  mixBlendMode: 'overlay',
  background:
    'linear-gradient(118deg, transparent 0%, transparent 42%, rgba(241,237,228,0.35) 42.2%, transparent 42.5%, transparent 61%, rgba(241,237,228,0.2) 61.15%, transparent 61.4%), linear-gradient(12deg, transparent 70%, rgba(0,0,0,0.4) 70.3%, transparent 70.6%)',
}

const VIGNETTE_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 26,
  background:
    'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
  opacity: 1,
}

function PosterTextures({ lite }: { lite: boolean }) {
  return (
    <>
      <div style={PAPER_STYLE} aria-hidden />
      <div style={SCRATCH_STYLE} aria-hidden />
      {/* feTurbulence grain/dust is expensive on mobile GPUs — skip in lite */}
      {!lite && <div style={DUST_STYLE} aria-hidden />}
      {!lite && <div style={GRAIN_STYLE} aria-hidden />}
      <div
        style={
          lite
            ? { ...VIGNETTE_STYLE, opacity: 0.85 }
            : VIGNETTE_STYLE
        }
        aria-hidden
      />
    </>
  )
}

// ─── main composition ─────────────────────────────────────────────────────

function PosterHomepageContent() {
  const reduced = usePrefersReducedMotion()
  const lite = useLiteMode()
  useScrollVelocity(reduced || lite)
  const now = useNowUTC()

  useEffect(() => {
    document.body.classList.add('k-home-body')
    return () => document.body.classList.remove('k-home-body')
  }, [])

  return (
    <div
      className="k-home"
      data-reduced={reduced ? 'true' : 'false'}
      data-lite={lite ? 'true' : 'false'}
    >
      <PosterTextures lite={lite} />

      <PanelHero />
      <PanelTelemetry now={now} />
      <DeferredSection minHeight={360}>
        <PanelEvents />
      </DeferredSection>
      <DeferredSection minHeight={480}>
        <PanelCollective />
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <PanelManifesto now={now} />
      </DeferredSection>

      <HomeFooter />

      {!lite && <ScrollWaveform reduced={reduced} lite={lite} />}
      <PosterStyles />
    </div>
  )
}

export function PosterHomepage() {
  return <PosterHomepageContent />
}

export default PosterHomepage

// ─── styles ───────────────────────────────────────────────────────────────

function PosterStyles() {
  return (
    <style jsx global>{`
      /* Tokens live in globals.css (:root) so homepage shares --void family */

      body.k-home-body {
        cursor: auto !important;
        background: var(--void);
        color: var(--k-bone);
        font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace;
        overflow-x: hidden;
      }
      body.k-home-body,
      body.k-home-body * {
        cursor: auto !important;
      }
      body.k-home-body a,
      body.k-home-body button,
      body.k-home-body [role='button'] {
        cursor: pointer !important;
      }
      body.k-home-body ::selection {
        background: var(--k-red);
        color: var(--k-bone);
      }

      .k-home {
        --k-page-gutter: clamp(24px, 4vw, 64px);
        --k-audio-clearance: calc(2.75rem + env(safe-area-inset-bottom, 0px));
        position: relative;
        min-height: 100vh;
        min-height: 100dvh;
        background: var(--void);
        color: var(--k-bone);
        font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 15px;
        line-height: 1.55;
        overflow-x: clip;
        max-width: 100%;
        width: 100%;
      }

      .k-panel {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        padding: clamp(24px, 4vw, 64px);
        overflow-x: clip;
        overflow-y: visible;
        box-sizing: border-box;
        isolation: isolate;
        color: var(--k-bone);
        width: 100%;
        max-width: 100%;
      }

      /* Skip layout/paint for below-fold panels.
         Events stays paint-eager — content-visibility + opacity reveal
         left the OVERRIDE card invisible on iOS Safari. */
      .k-panel--telemetry,
      .k-panel--collective,
      .k-panel--sigil {
        content-visibility: auto;
        contain-intrinsic-size: auto 640px;
      }

      .k-panel + .k-panel::before {
        content: '';
        position: absolute;
        top: 0;
        left: clamp(24px, 4vw, 64px);
        right: clamp(24px, 4vw, 64px);
        height: 1px;
        background: var(--k-hair);
        z-index: 2;
        pointer-events: none;
      }

      .k-panel--void { background: var(--k-void); }
      /* Warm = ash-adjacent lift — same family as interior --ash, not cream */
      .k-panel--warm { background: var(--k-warm); }

      .k-panel > * {
        position: relative;
        z-index: 1;
      }

      /* ── HERO ─────────────────────────────────────────────────────── */

      .k-hero {
        position: relative;
        display: block;
        min-height: 100svh;
        min-height: 100dvh;
        overflow-x: clip;
        overflow-y: visible;
      }
      /* Hero is full-bleed — panel padding/clip would offset and crop the wordmark */
      .k-panel.k-hero {
        padding: 0;
        overflow: visible;
      }

      /* Clears the fixed SiteMenu topbar (mounted in AppShell) */
      .k-hero-topbar-spacer {
        height: calc(env(safe-area-inset-top, 0px) + 2.75rem);
        pointer-events: none;
      }

      /* logo.glb canvas — oversized so radial spikes aren't WebGL-clipped */
      .k-hero-sun-logo {
        position: absolute;
        inset: -15%;
        z-index: 2;
        overflow: visible;
        pointer-events: none;
      }
      .k-hero-sun-logo canvas {
        width: 100% !important;
        height: 100% !important;
        display: block;
      }
      .k-hero-sun-logo--static {
        display: grid;
        place-items: center;
        /* Match sun disc — don't oversize like the GLB canvas spike bleed */
        inset: 0;
      }
      .k-hero-sun-logo--static img {
        width: 78%;
        height: 78%;
        object-fit: contain;
        opacity: 0.95;
        /* Face-on PNG (same as manifesto hanko) — no GLB orientation hack */
        filter: brightness(1.02) saturate(1.08);
        user-select: none;
        pointer-events: none;
      }
      [data-theme='heatmap'] .k-hero-sun-logo--static img {
        filter: brightness(1.08) saturate(1.35) hue-rotate(-8deg);
      }

      /* Flanking meta pinned to page gutters; mark centred in viewport */
      .k-hero-stage {
        position: absolute;
        inset: 0;
        z-index: 2;
        padding:
          clamp(24px, 6vh, 64px)
          var(--k-page-gutter)
          clamp(20px, 3.5vh, 40px);
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: 1fr;
        align-items: stretch;
        pointer-events: none;
      }
      .k-hero-flank {
        position: relative;
        z-index: 5;
        pointer-events: none;
        grid-row: 1;
      }
      .k-hero-flank--left {
        grid-column: 1;
        justify-self: start;
        align-self: start;
        margin-top: clamp(24px, 8vh, 80px);
      }
      .k-hero-flank--right {
        grid-column: 2;
        justify-self: end;
        align-self: end;
        margin-bottom: clamp(24px, 8vh, 80px);
        text-align: right;
      }
      .k-hero-metastack {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace;
        font-weight: 600;
        font-size: clamp(10px, 1.1vw, 12px);
        color: var(--k-red);
        letter-spacing: 0.28em;
        text-transform: uppercase;
        line-height: 1.25;
      }
      .k-hero-metastack span {
        display: block;
      }

      /* Centrepiece — red sun sits behind the wordmark, may extend past the mark box */
      .k-hero-sun-stack {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 0;
        /* Never wider than the viewport — old 380px floor blew out narrow phones */
        width: min(92vw, 72vmin, 900px);
        height: min(92vw, 72vmin, 900px);
        transform: translate(-50%, -50%);
        pointer-events: auto;
        overflow: visible;
        cursor: default;
      }
      .k-hero-sun-bloom {
        position: absolute;
        inset: -5%;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          var(--k-sun-bloom) 0%,
          transparent 68%
        );
        transition: inset 280ms ease, background 280ms ease, filter 280ms ease;
      }
      .k-hero-sun,
      .k-hero-sun-noise {
        position: absolute;
        inset: 0;
        border-radius: 50%;
      }
      .k-hero-sun {
        background:
          radial-gradient(
            circle at 40% 36%,
            var(--k-sun-inner) 0%,
            var(--k-sun-mid) 34%,
            var(--k-thermal-void) 62%,
            var(--k-sun-outer) 100%
          );
        box-shadow: inset 0 0 160px rgba(0, 0, 0, 0.82);
        overflow: visible;
        animation: k-sun-breathe 12s ease-in-out infinite;
        transition:
          filter 280ms ease,
          box-shadow 280ms ease,
          background 320ms ease;
      }
      .k-hero-sun-stack--hover .k-hero-sun {
        filter: brightness(1.05) saturate(1.03);
        box-shadow:
          inset 0 0 140px rgba(0, 0, 0, 0.68),
          0 0 44px color-mix(in srgb, var(--k-thermal-mid) 18%, transparent),
          0 0 72px color-mix(in srgb, var(--k-thermal-edge) 10%, transparent);
      }
      .k-hero-sun-stack--hover .k-hero-sun-bloom {
        inset: -10%;
        background: radial-gradient(
          circle,
          color-mix(in srgb, var(--k-sun-bloom) 140%, transparent) 0%,
          transparent 70%
        );
      }
      .k-hero[data-reduced='true'] .k-hero-sun-stack--hover .k-hero-sun {
        filter: brightness(1.02);
      }
      .k-hero-sun-crt {
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: 50%;
        background-image: repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.22) 0px,
          rgba(0, 0, 0, 0.22) 1px,
          transparent 1px,
          transparent 3px
        );
        mix-blend-mode: multiply;
        opacity: 0.72;
        animation: k-crt-drift 18s linear infinite;
        pointer-events: none;
      }
      .k-hero-sun-noise {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>");
        background-size: 260px 260px;
        mix-blend-mode: multiply;
        opacity: 0.26;
        animation: k-sun-breathe 12s ease-in-out infinite;
      }
      @keyframes k-sun-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.018); }
      }
      @keyframes k-crt-drift {
        0% { background-position: 0 0; }
        100% { background-position: 0 24px; }
      }
      .k-hero[data-reduced='true'] .k-hero-sun,
      .k-hero[data-reduced='true'] .k-hero-sun-noise,
      .k-hero[data-reduced='true'] .k-hero-sun-crt {
        animation: none;
      }
      /* Lite (mobile / reduced): freeze continuous sun CSS, soften noise */
      .k-home[data-lite='true'] .k-hero-sun,
      .k-home[data-lite='true'] .k-hero-sun-noise,
      .k-home[data-lite='true'] .k-hero-sun-crt {
        animation: none;
      }
      .k-home[data-lite='true'] .k-hero-sun-noise {
        opacity: 0.12;
      }
      .k-home[data-lite='true'] .k-hero-sun-crt {
        opacity: 0.45;
      }
      .k-home[data-lite='true'] .k-resident-card:hover .k-resident-portrait--glitch .k-resident-photo,
      .k-home[data-lite='true'] .k-resident-portrait--glitch:hover .k-resident-photo {
        animation: none;
      }

      .k-hero-mark {
        position: relative;
        z-index: 2;
        grid-column: 1 / -1;
        grid-row: 1;
        display: grid;
        place-items: center;
        place-self: center;
        text-align: center;
        width: min(100%, calc(100vw - 2 * var(--k-page-gutter)));
        min-height: clamp(220px, 42vh, 520px);
        overflow: visible;
        box-sizing: border-box;
        pointer-events: auto;
        container-type: inline-size;
      }
      .k-hero-mark > .k-hero-wordmark {
        position: relative;
        z-index: 1;
      }
      .k-hero-wordmark {
        position: relative;
        display: block;
        /* Cybersigil display — site ritual face (FontLoader), not Archivo */
        font-family: 'CyberpunkCity', 'Archivo Black', sans-serif;
        font-weight: 400;
        letter-spacing: 0.04em;
        color: var(--k-wordmark);
        text-transform: uppercase;
        line-height: 0.9;
        /* ~8 glyphs across the mark container — keeps KAMIKAZE inside gutters */
        font-size: clamp(32px, 12.2cqi, 200px);
        text-align: center;
        width: fit-content;
        max-width: 100%;
        margin-inline: auto;
        text-shadow:
          0 0 1px rgba(10, 8, 6, 0.55),
          0.5px 0 0 rgba(10, 8, 6, 0.35),
          -0.5px 0.5px 0 rgba(10, 8, 6, 0.25),
          0 10px 36px rgba(0, 0, 0, 0.55);
        white-space: nowrap;
        grid-area: 1 / 1;
        overflow: visible;
        pointer-events: auto;
        cursor: default;
        isolation: isolate;
      }
      .k-hero-wordmark::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(
          transparent 44%,
          color-mix(in srgb, var(--k-thermal-mid) 40%, transparent) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
      }
      /* Channel glitch — fine pointer only; holds while hovered */
      @media (hover: hover) and (pointer: fine) {
        .k-hero-wordmark:hover {
          animation: k-wordmark-channel 480ms steps(2, end) infinite;
          will-change: transform, color, text-shadow, filter;
        }
        .k-hero-wordmark:hover::after {
          animation: k-wordmark-scan 480ms steps(2, end) infinite;
        }
      }
      @keyframes k-wordmark-channel {
        0%,
        100% {
          transform: translate(0, 0) skewX(0deg);
          color: var(--k-wordmark);
          filter: brightness(1);
          text-shadow:
            0 0 1px rgba(10, 8, 6, 0.55),
            0.5px 0 0 rgba(10, 8, 6, 0.35),
            -0.5px 0.5px 0 rgba(10, 8, 6, 0.25),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        12% {
          transform: translate(-1.5px, 0.5px) skewX(-0.4deg);
          color: var(--k-thermal-mid);
          filter: brightness(1.12);
          text-shadow:
            -3px 0 color-mix(in srgb, var(--k-thermal-mid) 90%, transparent),
            3px 0 rgba(0, 255, 255, 0.55),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        28% {
          transform: translate(1.5px, -1px) skewX(0.6deg);
          color: #7efcff;
          filter: brightness(1.2);
          text-shadow:
            4px 0 color-mix(in srgb, var(--k-thermal-mid) 80%, transparent),
            -2px 0 rgba(0, 255, 255, 0.65),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        40% {
          transform: translate(-0.5px, 1.5px) skewX(0deg);
          color: var(--k-wordmark);
          filter: brightness(0.95);
          text-shadow:
            -2px 0 rgba(0, 255, 255, 0.4),
            2px 0 color-mix(in srgb, var(--k-thermal-mid) 70%, transparent),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        55% {
          transform: translate(2px, 0) skewX(1.2deg);
          color: var(--k-thermal-mid);
          filter: brightness(1.18);
          text-shadow:
            -4px 0 color-mix(in srgb, var(--k-thermal-mid) 95%, transparent),
            3px 0 rgba(0, 255, 255, 0.45),
            0 0 18px color-mix(in srgb, var(--k-thermal-mid) 35%, transparent),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        70% {
          transform: translate(-2px, -0.5px) skewX(-0.8deg);
          color: #a8f7ff;
          filter: brightness(1.08);
          text-shadow:
            3px 0 rgba(0, 255, 255, 0.7),
            -3px 0 color-mix(in srgb, var(--k-thermal-mid) 75%, transparent),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
        85% {
          transform: translate(0.5px, 1px) skewX(0.3deg);
          color: var(--k-thermal-mid);
          filter: brightness(1.15);
          text-shadow:
            -2px 0 color-mix(in srgb, var(--k-thermal-mid) 85%, transparent),
            2px 0 rgba(0, 255, 255, 0.5),
            0 10px 36px rgba(0, 0, 0, 0.55);
        }
      }
      @keyframes k-wordmark-scan {
        0%,
        100% {
          opacity: 0;
          transform: translateY(-8%);
        }
        18%,
        22% {
          opacity: 0.7;
          transform: translateY(12%);
        }
        48%,
        52% {
          opacity: 0.45;
          transform: translateY(55%);
        }
        78%,
        82% {
          opacity: 0.55;
          transform: translateY(88%);
        }
      }

      /* ── HEATMAP theme overrides (data-theme on <html>) ─────────── */
      [data-theme='heatmap'] .k-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        opacity: 1;
        background-image:
          linear-gradient(var(--k-grid) 1px, transparent 1px),
          linear-gradient(90deg, var(--k-grid) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, black 20%, transparent 75%);
      }
      [data-theme='heatmap'] .k-hero-sun {
        background:
          radial-gradient(
            circle at 48% 48%,
            color-mix(in srgb, var(--k-thermal-core) 92%, white) 0%,
            var(--k-thermal-core) 12%,
            var(--k-thermal-mid) 32%,
            var(--k-thermal-edge) 52%,
            var(--k-sun-outer) 78%,
            var(--k-thermal-void) 100%
          );
        box-shadow:
          inset 0 0 80px rgba(0, 0, 0, 0.35),
          0 0 60px color-mix(in srgb, var(--k-thermal-mid) 35%, transparent),
          0 0 120px color-mix(in srgb, var(--k-thermal-edge) 22%, transparent);
        filter: saturate(1.15) brightness(1.05);
      }
      [data-theme='heatmap'] .k-hero-sun-bloom {
        inset: -18%;
        background: radial-gradient(
          circle,
          color-mix(in srgb, var(--k-thermal-core) 55%, transparent) 0%,
          color-mix(in srgb, var(--k-thermal-mid) 32%, transparent) 28%,
          color-mix(in srgb, var(--k-thermal-edge) 18%, transparent) 52%,
          transparent 72%
        );
        filter: blur(8px);
      }
      [data-theme='heatmap'] .k-hero-sun-stack--hover .k-hero-sun {
        filter: brightness(1.12) saturate(1.2);
        box-shadow:
          inset 0 0 60px rgba(0, 0, 0, 0.28),
          0 0 80px color-mix(in srgb, var(--k-thermal-core) 40%, transparent),
          0 0 140px color-mix(in srgb, var(--k-thermal-mid) 28%, transparent);
      }
      [data-theme='heatmap'] .k-hero-sun-crt {
        mix-blend-mode: soft-light;
        opacity: 0.35;
      }
      [data-theme='heatmap'] .k-hero-sun-noise {
        mix-blend-mode: soft-light;
        opacity: 0.18;
      }
      [data-theme='heatmap'] .k-hero-wordmark {
        color: var(--k-wordmark);
        text-shadow:
          0 0 24px color-mix(in srgb, var(--k-thermal-core) 45%, transparent),
          0 0 48px color-mix(in srgb, var(--k-thermal-mid) 30%, transparent),
          0 8px 28px rgba(0, 0, 0, 0.65);
      }
      /* Quiet thermal scale — heatmap-only */
      [data-theme='heatmap'] .k-hero-flank--right::after {
        content: '';
        position: absolute;
        right: -18px;
        top: 0;
        bottom: 0;
        width: 6px;
        border-radius: 1px;
        background: linear-gradient(
          to top,
          #1a1a4a 0%,
          #5a1a8a 28%,
          #e01a7a 52%,
          #ff6a1a 76%,
          #ffe14a 100%
        );
        opacity: 0.55;
        pointer-events: none;
      }
      /* Heatmap telemetry row — hidden in Pacific */
      .k-panel--telemetry {
        display: none;
        min-height: auto;
        padding-top: clamp(16px, 3vw, 32px);
        padding-bottom: clamp(16px, 3vw, 32px);
      }
      [data-theme='heatmap'] .k-panel--telemetry {
        display: block;
      }
      .k-telemetry {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(12px, 2vw, 24px);
        max-width: 1100px;
        margin: 0 auto;
      }
      .k-telemetry-card {
        outline: 1px solid var(--k-hair);
        background: color-mix(in srgb, var(--k-warm) 80%, transparent);
        padding: clamp(14px, 2vw, 22px);
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-height: 140px;
      }
      .k-telemetry-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.28em;
        color: var(--k-red);
        text-transform: uppercase;
      }
      .k-telemetry-wave,
      .k-telemetry-terrain {
        width: 100%;
        height: 56px;
        color: var(--k-red);
        display: block;
      }
      .k-telemetry-tx {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: auto;
      }
      .k-telemetry-clock {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(16px, 2vw, 22px);
        letter-spacing: 0.12em;
        color: var(--k-bone);
      }
      .k-telemetry-live {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.22em;
        color: var(--k-bone-2);
        text-transform: uppercase;
      }
      .k-telemetry-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ff2a2a;
        box-shadow: 0 0 8px rgba(255, 42, 42, 0.7);
        animation: k-live-pulse 1.4s ease-in-out infinite;
      }
      @keyframes k-live-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      .k-home[data-reduced='true'] .k-telemetry-live-dot {
        animation: none;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-theme='heatmap'] .k-hero-sun-bloom {
          filter: none;
        }
      }
      .k-home[data-reduced='true'] .k-hero-wordmark:hover {
        animation: none !important;
        filter: brightness(1.08);
        transform: none;
        color: var(--k-thermal-mid);
        text-shadow:
          0 0 18px color-mix(in srgb, var(--k-thermal-mid) 40%, transparent),
          0 10px 36px rgba(0, 0, 0, 0.55);
        transition: color 180ms ease, filter 180ms ease, text-shadow 180ms ease;
      }
      .k-home[data-reduced='true'] .k-hero-wordmark:hover::after {
        display: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .k-hero-wordmark:hover {
          animation: none !important;
          filter: brightness(1.08);
          transform: none;
          color: var(--k-thermal-mid);
          text-shadow:
            0 0 18px color-mix(in srgb, var(--k-thermal-mid) 40%, transparent),
            0 10px 36px rgba(0, 0, 0, 0.55);
          transition: color 180ms ease, filter 180ms ease, text-shadow 180ms ease;
        }
        .k-hero-wordmark:hover::after {
          display: none;
        }
      }

      .k-hero-bottom {
        position: absolute;
        left: var(--k-page-gutter);
        right: var(--k-page-gutter);
        /* Clear the fixed music bar + home indicator */
        bottom: calc(var(--k-audio-clearance) + 12px);
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        z-index: 5;
        pointer-events: none;
      }
      .k-hero-bottom > * {
        pointer-events: auto;
      }
      .k-hero-scroll {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: 'IBM Plex Mono', monospace;
        color: var(--k-bone-3);
      }
      .k-hero-scroll-label {
        font-size: 10px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }
      .k-hero-scroll-arrow {
        color: var(--k-red);
        font-size: 16px;
        line-height: 1;
      }
      .k-hero-tagline {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: right;
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(10px, 1vw, 12px);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--k-bone-2);
        line-height: 1.4;
        max-width: 22ch;
      }
      .k-hero-est-line {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--k-bone-3);
      }

      /* ── SECTION STRIPS (dash titles + single-item features) ─────── */

      .k-panel--events,
      .k-panel--collective {
        min-height: auto;
        padding-top: clamp(48px, 8vh, 96px);
        padding-bottom: clamp(48px, 8vh, 96px);
      }
      .k-strip {
        position: relative;
        max-width: 1100px;
        margin: 0 auto;
        width: 100%;
      }
      .k-strip-head {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: clamp(28px, 5vh, 48px);
      }
      .k-strip-dash {
        display: block;
        width: 28px;
        height: 2px;
        background: var(--k-red);
        flex-shrink: 0;
      }
      .k-strip-title {
        margin: 0;
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(12px, 1.2vw, 14px);
        font-weight: 600;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--k-bone);
      }

      /* Single OVERRIDE event — intentional featured tile, not a lonely grid cell */
      .k-event-feature {
        display: grid;
        grid-template-columns: minmax(200px, 340px) minmax(0, 1fr) auto;
        align-items: stretch;
        gap: clamp(16px, 2.5vw, 40px);
        outline: 1px solid var(--k-hair);
        background: var(--k-void);
        text-decoration: none;
        color: inherit;
        padding: clamp(16px, 2vw, 24px);
        width: 100%;
        max-width: 920px;
        margin: 0 auto;
        box-sizing: border-box;
        min-width: 0;
        transition: outline-color 200ms ease, transform 200ms ease;
      }
      .k-event-feature:hover {
        outline-color: color-mix(in srgb, var(--k-red) 55%, var(--k-hair));
        transform: translateY(-2px);
      }
      .k-event-feature-visual {
        position: relative;
        aspect-ratio: 16 / 10;
        width: 100%;
        min-width: 0;
        background: var(--k-warm);
        outline: 1px solid var(--k-hair);
        overflow: hidden;
      }
      .k-event-feature-glow {
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          radial-gradient(
            ellipse 70% 65% at 50% 48%,
            color-mix(in srgb, var(--k-red) 38%, transparent) 0%,
            color-mix(in srgb, var(--k-thermal-mid) 18%, transparent) 42%,
            transparent 72%
          ),
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.4) 0 2px,
            transparent 2px 4px
          );
        transition: opacity 160ms ease;
      }
      .k-event-feature-sigil {
        position: absolute;
        inset: 0;
        z-index: 1;
        display: grid;
        place-items: center;
        transition: opacity 120ms ease, filter 160ms ease, transform 200ms ease;
      }
      .k-event-feature-sigil img {
        width: min(58%, 160px);
        height: auto;
        object-fit: contain;
        opacity: 0.92;
        filter:
          brightness(0.9)
          sepia(1)
          saturate(9)
          hue-rotate(-25deg)
          contrast(1.2)
          drop-shadow(0 0 18px color-mix(in srgb, var(--k-red) 45%, transparent));
        animation: k-event-sigil-idle 4.2s ease-in-out infinite;
      }
      @keyframes k-event-sigil-idle {
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
      .k-event-feature-feed {
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
      .k-event-feature-feed::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            to top,
            rgba(0, 0, 0, 0.55) 0%,
            transparent 45%
          ),
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.45) 0 1px,
            transparent 1px 3px
          );
        mix-blend-mode: multiply;
      }
      .k-event-feature-visual[data-surf='true'] .k-event-feature-sigil {
        opacity: 0;
      }
      .k-event-feature-visual[data-surf='true'] .k-event-feature-glow {
        opacity: 0.35;
      }
      .k-event-feature-visual[data-surf='true'] .k-event-feature-feed {
        opacity: 1;
        animation: k-event-feed-glitch 0.22s steps(3) infinite;
      }
      @keyframes k-event-feed-glitch {
        0%,
        100% {
          transform: translate3d(0, 0, 0);
          clip-path: inset(0 0 0 0);
          filter:
            contrast(1.15) saturate(0.85) brightness(0.92)
            drop-shadow(0 0 0 transparent);
        }
        33% {
          transform: translate3d(-3px, 0, 0);
          clip-path: inset(12% 0 48% 0);
          filter:
            contrast(1.25) saturate(1.1) brightness(1.05)
            drop-shadow(-3px 0 0 color-mix(in srgb, var(--k-red) 55%, transparent))
            drop-shadow(3px 0 0 rgba(255, 255, 255, 0.2));
        }
        66% {
          transform: translate3d(3px, 1px, 0);
          clip-path: inset(50% 0 18% 0);
          filter:
            contrast(1.2) saturate(0.7) brightness(0.95)
            drop-shadow(2px 0 0 color-mix(in srgb, var(--k-red) 40%, transparent))
            drop-shadow(-2px 0 0 rgba(255, 255, 255, 0.18));
        }
      }
      .k-event-feature-cross {
        position: absolute;
        top: 8px;
        right: 10px;
        z-index: 3;
        color: var(--k-red);
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
      }
      .k-event-feature-ch {
        position: absolute;
        left: 10px;
        bottom: 8px;
        z-index: 3;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 9px;
        letter-spacing: 0.28em;
        color: var(--k-red);
        text-shadow: 0 0 8px color-mix(in srgb, var(--k-red) 50%, transparent);
      }
      .k-home[data-reduced='true'] .k-event-feature-sigil img,
      .k-home[data-lite='true'] .k-event-feature-sigil img {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-event-feature-visual[data-surf='true'] .k-event-feature-feed,
      .k-home[data-lite='true'] .k-event-feature-visual[data-surf='true'] .k-event-feature-feed {
        animation: none;
      }
      .k-event-feature-meta {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        min-width: 0;
      }
      .k-event-feature-date {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(14px, 1.4vw, 18px);
        letter-spacing: 0.2em;
        color: var(--k-red);
      }
      .k-event-feature-name {
        /* Same ritual face as hero wordmark — less razor than Archivo */
        font-family: 'CyberpunkCity', 'Archivo Black', sans-serif;
        font-weight: 400;
        font-size: clamp(32px, 7vw, 68px);
        letter-spacing: 0.04em;
        line-height: 0.95;
        text-transform: uppercase;
        color: var(--k-bone);
        min-width: 0;
        max-width: 100%;
        overflow-wrap: anywhere;
      }
      .k-event-feature-loc {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--k-bone-3);
      }
      .k-event-feature-cta {
        align-self: end;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.22em;
        color: var(--k-bone-2);
        border-bottom: 1px solid var(--k-bone-3);
        padding-bottom: 4px;
        white-space: nowrap;
        transition: color 200ms ease, border-color 200ms ease;
      }
      .k-event-feature:hover .k-event-feature-cta {
        color: var(--k-red);
        border-color: var(--k-red);
      }

      /* Collective — single portrait editorial, not empty multi-col grid */
      .k-collective-feature {
        display: grid;
        grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
        gap: clamp(28px, 5vw, 64px);
        align-items: start;
        max-width: 860px;
        margin: 0 auto;
        width: 100%;
        min-width: 0;
      }
      .k-resident-card--solo {
        max-width: 320px;
      }
      .k-resident-portrait--solo {
        aspect-ratio: 3 / 4;
      }
      .k-resident-writeup--solo {
        padding-top: clamp(8px, 2vh, 24px);
        max-width: 48ch;
      }

      /* ── SCROLL SECTIONS (legacy helpers) ────────────────────────── */

      .k-section {
        position: relative;
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr) minmax(0, 1fr) 96px;
        grid-template-rows: auto 1fr auto;
        gap: clamp(20px, 3vw, 48px);
        min-height: calc(100svh - clamp(48px, 8vw, 128px));
        align-items: start;
      }
      .k-section-index {
        grid-column: 1 / 2;
        grid-row: 1 / 3;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      .k-section-num {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(14px, 1.5vw, 18px);
        letter-spacing: 0.2em;
        color: var(--k-red);
        font-weight: 700;
      }
      .k-section-dash {
        display: block;
        width: 40px;
        height: 1px;
        background: var(--k-red);
      }
      .k-section-eyebrow {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.24em;
        color: var(--k-bone-2);
        text-transform: uppercase;
      }
      .k-section-eyebrow--inline {
        margin-top: 4px;
      }

      .k-section-body {
        grid-column: 2 / 3;
        grid-row: 1 / 3;
        display: flex;
        flex-direction: column;
        gap: clamp(16px, 3vw, 32px);
        padding-top: 4px;
        max-width: 44ch;
      }
      .k-section-heading {
        font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        font-size: clamp(30px, 3.6vw, 44px);
        color: var(--k-bone);
        letter-spacing: -0.02em;
        line-height: 1.1;
        text-transform: uppercase;
        margin: 0;
      }
      .k-section-copy {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(13px, 1.15vw, 16px);
        line-height: 1.75;
        color: var(--k-bone-2);
        max-width: 40ch;
        margin: 0;
      }
      .k-section-cta {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 13px;
        letter-spacing: 0.18em;
        color: var(--k-bone);
        text-decoration: none;
        border-bottom: 1px solid var(--k-bone-3);
        padding: 6px 0;
        width: fit-content;
        transition: color 200ms ease, border-color 200ms ease;
      }
      .k-section-cta:hover {
        color: var(--k-red);
        border-color: var(--k-red);
      }

      .k-section-visual {
        grid-column: 3 / 4;
        grid-row: 1 / 3;
        min-height: 320px;
        display: flex;
      }
      .k-section-photo {
        position: relative;
        flex: 1 1 auto;
        min-height: 240px;
        outline: 1px solid var(--k-hair);
        background: var(--k-void);
        overflow: hidden;
        filter: contrast(1.05) grayscale(0.85);
      }
      .k-section-caption {
        position: absolute;
        left: 12px;
        bottom: 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.3em;
        color: var(--k-bone-2);
      }

      .k-section-rail {
        grid-column: 4 / 5;
        grid-row: 1 / 4;
        writing-mode: vertical-rl;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.4em;
        color: var(--k-bone-3);
        text-transform: uppercase;
        border-left: 1px solid var(--k-hair);
        padding-left: 12px;
        justify-self: end;
        align-self: stretch;
        display: flex;
        align-items: flex-start;
      }
      .k-section-rail a {
        color: inherit;
        text-decoration: none;
        transition: color 200ms ease;
      }
      .k-section-rail a:hover { color: var(--k-red); }

      /* Next event specifics */
      .k-event-name {
        font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        text-transform: uppercase;
        letter-spacing: -0.02em;
        font-size: clamp(36px, 5vw, 72px);
        line-height: 0.9;
        color: var(--k-bone);
        margin: 0;
      }
      .k-event-date {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(20px, 2.2vw, 28px);
        letter-spacing: 0.16em;
        color: var(--k-bone);
      }
      .k-event-location {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--k-bone-2);
        border-top: 1px solid var(--k-hair);
        padding-top: 8px;
      }

      /* Wireframe globe container */
      .k-globe-wrap {
        position: relative;
        flex: 1 1 auto;
        min-height: 260px;
        background:
          radial-gradient(ellipse 90% 90% at 50% 50%, rgba(30, 5, 5, 0.75) 0%, rgba(10, 10, 10, 1) 70%),
          var(--k-void);
        outline: 1px solid var(--k-hair);
        display: grid;
        place-items: center;
        padding: 24px;
        overflow: hidden;
      }
      .k-globe-wrap > svg { max-width: 380px; max-height: 380px; }
      .k-globe-tag {
        position: absolute;
        right: 12px;
        bottom: 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.32em;
        color: rgba(255, 200, 200, 0.7);
      }

      /* Residents */
      .k-section--residents {
        grid-template-columns: 96px minmax(0, 1fr) 96px;
        grid-template-rows: auto auto auto;
      }
      .k-section--residents .k-section-index {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        flex-direction: row;
        align-items: center;
        gap: 12px;
      }
      .k-residents-layout {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
        display: flex;
        flex-direction: column;
        gap: clamp(24px, 4vh, 48px);
        margin-top: clamp(24px, 4vh, 48px);
      }
      .k-residents-row {
        display: grid;
        grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
        gap: clamp(20px, 3vw, 40px);
        align-items: start;
      }
      .k-resident-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: var(--k-bone);
        text-decoration: none;
        transition: transform 200ms ease;
      }
      .k-resident-card:hover { transform: translateY(-2px); }
      .k-resident-portrait {
        position: relative;
        aspect-ratio: 3 / 4;
        background: var(--k-void);
        outline: 1px solid var(--k-hair);
        overflow: hidden;
        filter: contrast(1.15) grayscale(1) brightness(0.95);
      }
      .k-resident-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .k-resident-portrait::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 70% 20%, color-mix(in srgb, var(--k-thermal-mid) 6%, transparent), transparent 60%),
          repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.28) 0 2px, transparent 2px 4px);
        mix-blend-mode: multiply;
        pointer-events: none;
      }
      .k-resident-portrait--glitch {
        isolation: isolate;
      }
      .k-resident-portrait--glitch::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(
          transparent 44%,
          color-mix(in srgb, var(--k-thermal-mid) 16%, transparent) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
      }
      .k-resident-portrait--glitch .k-resident-photo {
        position: relative;
        z-index: 0;
      }
      .k-resident-card:hover .k-resident-portrait--glitch .k-resident-photo,
      .k-resident-portrait--glitch:hover .k-resident-photo {
        animation: k-resident-photo-glitch 1.6s steps(6) infinite;
      }
      .k-resident-card:hover .k-resident-portrait--glitch::before,
      .k-resident-portrait--glitch:hover::before {
        animation: k-sigil-dark-scan 1.6s steps(2) infinite;
      }
      .k-resident-card:hover .k-resident-portrait--glitch::after,
      .k-resident-portrait--glitch:hover::after {
        background:
          radial-gradient(ellipse at 70% 20%, color-mix(in srgb, var(--k-thermal-mid) 10%, transparent), transparent 60%),
          repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.38) 0 1px, transparent 1px 3px);
      }
      @keyframes k-resident-photo-glitch {
        0%,
        68%,
        100% {
          transform: translate3d(0, 0, 0);
          clip-path: inset(0 0 0 0);
          filter: drop-shadow(0 0 0 transparent);
        }
        10% {
          transform: translate3d(-2px, 0, 0);
          clip-path: inset(14% 0 58% 0);
          filter:
            drop-shadow(-3px 0 0 color-mix(in srgb, var(--k-thermal-mid) 32%, transparent))
            drop-shadow(3px 0 0 rgba(0, 255, 255, 0.2));
        }
        20% {
          transform: translate3d(2px, 1px, 0);
          clip-path: inset(52% 0 22% 0);
          filter:
            drop-shadow(2px 0 0 color-mix(in srgb, var(--k-thermal-mid) 26%, transparent))
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.22));
        }
        30% {
          transform: translate3d(-1px, 0, 0);
          clip-path: inset(0 0 0 0);
          filter:
            drop-shadow(-2px 0 0 color-mix(in srgb, var(--k-thermal-mid) 18%, transparent))
            drop-shadow(2px 0 0 rgba(0, 255, 255, 0.16));
        }
        38% {
          transform: translate3d(1px, -1px, 0) skewX(0.4deg);
          clip-path: inset(36% 0 44% 0);
          filter:
            drop-shadow(-2px 0 0 rgba(255, 0, 0, 0.2))
            drop-shadow(2px 0 0 rgba(0, 255, 255, 0.18));
        }
      }
      .k-home[data-reduced='true'] .k-resident-card:hover .k-resident-portrait--glitch .k-resident-photo,
      .k-home[data-reduced='true'] .k-resident-portrait--glitch:hover .k-resident-photo {
        animation: none;
        filter: brightness(1.02);
      }
      .k-home[data-reduced='true'] .k-resident-card:hover .k-resident-portrait--glitch::before,
      .k-home[data-reduced='true'] .k-resident-portrait--glitch:hover::before {
        animation: none;
        opacity: 0;
      }
      @media (hover: none) {
        .k-resident-card:active .k-resident-portrait--glitch .k-resident-photo {
          animation: k-resident-photo-glitch 220ms steps(4) forwards;
        }
        .k-resident-card:active .k-resident-portrait--glitch::before {
          animation: k-sigil-dark-scan 220ms steps(2) forwards;
        }
      }
      .k-resident-cross {
        position: absolute;
        top: 8px;
        right: 8px;
        color: var(--k-red);
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
        line-height: 1;
        z-index: 2;
        opacity: 0.85;
      }
      .k-resident-name {
        font-family: 'Archivo', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        font-size: clamp(14px, 1.4vw, 18px);
        color: var(--k-bone);
        margin-top: 4px;
      }
      .k-resident-role {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.3em;
        color: var(--k-bone-3);
      }
      .k-resident-writeup {
        display: flex;
        flex-direction: column;
        gap: clamp(16px, 2vw, 24px);
        padding-top: 4px;
        border-left: 1px solid var(--k-hair);
        padding-left: clamp(16px, 2.5vw, 28px);
        max-width: 52ch;
      }
      .k-resident-tagline {
        font-family: 'Archivo', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        font-size: clamp(18px, 2vw, 28px);
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--k-bone);
        margin: 0;
        text-transform: lowercase;
      }
      .k-resident-tagline--swap {
        position: relative;
        display: inline-grid;
        cursor: default;
        isolation: isolate;
        max-width: 100%;
      }
      .k-resident-tagline-en,
      .k-resident-tagline-alt {
        grid-area: 1 / 1;
        transition: opacity 90ms ease;
      }
      .k-resident-tagline-alt {
        opacity: 0;
        letter-spacing: -0.02em;
      }
      .k-resident-tagline--alt .k-resident-tagline-en {
        opacity: 0;
      }
      .k-resident-tagline--alt .k-resident-tagline-alt {
        opacity: 1;
      }
      .k-resident-tagline--glitch .k-resident-tagline-en,
      .k-resident-tagline--glitch .k-resident-tagline-alt {
        animation: k-sigil-dark-glitch 260ms steps(4) forwards;
      }
      .k-resident-tagline--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          color-mix(in srgb, var(--k-thermal-mid) 22%, transparent) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 260ms steps(2);
      }
      .k-home[data-reduced='true'] .k-resident-tagline--glitch .k-resident-tagline-en,
      .k-home[data-reduced='true'] .k-resident-tagline--glitch .k-resident-tagline-alt {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-resident-tagline--glitch::after {
        display: none;
      }
      @media (hover: none) {
        .k-resident-tagline--swap:active .k-resident-tagline-en {
          opacity: 0;
        }
        .k-resident-tagline--swap:active .k-resident-tagline-alt {
          opacity: 1;
        }
      }
      .k-resident-bio {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(12px, 1.05vw, 14px);
        line-height: 1.75;
        color: var(--k-bone-2);
        margin: 0;
      }
      .k-section--residents .k-section-rail {
        grid-column: 3 / 4;
        grid-row: 1 / 4;
      }

      /* ── SIGIL ────────────────────────────────────────────────────── */

      .k-panel--sigil {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .k-sigil-head {
        margin-bottom: clamp(24px, 4vh, 40px);
      }
      .k-sigil-title {
        margin-top: 0;
        display: flex;
        flex-direction: column;
        gap: clamp(8px, 1.2vw, 20px);
        font-family: 'Archivo', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        text-transform: uppercase;
        letter-spacing: -0.04em;
        line-height: 0.9;
        font-size: clamp(48px, 8.5vw, 180px);
        color: var(--k-bone);
      }
      .k-sigil-wave-row {
        margin-top: clamp(32px, 5vh, 56px);
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 24px;
      }
      .k-hero-waveform {
        position: relative;
        height: 40px;
        width: 100%;
        color: var(--k-waveform);
      }
      .k-hero-waveform-tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--k-red);
        opacity: 0.55;
      }
      .k-sigil-readmore {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.22em;
        color: var(--k-red);
        text-decoration: none;
        white-space: nowrap;
        transition: opacity 200ms ease;
      }
      .k-sigil-readmore:hover {
        opacity: 0.75;
      }
      .k-sigil-title-two {
        padding-left: clamp(24px, 5vw, 90px);
      }
      .k-sigil-title-two::before {
        content: '';
        display: inline-block;
        width: clamp(48px, 8vw, 140px);
        height: 0.1em;
        background: var(--k-red);
        vertical-align: middle;
        margin-right: 0.3em;
      }
      .k-sigil-title-three {
        padding-left: clamp(24px, 5vw, 90px);
      }
      .k-sigil-dark {
        position: relative;
        display: inline-block;
        cursor: default;
        isolation: isolate;
      }
      .k-sigil-dark--glitch {
        animation: k-sigil-dark-glitch 260ms steps(4) forwards;
      }
      .k-sigil-dark--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          color-mix(in srgb, var(--k-thermal-mid) 22%, transparent) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 260ms steps(2);
      }
      @keyframes k-sigil-dark-glitch {
        0%,
        100% {
          transform: translate(0);
          text-shadow: none;
          clip-path: inset(0);
        }
        25% {
          transform: translate(-3px, 1px) skewX(3deg);
          text-shadow:
            -4px 0 color-mix(in srgb, var(--k-thermal-mid) 85%, transparent),
            4px 0 rgba(0, 255, 255, 0.55);
        }
        50% {
          transform: translate(2px, -1px) skewX(-2deg);
          clip-path: inset(38% 0 40% 0);
          text-shadow:
            3px 0 color-mix(in srgb, var(--k-thermal-mid) 75%, transparent),
            -3px 0 rgba(0, 255, 255, 0.65);
        }
        75% {
          transform: translate(-1px, 2px);
          text-shadow:
            -2px 0 rgba(255, 0, 0, 0.55),
            2px 0 rgba(0, 255, 255, 0.45);
        }
      }
      @keyframes k-sigil-dark-scan {
        0%,
        100% {
          opacity: 0;
          transform: translateY(0);
        }
        45%,
        55% {
          opacity: 1;
          transform: translateY(2px);
        }
      }
      .k-home[data-reduced='true'] .k-sigil-dark--glitch {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-sigil-dark--glitch::after {
        display: none;
      }

      .k-sigil-footerrow {
        margin-top: clamp(48px, 6vh, 80px);
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: clamp(24px, 3vw, 56px);
        align-items: end;
        position: relative;
        z-index: 3;
      }
      .k-coord { font-family: 'IBM Plex Mono', monospace; color: var(--k-bone-2); }
      .k-coord-line { font-size: clamp(16px, 1.5vw, 22px); letter-spacing: 0.18em; }
      .k-coord-sub { font-size: 10px; letter-spacing: 0.3em; opacity: 0.55; margin-top: 4px; }
      .k-barcode {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 56px;
        color: var(--k-bone-2);
        position: relative;
      }
      .k-barcode span { display: block; height: 100%; }
      .k-barcode-num {
        position: absolute;
        left: 0;
        bottom: -18px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.28em;
        color: var(--k-bone-3);
      }
      .k-hanko {
        transform: rotate(-6deg);
        filter: drop-shadow(0 0 8px color-mix(in srgb, var(--k-thermal-mid) 25%, transparent));
      }
      .k-hanko img {
        display: block;
        width: 120px;
        height: 120px;
        object-fit: contain;
        opacity: 0.95;
      }

      .k-horizon {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 44vh;
        perspective: 800px;
        perspective-origin: 50% 0%;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .k-horizon-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(color-mix(in srgb, var(--k-red) 34%, transparent) 1px, transparent 1px),
          linear-gradient(90deg, color-mix(in srgb, var(--k-red) 34%, transparent) 1px, transparent 1px);
        background-size: 60px 60px;
        transform: rotateX(76deg);
        transform-origin: 50% 100%;
        mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 65%);
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 65%);
      }
      [data-theme='heatmap'] .k-horizon-grid {
        background-image:
          linear-gradient(var(--k-grid) 1px, transparent 1px),
          linear-gradient(90deg, var(--k-grid) 1px, transparent 1px);
      }

      /* Reveal-on-scroll */
      .k-panel[data-inview='true'] .k-section-body,
      .k-panel[data-inview='true'] .k-section-visual,
      .k-panel[data-inview='true'] .k-event-feature,
      .k-panel[data-inview='true'] .k-collective-feature,
      .k-panel[data-inview='true'] .k-telemetry,
      .k-panel[data-inview='true'] .k-sigil-title,
      .k-panel[data-inview='true'] .k-sigil-footerrow,
      .k-panel[data-inview='true'] .k-sigil-wave-row,
      .k-panel[data-inview='true'] .k-hero-stage,
      .k-panel[data-inview='true'] .k-hero-bottom {
        opacity: 1;
      }
      .k-panel[data-inview='true'] .k-section-body,
      .k-panel[data-inview='true'] .k-section-visual,
      .k-panel[data-inview='true'] .k-event-feature,
      .k-panel[data-inview='true'] .k-collective-feature,
      .k-panel[data-inview='true'] .k-telemetry,
      .k-panel[data-inview='true'] .k-sigil-title,
      .k-panel[data-inview='true'] .k-sigil-footerrow,
      .k-panel[data-inview='true'] .k-sigil-wave-row,
      .k-panel[data-inview='true'] .k-hero-stage {
        transform: translateY(0);
      }
      .k-section-body,
      .k-section-visual,
      .k-collective-feature,
      .k-telemetry,
      .k-sigil-title,
      .k-sigil-footerrow,
      .k-sigil-wave-row,
      .k-hero-stage {
        opacity: 0;
        transform: translateY(24px);
        transition:
          opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      /* Always paint — no opacity gate (iOS left this blank under UPCOMING EVENTS) */
      .k-event-feature {
        opacity: 1;
        transform: none;
      }
      .k-hero-bottom {
        opacity: 0;
        transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .k-home[data-reduced='true'] .k-section-body,
      .k-home[data-reduced='true'] .k-section-visual,
      .k-home[data-reduced='true'] .k-event-feature,
      .k-home[data-reduced='true'] .k-collective-feature,
      .k-home[data-reduced='true'] .k-telemetry,
      .k-home[data-reduced='true'] .k-sigil-title,
      .k-home[data-reduced='true'] .k-sigil-footerrow,
      .k-home[data-reduced='true'] .k-sigil-wave-row,
      .k-home[data-reduced='true'] .k-hero-stage,
      .k-home[data-reduced='true'] .k-hero-bottom {
        opacity: 1;
        transform: none;
        transition: none;
      }

      /* ── responsive ─────────────────────────────────────────────── */

      @media (max-width: 1100px) {
        .k-event-feature {
          grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
        }
        .k-event-feature-cta {
          grid-column: 2;
          justify-self: start;
          align-self: start;
        }
        .k-collective-feature {
          grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
          gap: 24px;
        }
      }

      @media (max-width: 1024px) {
        .k-hero-wordmark {
          font-size: clamp(32px, 11.5cqi, 160px);
        }
        .k-hero-sun-logo {
          inset: -12%;
        }
      }

      @media (max-width: 900px) {
        .k-home {
          --k-page-gutter: 18px;
        }
        .k-panel {
          padding: 20px 18px 28px;
          min-height: auto;
        }
        .k-panel--events,
        .k-panel--collective,
        .k-panel--sigil {
          padding-top: clamp(36px, 6vh, 64px);
          padding-bottom: clamp(36px, 6vh, 64px);
        }
        .k-hero {
          min-height: 100svh;
          min-height: 100dvh;
          overflow: hidden;
        }
        .k-hero-topbar-spacer {
          height: calc(env(safe-area-inset-top, 0px) + 3rem);
        }
        .k-hero-stage {
          padding:
            calc(env(safe-area-inset-top, 0px) + 3.25rem)
            var(--k-page-gutter)
            calc(var(--k-audio-clearance) + 56px);
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          gap: 10px;
        }
        .k-hero-flank--left {
          grid-column: 1;
          grid-row: 1;
          margin-top: 0;
          justify-self: start;
          align-self: start;
          max-width: min(14rem, calc(100% - 5rem));
          padding-right: 0.5rem;
        }
        .k-hero-flank--right {
          grid-column: 1;
          grid-row: 3;
          margin-bottom: 0;
          justify-self: end;
          align-self: end;
        }
        .k-hero-mark {
          grid-column: 1;
          grid-row: 2;
          width: 100%;
          max-width: 100%;
          min-height: clamp(180px, 34vh, 320px);
        }
        .k-hero-metastack {
          font-size: 8px;
          flex-direction: column;
          flex-wrap: nowrap;
          gap: 2px;
          letter-spacing: 0.16em;
          line-height: 1.3;
        }
        .k-hero-sun-stack {
          width: min(78vw, 380px);
          height: min(78vw, 380px);
        }
        .k-hero-bottom {
          left: var(--k-page-gutter);
          right: var(--k-page-gutter);
          bottom: calc(var(--k-audio-clearance) + 10px);
          gap: 10px;
        }
        .k-hero-wordmark {
          font-size: clamp(28px, 11cqi, 80px);
          letter-spacing: 0.03em;
        }
        .k-hero-sun-logo:not(.k-hero-sun-logo--static) {
          inset: -10%;
        }
        .k-hero-sun-logo--static img {
          width: 82%;
          height: 82%;
        }
        .k-hero-tagline {
          font-size: 9px;
          letter-spacing: 0.1em;
          max-width: 18ch;
        }
        [data-theme='heatmap'] .k-hero-flank--right::after {
          display: none;
        }

        .k-telemetry {
          grid-template-columns: 1fr;
        }

        .k-sigil-title {
          margin-top: 12px;
          font-size: clamp(28px, 9.2vw, 56px);
          font-stretch: 105%;
          letter-spacing: -0.03em;
          gap: 4px;
          max-width: 100%;
        }
        .k-sigil-title > span {
          display: block;
          max-width: 100%;
          overflow: hidden;
        }
        .k-sigil-title-two,
        .k-sigil-title-three { padding-left: 0; }
        .k-sigil-title-two::before {
          width: 28px;
          margin-right: 0.25em;
        }
        .k-sigil-wave-row {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .k-sigil-footerrow {
          grid-template-columns: 1fr auto;
          gap: 20px;
          margin-top: 40px;
        }
        .k-barcode { grid-column: 1 / -1; }
        .k-hanko { justify-self: end; width: 72px; height: 72px; }
        .k-hanko img { width: 72px; height: 72px; }
        .k-horizon { height: 28vh; }
      }

      @media (max-width: 700px) {
        .k-event-feature {
          grid-template-columns: 1fr;
          max-width: none;
          padding: 14px;
          gap: 14px;
        }
        .k-event-feature-visual {
          max-height: 200px;
        }
        .k-event-feature-cta {
          grid-column: 1;
          align-self: start;
        }
        .k-event-feature-name {
          font-size: clamp(36px, 12vw, 52px);
        }

        .k-collective-feature {
          grid-template-columns: 1fr;
          justify-content: stretch;
          text-align: left;
          gap: 20px;
        }
        .k-resident-card--solo {
          max-width: none;
          width: min(100%, 280px);
        }
        .k-resident-portrait--solo {
          aspect-ratio: 4 / 5;
        }
        .k-resident-writeup--solo {
          border-left: none;
          padding-left: 0;
          max-width: none;
        }
        .k-resident-name { font-size: 13px; letter-spacing: 0.01em; }
        .k-resident-role { font-size: 9px; letter-spacing: 0.18em; }
      }

      @media (max-width: 420px) {
        .k-hero-flank--left {
          max-width: min(11rem, calc(100% - 4.5rem));
        }
        .k-hero-metastack {
          font-size: 7px;
          letter-spacing: 0.12em;
        }
        .k-hero-wordmark {
          font-size: clamp(26px, 10.8vw, 56px);
        }
        .k-hero-sun-stack {
          width: min(72vw, 300px);
          height: min(72vw, 300px);
        }
        .k-hero-tagline {
          max-width: 16ch;
          font-size: 8px;
        }
      }
    `}</style>
  )
}
