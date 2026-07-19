'use client'

/**
 * Kamikaze — Japanese-first poster homepage.
 *
 * Hero is the 2nd (dark) reference: massive red rising-sun disc, brutalist
 * white "KAMIKAZE" wordmark, and a black brush 神風 kanji overlaid on the
 * disc. Grain + fold + soft red bleed textures on top.
 *
 * Scroll sections come from the JP landing concept: 01 集団について (About),
 * 02 次のイベント (Next Event), 03 レジデント (Residents), 04 印 (Sigil).
 *
 * Language is controlled by the FLAVOUR (JP ⇄ EN) toggle in the footer;
 * Japanese is the default. Latin brand words (KAMIKAZE, SHADOW CIRCUIT,
 * resident names) never translate — see `homeCopy.ts`.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { FlavourProvider, useFlavour } from '@/providers/FlavourProvider'
import { HOME_COPY, CONSTANT } from './homeCopy'
import { HomeFooter } from './HomeFooter'

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

    const tick = () => {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(now - lastT, 16.6)
      const instant = Math.min(Math.abs(y - lastY) / dt / 2, 1)
      smoothed += (instant - smoothed) * 0.15
      lastY = y
      lastT = now

      document.documentElement.style.setProperty('--scroll-vel', smoothed.toFixed(3))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [disabled])
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
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            node.dataset.inview = 'true'
            io.unobserve(node)
          }
        }
      },
      { threshold: 0.12 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])
  return ref
}

// ─── ambient scroll waveform (fixed to bottom of hero, and to page bottom) ─

function ScrollWaveform({ reduced, variant = 'page' }: { reduced: boolean; variant?: 'page' | 'hero' }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const W = 1600
    const H = 40
    const POINTS = 160

    const tick = () => {
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
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-10">
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
        <path d={c.shoulders} fill="#050505" />
        <path d={c.neck} fill="#0a0908" />
        <path d={c.profile} fill="#0a0908" />
        <path d={c.hair} fill="#020202" />

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

// ─── warehouse-crowd placeholder (used behind about + next-event) ──────────

function RoomPhoto({ tone = 'warm' }: { tone?: 'warm' | 'cold' }) {
  const isCold = tone === 'cold'
  return (
    <svg
      viewBox="0 0 600 320"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id={`room-bg-${tone}`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={isCold ? '#0e1113' : '#1a1613'} />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>
        <radialGradient id={`room-lamp-${tone}`} cx="52%" cy="14%" r="45%">
          <stop offset="0%" stopColor={isCold ? 'rgba(220,230,240,0.6)' : 'rgba(241,237,228,0.55)'} />
          <stop offset="40%" stopColor={isCold ? 'rgba(220,230,240,0.14)' : 'rgba(241,237,228,0.12)'} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id={`room-red-${tone}`} cx="80%" cy="80%" r="60%">
          <stop offset="0%" stopColor="rgba(224,26,23,0.18)" />
          <stop offset="100%" stopColor="rgba(224,26,23,0)" />
        </radialGradient>
        <filter id={`room-grain-${tone}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={isCold ? 12 : 8} />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 0.98 0 0 0 0 0.95 0 0 0 0.4 0" />
        </filter>
      </defs>

      <rect width="600" height="320" fill={`url(#room-bg-${tone})`} />
      <rect width="600" height="320" fill={`url(#room-lamp-${tone})`} />
      <rect width="600" height="320" fill={`url(#room-red-${tone})`} />

      <g fill="#000">
        <ellipse cx="80" cy="240" rx="55" ry="90" />
        <ellipse cx="170" cy="230" rx="60" ry="100" />
        <ellipse cx="260" cy="245" rx="50" ry="90" />
        <ellipse cx="340" cy="228" rx="55" ry="102" />
        <ellipse cx="420" cy="240" rx="45" ry="88" />
        <ellipse cx="500" cy="232" rx="60" ry="98" />
        <ellipse cx="575" cy="248" rx="50" ry="85" />
      </g>
      <g fill="rgba(241,237,228,0.16)">
        <ellipse cx="170" cy="180" rx="22" ry="26" />
        <ellipse cx="340" cy="176" rx="24" ry="28" />
        <ellipse cx="500" cy="182" rx="22" ry="26" />
      </g>

      <g opacity="0.32">
        {Array.from({ length: 160 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="600"
            y1={i * 2}
            y2={i * 2}
            stroke="#000"
            strokeWidth="0.6"
          />
        ))}
      </g>

      <rect width="600" height="320" filter={`url(#room-grain-${tone})`} opacity="0.3" />
    </svg>
  )
}

// ─── wireframe globe (next-event decoration, mirrors reference 2) ──────────

function WireGlobe() {
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    >
      <defs>
        <radialGradient id="globe-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(224, 26, 23, 0.6)" />
          <stop offset="65%" stopColor="rgba(139, 0, 0, 0.28)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </radialGradient>
        <filter id="globe-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.4 0" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="82" fill="url(#globe-bg)" />
      {/* latitudes */}
      {[0.18, 0.34, 0.5, 0.66, 0.82].map((r) => (
        <ellipse
          key={`lat-${r}`}
          cx="100"
          cy={100 + (r - 0.5) * 100}
          rx="82"
          ry={82 * (1 - Math.abs(0.5 - r) * 1.4)}
          fill="none"
          stroke="rgba(255, 200, 200, 0.45)"
          strokeWidth="0.6"
        />
      ))}
      {/* longitudes */}
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
        <ellipse
          key={`lon-${deg}`}
          cx="100"
          cy="100"
          rx={Math.max(0.5, Math.abs(82 * Math.cos((deg * Math.PI) / 180)))}
          ry="82"
          fill="none"
          stroke="rgba(255, 200, 200, 0.35)"
          strokeWidth="0.5"
        />
      ))}
      <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(224, 26, 23, 0.75)" strokeWidth="1" />
      <circle cx="100" cy="100" r="82" fill="url(#globe-bg)" opacity="0.35" filter="url(#globe-grain)" />
      {/* corner ticks */}
      {[
        [8, 8, 20, 8],
        [8, 8, 8, 20],
        [192, 8, 180, 8],
        [192, 8, 192, 20],
        [8, 192, 20, 192],
        [8, 192, 8, 180],
        [192, 192, 180, 192],
        [192, 192, 192, 180],
      ].map((c, i) => (
        <line
          key={i}
          x1={c[0]}
          y1={c[1]}
          x2={c[2]}
          y2={c[3]}
          stroke="rgba(224, 26, 23, 0.7)"
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}

// ─── wordmark w/ hover + idle glitch (KAMIKAZE) ────────────────────────────

const WORDMARK = 'KAMIKAZE'
const WORDMARK_GLITCH = 'K∆MIKΛZE'

function Wordmark({ reduced }: { reduced: boolean }) {
  const [text, setText] = useState(WORDMARK)
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setText(WORDMARK_GLITCH)
    setGlitching(true)
    timerRef.current = setTimeout(() => {
      setText(WORDMARK)
      setGlitching(false)
    }, 220)
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const i = setInterval(() => {
      if (Math.random() < 0.22) trigger()
    }, 9_000)
    return () => clearInterval(i)
  }, [reduced, trigger])

  return (
    <span
      onMouseEnter={trigger}
      className="k-hero-wordmark"
      aria-label="KAMIKAZE"
      style={{ cursor: 'default' }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="k-hero-wordmark-glyph"
          style={{
            transition: glitching
              ? 'transform 50ms linear'
              : 'transform 320ms ease-out',
            transform: glitching
              ? `translateY(${(Math.random() - 0.5) * 6}px) skewY(${(Math.random() - 0.5) * 4}deg)`
              : 'none',
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

// ─── HERO panel — the 2nd (dark) reference ────────────────────────────────

function PanelHero({ now }: { now: string }) {
  const reduced = usePrefersReducedMotion()
  const ref = useReveal<HTMLElement>()
  const { t } = useFlavour()

  const kanjiLines = t(HOME_COPY.hero.kanjiStack).split('\n')
  const taglineLines = t(HOME_COPY.hero.tagline).split('\n')

  return (
    <section ref={ref} className="k-panel k-panel--void k-hero" data-panel="00">
      {/* Top rail — brand / collective / city / menu */}
      <header className="k-hero-topbar">
        <span className="k-hero-brand">KAMIKAZE</span>
        <span className="k-hero-topbar-sep" />
        <span className="k-hero-topbar-mid">{t(HOME_COPY.topbar.collective)}</span>
        <span className="k-hero-topbar-mid">{t(HOME_COPY.topbar.city)}</span>
        <span className="k-hero-topbar-sep" />
        <a href="/events" className="k-hero-menu" aria-label="Menu">
          {t(HOME_COPY.topbar.menu)}
          <span aria-hidden className="k-hero-menu-dot">⊕</span>
        </a>
      </header>

      {/* Under-rail — red kanji stack (left), matching dark reference */}
      <div className="k-hero-subrail">
        <div className="k-hero-kanjistack" aria-hidden>
          {kanjiLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      </div>

      {/* Centrepiece — red rising-sun disc + wordmark + brush kanji overlay */}
      <div className="k-hero-stage" aria-hidden>
        <div className="k-hero-sun" />
        <div className="k-hero-sun-noise" />
      </div>

      <div className="k-hero-mark">
        <Wordmark reduced={reduced} />
        <div className="k-hero-brush" aria-hidden>
          {CONSTANT.brushKanji.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>

      {/* Mid-left: ENTER THE SIGNAL */}
      <a href="/events" className="k-hero-enter">
        <span className="k-hero-enter-label">{t(HOME_COPY.hero.enter)}</span>
      </a>

      {/* Bottom rail — SCROLL · waveform · slogan + EST */}
      <div className="k-hero-bottom">
        <div className="k-hero-scroll">
          <span className="k-hero-scroll-arrow" aria-hidden>
            ↓
          </span>
          <span>{t(HOME_COPY.hero.scroll)}</span>
        </div>

        <ScrollWaveform reduced={reduced} variant="hero" />

        <div className="k-hero-est">
          <div className="k-hero-tagline">
            {taglineLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
          <span className="k-hero-est-line">{t(HOME_COPY.hero.est)}</span>
        </div>
      </div>

      {/* Quiet time readout — not in the dark reference; kept tiny for vibe */}
      <div className="k-hero-coords" aria-hidden={false}>
        <span className="k-hero-coords-sub">{now || '····'}</span>
      </div>
    </section>
  )
}

// ─── ABOUT (集団について) ──────────────────────────────────────────────────

function PanelAbout() {
  const ref = useReveal<HTMLElement>()
  const { t } = useFlavour()
  const bodyLines = t(HOME_COPY.about.body).split('\n')

  return (
    <section ref={ref} className="k-panel k-panel--warm" data-panel="01">
      <div className="k-section">
        <div className="k-section-index">
          <span className="k-section-num">01</span>
          <span className="k-section-dash" />
        </div>

        <div className="k-section-body">
          <h2 className="k-section-heading">{t(HOME_COPY.about.label)}</h2>
          <p className="k-section-copy">
            {bodyLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < bodyLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          <a href="/about" className="k-section-cta">
            {t(HOME_COPY.about.cta)}
          </a>
        </div>

        <div className="k-section-visual">
          <div className="k-section-photo">
            <RoomPhoto tone="warm" />
            <span className="k-section-caption">{t(HOME_COPY.about.caption)}</span>
          </div>
        </div>

        <div className="k-section-rail" aria-hidden>
          <span>{t(HOME_COPY.about.frequency)} →</span>
        </div>
      </div>
    </section>
  )
}

// ─── NEXT EVENT (次のイベント) ────────────────────────────────────────────

function PanelNextEvent() {
  const ref = useReveal<HTMLElement>()
  const { t } = useFlavour()

  return (
    <section ref={ref} className="k-panel k-panel--void" data-panel="02">
      <div className="k-section">
        <div className="k-section-index">
          <span className="k-section-num">02</span>
          <span className="k-section-dash" />
        </div>

        <div className="k-section-body">
          <span className="k-section-eyebrow">{t(HOME_COPY.event.label)}</span>
          <h2 className="k-event-name">{CONSTANT.eventName}</h2>
          <div className="k-event-date">{CONSTANT.eventDate}</div>
          <div className="k-event-location">{t(HOME_COPY.event.location)}</div>
          <a href="/events" className="k-section-cta">
            {t(HOME_COPY.event.cta)}
          </a>
        </div>

        <div className="k-section-visual">
          <div className="k-globe-wrap">
            <WireGlobe />
            <span className="k-globe-tag">SC / 26</span>
          </div>
        </div>

        <div className="k-section-rail" aria-hidden>
          <span>{t(HOME_COPY.event.status)}</span>
        </div>
      </div>
    </section>
  )
}

// ─── RESIDENTS (レジデント) ───────────────────────────────────────────────

function PanelResidents() {
  const ref = useReveal<HTMLElement>()
  const { t } = useFlavour()

  return (
    <section ref={ref} className="k-panel k-panel--warm" data-panel="03">
      <div className="k-section k-section--residents">
        <div className="k-section-index">
          <span className="k-section-num">03</span>
          <span className="k-section-eyebrow k-section-eyebrow--inline">
            {t(HOME_COPY.residents.label)}
          </span>
        </div>

        <div className="k-residents-grid">
          {CONSTANT.residents.map((r, i) => (
            <a key={r.name} href={r.href} className="k-resident-card">
              <div className="k-resident-portrait">
                <PortraitSilhouette variant={i} />
                <span className="k-resident-cross" aria-hidden>+</span>
              </div>
              <div className="k-resident-name">{r.name}</div>
              <div className="k-resident-role">{t(HOME_COPY.residents.role(i + 1))}</div>
            </a>
          ))}
        </div>

        <div className="k-section-rail" aria-hidden>
          <a href="/artists">{t(HOME_COPY.residents.viewAll)}</a>
        </div>
      </div>
    </section>
  )
}

// ─── SIGIL (印) closer ────────────────────────────────────────────────────

function PanelSigil({ now }: { now: string }) {
  const ref = useReveal<HTMLElement>()
  const { t } = useFlavour()
  const headingLines = t(HOME_COPY.sigil.heading).split('\n')

  return (
    <section ref={ref} className="k-panel k-panel--void k-panel--sigil" data-panel="04">
      <div className="k-sigil-eyebrow">
        <span>{t(HOME_COPY.sigil.number)}</span>
        <span className="k-sigil-num">04</span>
        <span>{t(HOME_COPY.sigil.label)}</span>
      </div>

      <h2 className="k-sigil-title">
        {headingLines.map((line, i) => (
          <span key={i} className={i === 1 ? 'k-sigil-title-two' : ''}>
            {line}
          </span>
        ))}
      </h2>

      <div className="k-sigil-footerrow">
        <div className="k-coord">
          <div className="k-coord-line">{CONSTANT.coords.lat}</div>
          <div className="k-coord-line">{CONSTANT.coords.lon}</div>
          <div className="k-coord-sub">{t(HOME_COPY.hero.coordsCity)}</div>
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
          <div className="k-barcode-num">{t(HOME_COPY.sigil.caption)}</div>
        </div>

        <div className="k-hanko" aria-label="hanko stamp">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--k-red-hanko)"
              strokeWidth="4"
            />
            <text
              x="60"
              y="52"
              textAnchor="middle"
              fontFamily='"Noto Serif JP", serif'
              fontWeight="900"
              fontSize="42"
              fill="var(--k-red-hanko)"
            >
              神
            </text>
            <text
              x="60"
              y="98"
              textAnchor="middle"
              fontFamily='"Noto Serif JP", serif'
              fontWeight="900"
              fontSize="42"
              fill="var(--k-red-hanko)"
            >
              風
            </text>
          </svg>
        </div>
      </div>

      <div className="k-horizon" aria-hidden>
        <div className="k-horizon-grid" />
      </div>
    </section>
  )
}

// ─── fixed textures ────────────────────────────────────────────────────────

const GRAIN_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 25,
  opacity: 0.3,
  mixBlendMode: 'overlay',
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.55' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")",
  backgroundSize: '320px 320px',
}

const RED_BLEED_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 22,
  background:
    'radial-gradient(ellipse 60% 40% at 0% 0%, rgba(139, 0, 0, 0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139, 0, 0, 0.10) 0%, transparent 55%)',
  mixBlendMode: 'screen',
}

const VIGNETTE_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 24,
  background:
    'radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
  mixBlendMode: 'multiply',
}

const FOLD_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 23,
  background:
    'linear-gradient(180deg, rgba(0,0,0,0) 46%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0) 54%), linear-gradient(90deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.22) 33%, rgba(0,0,0,0) 36%)',
  mixBlendMode: 'multiply',
  opacity: 0.55,
}

const SCAN_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 23,
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
  mixBlendMode: 'multiply',
  opacity: 0.28,
}

function PosterTextures() {
  return (
    <>
      <div style={RED_BLEED_STYLE} aria-hidden />
      <div style={SCAN_STYLE} aria-hidden />
      <div style={FOLD_STYLE} aria-hidden />
      <div style={GRAIN_STYLE} aria-hidden />
      <div style={VIGNETTE_STYLE} aria-hidden />
    </>
  )
}

// ─── main composition ─────────────────────────────────────────────────────

function PosterHomepageContent() {
  const reduced = usePrefersReducedMotion()
  useScrollVelocity(reduced)
  const now = useNowUTC()
  const { flavour } = useFlavour()

  useEffect(() => {
    document.body.classList.add('k-home-body')
    return () => document.body.classList.remove('k-home-body')
  }, [])

  return (
    <div
      className="k-home"
      data-reduced={reduced ? 'true' : 'false'}
      data-flavour={flavour}
    >
      <PosterTextures />

      <PanelHero now={now} />
      <PanelAbout />
      <PanelNextEvent />
      <PanelResidents />
      <PanelSigil now={now} />

      <HomeFooter />

      <ScrollWaveform reduced={reduced} />
      <PosterStyles />
    </div>
  )
}

export function PosterHomepage() {
  return (
    <FlavourProvider>
      <PosterHomepageContent />
    </FlavourProvider>
  )
}

export default PosterHomepage

// ─── styles ───────────────────────────────────────────────────────────────

function PosterStyles() {
  return (
    <style jsx global>{`
      :root {
        --k-void: #050505;
        --k-warm: #0d0b0a;
        --k-bone: #f1ede4;
        --k-bone-2: rgba(241, 237, 228, 0.7);
        --k-bone-3: rgba(241, 237, 228, 0.45);
        --k-red: #e01a17;
        --k-red-deep: #b3140f;
        --k-red-hanko: #b31212;
        --k-hair: rgba(241, 237, 228, 0.16);
        --k-waveform: rgba(241, 237, 228, 0.5);
      }

      body.k-home-body {
        cursor: auto !important;
        background: var(--k-void);
        color: var(--k-bone);
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
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
        position: relative;
        min-height: 100vh;
        min-height: 100dvh;
        background: var(--k-void);
        color: var(--k-bone);
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 15px;
        line-height: 1.55;
      }

      /* When JP is active, prefer Noto Sans JP so kanji + mono UI sit together. */
      .k-home[data-flavour='jp'] {
        font-family: 'IBM Plex Mono', 'Noto Sans JP', ui-monospace, monospace;
      }

      .k-panel {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        padding: clamp(24px, 4vw, 64px);
        overflow: hidden;
        box-sizing: border-box;
        isolation: isolate;
        color: var(--k-bone);
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
      .k-panel--warm { background: var(--k-warm); }

      .k-panel > * {
        position: relative;
        z-index: 1;
      }

      /* ── HERO ─────────────────────────────────────────────────────── */

      .k-hero {
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        min-height: 100svh;
        padding-bottom: clamp(32px, 5vh, 72px);
        gap: clamp(12px, 2vh, 24px);
      }

      .k-hero-topbar {
        display: flex;
        align-items: center;
        gap: clamp(16px, 3vw, 40px);
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: var(--k-bone-2);
        border-bottom: 1px solid var(--k-hair);
        padding-bottom: 12px;
      }
      .k-hero-brand {
        font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: var(--k-bone);
        font-size: 15px;
      }
      .k-hero-topbar-sep {
        flex: 1 1 auto;
        height: 1px;
        background: var(--k-hair);
      }
      .k-hero-topbar-mid {
        white-space: nowrap;
      }
      .k-home[data-flavour='jp'] .k-hero-topbar-mid {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.18em;
      }
      .k-hero-menu {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--k-bone);
        text-decoration: none;
        transition: color 200ms ease;
      }
      .k-hero-menu:hover {
        color: var(--k-red);
      }
      .k-hero-menu-dot {
        display: inline-block;
        border: 1px solid currentColor;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
      }
      .k-home[data-flavour='jp'] .k-hero-menu {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.18em;
      }

      .k-hero-subrail {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        z-index: 3;
      }
      .k-hero-kanjistack {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: 'Noto Sans JP', 'Noto Serif JP', serif;
        font-weight: 700;
        font-size: clamp(16px, 1.8vw, 22px);
        color: var(--k-red);
        letter-spacing: 0.12em;
        line-height: 1.1;
      }
      .k-hero-kanjistack span {
        display: block;
      }

      /* Centrepiece — red rising-sun disc positioned behind the wordmark */
      .k-hero-stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 1;
      }
      .k-hero-sun {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: clamp(340px, 62vmin, 780px);
        height: clamp(340px, 62vmin, 780px);
        border-radius: 50%;
        background:
          radial-gradient(circle at 42% 38%, #ff2a1d 0%, #d40b06 45%, #7c0300 82%, #3c0100 100%);
        box-shadow: 0 0 90px rgba(224, 26, 23, 0.35), inset 0 0 120px rgba(0, 0, 0, 0.35);
      }
      .k-hero-sun-noise {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: clamp(340px, 62vmin, 780px);
        height: clamp(340px, 62vmin, 780px);
        border-radius: 50%;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>");
        background-size: 260px 260px;
        mix-blend-mode: multiply;
        opacity: 0.5;
      }

      .k-hero-mark {
        position: relative;
        z-index: 2;
        display: grid;
        place-items: center;
        align-self: center;
        justify-self: center;
        text-align: center;
        width: min(100%, 92vw);
        max-width: 100%;
        overflow: visible;
      }
      .k-hero-wordmark {
        display: block;
        font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        letter-spacing: -0.055em;
        color: var(--k-bone);
        text-transform: uppercase;
        line-height: 0.86;
        /* Fit inside the panel — never spill past the viewport */
        font-size: clamp(48px, 12.5vw, 210px);
        text-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        white-space: nowrap;
        grid-area: 1 / 1;
        max-width: 100%;
      }
      .k-hero-wordmark-glyph { display: inline-block; }

      /* Black brush kanji — sits ON TOP of the wordmark and the red disc */
      .k-hero-brush {
        grid-area: 1 / 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        color: #060404;
        font-size: clamp(90px, 22vmin, 280px);
        line-height: 0.86;
        pointer-events: none;
        transform: translateX(-2%);
        letter-spacing: -0.02em;
        filter: contrast(1.4);
      }
      .k-hero-brush span {
        display: block;
        text-shadow: 2px 0 0 rgba(0, 0, 0, 0.75), -1px 1px 0 rgba(0, 0, 0, 0.7);
        transform: skewY(-2deg);
      }
      .k-hero-brush span:first-child {
        transform: skewY(-1deg) translateX(6%);
      }
      .k-hero-brush span:last-child {
        transform: skewY(-1deg) translateX(-6%);
      }

      .k-hero-enter {
        position: absolute;
        left: clamp(24px, 4vw, 64px);
        top: 46%;
        transform: translateY(-50%);
        color: var(--k-bone);
        text-decoration: none;
        z-index: 4;
      }
      .k-hero-enter-label {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        padding: 10px 0;
        border-top: 1px solid var(--k-bone-3);
        border-bottom: 1px solid var(--k-bone-3);
        max-width: 220px;
        transition: color 200ms ease, border-color 200ms ease;
      }
      .k-home[data-flavour='jp'] .k-hero-enter-label {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.14em;
        text-transform: none;
      }
      .k-hero-enter:hover .k-hero-enter-label {
        color: var(--k-red);
        border-color: var(--k-red);
      }

      .k-hero-bottom {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: end;
        gap: clamp(16px, 3vw, 40px);
        margin-top: auto;
        z-index: 4;
      }
      .k-hero-scroll {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: var(--k-bone-2);
      }
      .k-home[data-flavour='jp'] .k-hero-scroll {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.16em;
        text-transform: none;
      }
      .k-hero-scroll-arrow {
        color: var(--k-red);
        font-size: 14px;
        line-height: 1;
      }
      .k-hero-est {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        text-align: right;
        color: var(--k-bone-2);
        max-width: min(36ch, 42vw);
      }
      .k-hero-tagline {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: right;
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(11px, 1.1vw, 14px);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--k-bone);
      }
      .k-home[data-flavour='jp'] .k-hero-tagline {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.08em;
        text-transform: none;
        font-size: clamp(12px, 1.2vw, 15px);
      }
      .k-hero-est-line {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: var(--k-bone-2);
      }
      .k-home[data-flavour='jp'] .k-hero-est-line {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.16em;
        text-transform: none;
      }

      .k-hero-waveform {
        position: relative;
        height: 40px;
      }
      .k-hero-waveform-tick {
        position: absolute;
        top: 12px;
        width: 1px;
        height: 16px;
        background: var(--k-red);
      }

      .k-hero-coords {
        position: absolute;
        right: clamp(24px, 4vw, 64px);
        top: clamp(72px, 12vh, 120px);
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.22em;
        color: var(--k-bone-3);
        z-index: 3;
        text-align: right;
      }
      .k-hero-coords-sub {
        font-size: 10px;
        letter-spacing: 0.28em;
        opacity: 0.55;
      }

      /* ── SCROLL SECTIONS (about / event / residents) ─────────────── */

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
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.24em;
        color: var(--k-bone-2);
        text-transform: none;
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
        font-family: 'Noto Sans JP', 'Noto Serif JP', serif;
        font-weight: 700;
        font-size: clamp(30px, 3.6vw, 44px);
        color: var(--k-bone);
        letter-spacing: 0.02em;
        line-height: 1.15;
        margin: 0;
      }
      .k-home[data-flavour='en'] .k-section-heading {
        font-family: 'Archivo', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        text-transform: uppercase;
        letter-spacing: -0.02em;
      }
      .k-section-copy {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        font-size: clamp(13px, 1.15vw, 16px);
        line-height: 1.75;
        color: var(--k-bone-2);
        max-width: 40ch;
        margin: 0;
      }
      .k-home[data-flavour='en'] .k-section-copy {
        font-family: 'IBM Plex Mono', monospace;
        line-height: 1.7;
        text-transform: none;
      }
      .k-section-cta {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        font-size: 13px;
        letter-spacing: 0.18em;
        color: var(--k-bone);
        text-decoration: none;
        border-bottom: 1px solid var(--k-bone-3);
        padding: 6px 0;
        width: fit-content;
        transition: color 200ms ease, border-color 200ms ease;
      }
      .k-home[data-flavour='en'] .k-section-cta {
        font-family: 'IBM Plex Mono', monospace;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        font-size: 11px;
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
        background: #050505;
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
      .k-home[data-flavour='jp'] .k-section-rail {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        text-transform: none;
        letter-spacing: 0.2em;
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
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--k-bone-2);
        border-top: 1px solid var(--k-hair);
        padding-top: 8px;
      }
      .k-home[data-flavour='jp'] .k-event-location {
        text-transform: none;
        letter-spacing: 0.14em;
      }

      /* Wireframe globe container */
      .k-globe-wrap {
        position: relative;
        flex: 1 1 auto;
        min-height: 260px;
        background:
          radial-gradient(ellipse 90% 90% at 50% 50%, rgba(30, 5, 5, 0.75) 0%, rgba(5, 5, 5, 1) 70%),
          #050505;
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
      .k-residents-grid {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: clamp(24px, 4vh, 48px);
      }
      .k-section--residents .k-section-rail {
        grid-column: 3 / 4;
        grid-row: 1 / 4;
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
        background: #050505;
        outline: 1px solid var(--k-hair);
        overflow: hidden;
        filter: contrast(1.15) grayscale(1) brightness(0.95);
      }
      .k-resident-portrait::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 70% 20%, rgba(224, 26, 23, 0.06), transparent 60%),
          repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.28) 0 2px, transparent 2px 4px);
        mix-blend-mode: multiply;
        pointer-events: none;
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
      .k-home[data-flavour='jp'] .k-resident-role {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.14em;
      }

      /* ── SIGIL ────────────────────────────────────────────────────── */

      .k-panel--sigil {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .k-sigil-eyebrow {
        display: inline-flex;
        gap: 12px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--k-bone-2);
      }
      .k-home[data-flavour='jp'] .k-sigil-eyebrow {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
        letter-spacing: 0.14em;
        text-transform: none;
      }
      .k-sigil-num { color: var(--k-red); font-weight: 700; }
      .k-sigil-title {
        margin-top: clamp(48px, 10vh, 120px);
        display: flex;
        flex-direction: column;
        gap: clamp(8px, 1.2vw, 20px);
        font-family: 'Noto Sans JP', 'Noto Serif JP', serif;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1.05;
        font-size: clamp(40px, 7vw, 130px);
        color: var(--k-bone);
      }
      .k-home[data-flavour='en'] .k-sigil-title {
        font-family: 'Archivo', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        text-transform: uppercase;
        letter-spacing: -0.04em;
        line-height: 0.9;
        font-size: clamp(48px, 8.5vw, 180px);
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
        filter: drop-shadow(0 0 8px rgba(224, 26, 23, 0.25));
      }
      .k-hanko svg { display: block; opacity: 0.95; }

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
          linear-gradient(rgba(139, 0, 0, 0.34) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 0, 0, 0.34) 1px, transparent 1px);
        background-size: 60px 60px;
        transform: rotateX(76deg);
        transform-origin: 50% 100%;
        mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 65%);
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 65%);
      }

      /* Reveal-on-scroll */
      .k-panel[data-inview='true'] .k-section-body,
      .k-panel[data-inview='true'] .k-section-visual,
      .k-panel[data-inview='true'] .k-residents-grid,
      .k-panel[data-inview='true'] .k-sigil-title,
      .k-panel[data-inview='true'] .k-sigil-footerrow,
      .k-panel[data-inview='true'] .k-hero-mark,
      .k-panel[data-inview='true'] .k-hero-subrail {
        opacity: 1;
        transform: translateY(0);
      }
      .k-section-body, .k-section-visual, .k-residents-grid, .k-sigil-title, .k-sigil-footerrow, .k-hero-mark, .k-hero-subrail {
        opacity: 0;
        transform: translateY(24px);
        transition:
          opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .k-home[data-reduced='true'] .k-section-body,
      .k-home[data-reduced='true'] .k-section-visual,
      .k-home[data-reduced='true'] .k-residents-grid,
      .k-home[data-reduced='true'] .k-sigil-title,
      .k-home[data-reduced='true'] .k-sigil-footerrow,
      .k-home[data-reduced='true'] .k-hero-mark,
      .k-home[data-reduced='true'] .k-hero-subrail {
        opacity: 1;
        transform: none;
        transition: none;
      }

      /* ── responsive ─────────────────────────────────────────────── */

      @media (max-width: 900px) {
        .k-hero-topbar {
          flex-wrap: wrap;
          gap: 10px 14px;
          font-size: 10px;
          letter-spacing: 0.2em;
        }
        .k-hero-topbar-sep { display: none; }
        .k-hero-subrail {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        .k-hero-bottom {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .k-hero-est {
          align-items: flex-start;
          text-align: left;
          max-width: 100%;
        }
        .k-hero-tagline {
          text-align: left;
          font-size: 12px;
        }
        .k-hero-sun,
        .k-hero-sun-noise {
          width: clamp(280px, 82vmin, 520px);
          height: clamp(280px, 82vmin, 520px);
        }
        .k-hero-wordmark {
          font-size: clamp(40px, 18vw, 120px);
        }
        .k-hero-brush {
          font-size: clamp(72px, 30vmin, 200px);
        }
        .k-hero-enter {
          top: auto;
          bottom: 28vh;
          transform: none;
        }
        .k-hero-coords {
          display: none;
        }

        .k-section {
          grid-template-columns: 48px minmax(0, 1fr);
          grid-template-rows: auto auto auto auto;
        }
        .k-section-index { grid-column: 1 / 2; grid-row: 1 / 2; flex-direction: row; align-items: center; }
        .k-section-body { grid-column: 2 / 3; grid-row: 1 / 3; }
        .k-section-visual { grid-column: 1 / 3; grid-row: 3 / 4; min-height: 220px; }
        .k-section-rail { display: none; }

        .k-section--residents { grid-template-columns: 48px minmax(0, 1fr); }
        .k-residents-grid {
          grid-column: 1 / 3;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .k-sigil-title { font-size: clamp(30px, 10vw, 72px); }
        .k-sigil-footerrow {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .k-hanko { justify-self: end; }
      }
    `}</style>
  )
}
