'use client'

/**
 * Kamikaze — dark poster homepage.
 *
 * Scroll: Hero → Residents → Sigil → old footer.
 * KILL SWITCH flips only the hero title (EN KAMIKAZE ↔ JP 神風).
 * Hover on 神風 reveals KAMIKAZE. Rest of the page stays English.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getArtistBySlug } from '@/data/artists'
import { getAssetPath } from '@/lib/basePath'
import { HOME_COPY, CONSTANT } from './homeCopy'
import { HomeFooter } from './HomeFooter'

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

// ─── hero title — EN wordmark or JP 神風 (hover → KAMIKAZE) ────────────────

const WORDMARK_KAMI = 'KAMI'
const WORDMARK_KAMI_GLITCH = 'K∆MI'
const WORDMARK_KAMI_JP = '神'
const WORDMARK_KAZE = 'KAZE'
const WORDMARK_KAZE_JP = '風'

function WordmarkKamiSwap({ reduced }: { reduced: boolean }) {
  const [jp, setJp] = useState(false)
  const [swapGlitching, setSwapGlitching] = useState(false)
  const [ambientGlitching, setAmbientGlitching] = useState(false)
  const [kamiText, setKamiText] = useState(WORDMARK_KAMI)
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ambientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current)
    if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const resetAmbient = useCallback(() => {
    if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
    setKamiText(WORDMARK_KAMI)
    setAmbientGlitching(false)
  }, [])

  const triggerSwapGlitch = useCallback(() => {
    if (reduced) return
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current)
    setSwapGlitching(true)
    swapTimerRef.current = setTimeout(() => setSwapGlitching(false), 220)
  }, [reduced])

  const showJp = useCallback(() => {
    resetAmbient()
    triggerSwapGlitch()
    setJp(true)
  }, [resetAmbient, triggerSwapGlitch])

  const showEn = useCallback(() => {
    triggerSwapGlitch()
    setJp(false)
  }, [triggerSwapGlitch])

  const triggerAmbient = useCallback(() => {
    if (reduced || jp) return
    if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
    setKamiText(WORDMARK_KAMI_GLITCH)
    setAmbientGlitching(true)
    ambientTimerRef.current = setTimeout(() => {
      setKamiText(WORDMARK_KAMI)
      setAmbientGlitching(false)
    }, 220)
  }, [jp, reduced])

  const onTouchStart = useCallback(() => {
    showJp()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(showEn, 700)
  }, [showEn, showJp])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    if (reduced || jp) return
    const i = setInterval(() => {
      if (Math.random() < 0.22) triggerAmbient()
    }, 9_000)
    return () => clearInterval(i)
  }, [jp, reduced, triggerAmbient])

  return (
    <span
      className={[
        'k-hero-wordmark-kami',
        jp ? 'k-hero-wordmark-kami--jp' : '',
        swapGlitching ? 'k-hero-wordmark-kami--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={showJp}
      onMouseLeave={showEn}
      onTouchStart={onTouchStart}
      aria-label={jp ? WORDMARK_KAMI_JP : WORDMARK_KAMI}
    >
      <span className="k-hero-wordmark-kami-en" aria-hidden={jp}>
        {kamiText.split('').map((ch, i) => (
          <span
            key={i}
            className="k-hero-wordmark-glyph"
            style={{
              transition: ambientGlitching
                ? 'transform 50ms linear'
                : 'transform 320ms ease-out',
              transform: ambientGlitching
                ? `translateY(${(Math.random() - 0.5) * 6}px) skewY(${(Math.random() - 0.5) * 4}deg)`
                : 'none',
            }}
          >
            {ch}
          </span>
        ))}
      </span>
      <span className="k-hero-wordmark-kami-jp" aria-hidden={!jp}>
        {WORDMARK_KAMI_JP}
      </span>
    </span>
  )
}

function WordmarkKazeSwap({ reduced }: { reduced: boolean }) {
  const [jp, setJp] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 220)
  }, [reduced])

  const showJp = useCallback(() => {
    triggerGlitch()
    setJp(true)
  }, [triggerGlitch])

  const showEn = useCallback(() => {
    triggerGlitch()
    setJp(false)
  }, [triggerGlitch])

  const onTouchStart = useCallback(() => {
    showJp()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(showEn, 700)
  }, [showEn, showJp])

  useEffect(() => clearTimers, [clearTimers])

  return (
    <span
      className={[
        'k-hero-wordmark-kaze',
        jp ? 'k-hero-wordmark-kaze--jp' : '',
        glitching ? 'k-hero-wordmark-kaze--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={showJp}
      onMouseLeave={showEn}
      onTouchStart={onTouchStart}
      aria-label={jp ? WORDMARK_KAZE_JP : WORDMARK_KAZE}
    >
      <span className="k-hero-wordmark-kaze-en" aria-hidden={jp}>
        {WORDMARK_KAZE.split('').map((ch, i) => (
          <span key={i} className="k-hero-wordmark-glyph">
            {ch}
          </span>
        ))}
      </span>
      <span className="k-hero-wordmark-kaze-jp" aria-hidden={!jp}>
        {WORDMARK_KAZE_JP}
      </span>
    </span>
  )
}

function EnglishWordmark({ reduced }: { reduced: boolean }) {
  return (
    <span className="k-hero-wordmark" aria-label="KAMIKAZE">
      <WordmarkKamiSwap reduced={reduced} />
      <WordmarkKazeSwap reduced={reduced} />
    </span>
  )
}

function TitleMark({ reduced }: { reduced: boolean }) {
  return (
    <>
      <EnglishWordmark reduced={reduced} />
      <div className="k-hero-brush" aria-hidden>
        {CONSTANT.brushKanji.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </>
  )
}

function HeroSunStack({ reduced }: { reduced: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 220)
  }, [reduced])

  const onEnter = useCallback(() => {
    triggerGlitch()
    setHovered(true)
  }, [triggerGlitch])

  const onLeave = useCallback(() => {
    setHovered(false)
    setGlitching(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const onTouchStart = useCallback(() => {
    onEnter()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(onLeave, 700)
  }, [onEnter, onLeave])

  useEffect(() => clearTimers, [clearTimers])

  return (
    <div
      className={[
        'k-hero-sun-stack',
        hovered ? 'k-hero-sun-stack--hover' : '',
        glitching ? 'k-hero-sun-stack--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onTouchStart}
    >
      <div className="k-hero-sun-bloom" />
      <div className="k-hero-sun">
        <div className="k-hero-sun-crt" />
        <SunLogo3D reduced={reduced} hovered={hovered} />
        <div className="k-hero-sun-kami">
          <span className="k-hero-sun-kami-glyph">神</span>
          <span className="k-hero-sun-kami-label">KAMI</span>
        </div>
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

      <div className="k-hero-subrail">
        <div className="k-hero-kanjistack" aria-hidden>
          {HOME_COPY.hero.kanjiStack.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>

      <div className="k-hero-mark">
        <HeroSunStack reduced={reduced} />
        <TitleMark reduced={reduced} />
      </div>

      <div className="k-hero-bottom">
        <div className="k-hero-scroll" aria-hidden>
          <span className="k-hero-scroll-arrow">↓</span>
        </div>

        <div className="k-hero-est">
          <div className="k-hero-tagline">
            {taglineLines.map((line, i) =>
              line === '' ? (
                <span key={`gap-${i}`} className="k-hero-tagline-gap" />
              ) : (
                <span key={`${line}-${i}`}>{line}</span>
              ),
            )}
          </div>
          <span className="k-hero-est-line">{HOME_COPY.hero.est}</span>
        </div>
      </div>

    </section>
  )
}

// ─── RESIDENTS ────────────────────────────────────────────────────────────

function ResidentTagline({ en, ja }: { en: string; ja?: string }) {
  const reduced = usePrefersReducedMotion()
  const [jp, setJp] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 220)
  }, [reduced])

  const showJp = useCallback(() => {
    triggerGlitch()
    setJp(true)
  }, [triggerGlitch])

  const showEn = useCallback(() => {
    triggerGlitch()
    setJp(false)
  }, [triggerGlitch])

  const onTouchStart = useCallback(() => {
    showJp()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(showEn, 700)
  }, [showEn, showJp])

  useEffect(() => clearTimers, [clearTimers])

  if (!ja) {
    return <p className="k-resident-tagline">{en}</p>
  }

  return (
    <p
      className={[
        'k-resident-tagline',
        'k-resident-tagline--swap',
        jp ? 'k-resident-tagline--jp' : '',
        glitching ? 'k-resident-tagline--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={showJp}
      onMouseLeave={showEn}
      onTouchStart={onTouchStart}
      aria-label={jp ? ja : en}
    >
      <span className="k-resident-tagline-en" aria-hidden={jp}>
        {en}
      </span>
      <span className="k-resident-tagline-jp" aria-hidden={!jp}>
        {ja}
      </span>
    </p>
  )
}

function PanelResidents() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="k-panel k-panel--warm" data-panel="01">
      <div className="k-section k-section--residents">
        <div className="k-section-index">
          <span className="k-section-num">01</span>
          <span className="k-section-eyebrow k-section-eyebrow--inline">
            {HOME_COPY.residents.label}
          </span>
        </div>

        <div className="k-residents-layout">
          {CONSTANT.residents.map((r, i) => {
            const slug = r.href.split('/').pop()
            const artist = slug ? getArtistBySlug(slug) : undefined

            return (
              <div key={r.name} className="k-residents-row">
                <a href={getAssetPath(r.href)} className="k-resident-card">
                  <div
                    className={[
                      'k-resident-portrait',
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
                      />
                    ) : (
                      <PortraitSilhouette variant={i} />
                    )}
                    <span className="k-resident-cross" aria-hidden>
                      +
                    </span>
                  </div>
                  <div className="k-resident-name">{r.name}</div>
                  <div className="k-resident-role">
                    {HOME_COPY.residents.role(i + 1)}
                  </div>
                </a>

                {artist && (
                  <div className="k-resident-writeup">
                    <ResidentTagline en={artist.tagline} ja={artist.taglineJa} />
                    <p className="k-resident-bio">{artist.bio}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="k-section-rail" aria-hidden>
          <a href={getAssetPath('/artists')}>{HOME_COPY.residents.viewAll}</a>
        </div>
      </div>
    </section>
  )
}

// ─── SIGIL ────────────────────────────────────────────────────────────────

const SIGIL_DARK_EN = 'DARK.'
const SIGIL_DARK_JP = '闇。'

function SigilDarkWord() {
  const reduced = usePrefersReducedMotion()
  const [jp, setJp] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (reduced) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 220)
  }, [reduced])

  const showJp = useCallback(() => {
    triggerGlitch()
    setJp(true)
  }, [triggerGlitch])

  const showEn = useCallback(() => {
    triggerGlitch()
    setJp(false)
  }, [triggerGlitch])

  const onTouchStart = useCallback(() => {
    showJp()
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(showEn, 700)
  }, [showEn, showJp])

  useEffect(() => clearTimers, [clearTimers])

  return (
    <span
      className={[
        'k-sigil-title-three',
        'k-sigil-dark',
        jp ? 'k-sigil-dark--jp' : '',
        glitching ? 'k-sigil-dark--glitch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={showJp}
      onMouseLeave={showEn}
      onTouchStart={onTouchStart}
      aria-label={jp ? SIGIL_DARK_JP : SIGIL_DARK_EN}
    >
      <span className="k-sigil-dark-en" aria-hidden={jp}>
        {SIGIL_DARK_EN}
      </span>
      <span className="k-sigil-dark-jp" aria-hidden={!jp}>
        {SIGIL_DARK_JP}
      </span>
    </span>
  )
}

function PanelSigil({ now }: { now: string }) {
  const ref = useReveal<HTMLElement>()
  const headingLines = HOME_COPY.sigil.heading.split('\n')

  return (
    <section ref={ref} className="k-panel k-panel--void k-panel--sigil" data-panel="02">
      <div className="k-sigil-eyebrow">
        <span className="k-sigil-num">02</span>
        <span>{HOME_COPY.sigil.label}</span>
      </div>

      <h2 className="k-sigil-title">
        {headingLines.map((line, i) =>
          i === 2 ? (
            <SigilDarkWord key={line} />
          ) : (
            <span key={line} className={i === 1 ? 'k-sigil-title-two' : ''}>
              {line}
            </span>
          ),
        )}
      </h2>

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

function PosterTextures() {
  return (
    <>
      <div style={PAPER_STYLE} aria-hidden />
      <div style={SCRATCH_STYLE} aria-hidden />
      <div style={DUST_STYLE} aria-hidden />
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

  useEffect(() => {
    document.body.classList.add('k-home-body')
    return () => document.body.classList.remove('k-home-body')
  }, [])

  return (
    <div className="k-home" data-reduced={reduced ? 'true' : 'false'}>
      <PosterTextures />

      <PanelHero />
      <PanelResidents />
      <PanelSigil now={now} />

      <HomeFooter />

      <ScrollWaveform reduced={reduced} />
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
        background: var(--void);
        color: var(--k-bone);
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 15px;
        line-height: 1.55;
        overflow-x: clip;
        max-width: 100vw;
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
        overflow: visible;
      }
      .k-panel.k-hero {
        overflow: visible;
      }

      /* Clears the fixed SiteMenu topbar (mounted in AppShell) */
      .k-hero-topbar-spacer {
        height: 1.25rem;
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

      .k-hero-subrail {
        position: relative;
        z-index: 5;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 14px;
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

      /* Centrepiece — red sun sits behind the wordmark, may extend past the mark box */
      .k-hero-sun-stack {
        position: absolute;
        left: 50%;
        top: 38%;
        z-index: 0;
        width: clamp(380px, 72vmin, 900px);
        height: clamp(380px, 72vmin, 900px);
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
          rgba(179, 14, 18, 0.075) 0%,
          rgba(179, 14, 18, 0.04) 40%,
          transparent 68%
        );
      }
      .k-hero-sun,
      .k-hero-sun-noise {
        position: absolute;
        inset: 0;
        border-radius: 50%;
      }
      .k-hero-sun {
        background:
          radial-gradient(circle at 40% 36%, #d41a1a 0%, #b30e12 38%, #7a0c10 72%, #3a0507 100%);
        box-shadow: inset 0 0 140px rgba(0, 0, 0, 0.45);
        overflow: visible;
        animation: k-sun-breathe 12s ease-in-out infinite;
        transition:
          filter 280ms ease,
          box-shadow 280ms ease;
      }
      .k-hero-sun-stack--hover .k-hero-sun {
        filter: brightness(1.06);
        box-shadow:
          inset 0 0 120px rgba(0, 0, 0, 0.38),
          0 0 72px rgba(179, 14, 18, 0.22);
      }
      .k-hero-sun-kami {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.08em;
        pointer-events: none;
        opacity: 0;
        transform: scale(0.97);
        transition:
          opacity 280ms ease,
          transform 320ms ease;
      }
      .k-hero-sun-stack--hover .k-hero-sun-kami {
        opacity: 1;
        transform: scale(1);
      }
      .k-hero-sun-kami-glyph {
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        font-size: clamp(96px, 22vmin, 280px);
        line-height: 0.92;
        color: rgba(232, 224, 210, 0.22);
        text-shadow:
          0 0 40px rgba(224, 26, 23, 0.35),
          2px 0 0 rgba(224, 26, 23, 0.45),
          -2px 0 0 rgba(0, 255, 255, 0.18);
        mix-blend-mode: screen;
        letter-spacing: -0.04em;
      }
      .k-hero-sun-kami-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(9px, 1.1vmin, 12px);
        letter-spacing: 0.42em;
        text-indent: 0.42em;
        color: rgba(232, 224, 210, 0.38);
        text-transform: uppercase;
      }
      .k-hero-sun-stack--glitch .k-hero-sun-kami-glyph {
        animation: k-hero-sun-kami-glitch 220ms steps(4) forwards;
      }
      .k-hero-sun-stack--glitch .k-hero-sun-kami::after {
        content: '';
        position: absolute;
        inset: 18% 12%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          rgba(224, 26, 23, 0.24) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 220ms steps(2);
      }
      @keyframes k-hero-sun-kami-glitch {
        0%,
        100% {
          transform: translate(0);
          text-shadow:
            0 0 40px rgba(224, 26, 23, 0.35),
            2px 0 0 rgba(224, 26, 23, 0.45),
            -2px 0 0 rgba(0, 255, 255, 0.18);
          clip-path: inset(0);
        }
        25% {
          transform: translate(-4px, 2px) skewX(2deg);
          text-shadow:
            -5px 0 rgba(224, 26, 23, 0.85),
            5px 0 rgba(0, 255, 255, 0.55);
        }
        50% {
          transform: translate(3px, -2px) skewX(-2deg);
          clip-path: inset(36% 0 42% 0);
          text-shadow:
            4px 0 rgba(224, 26, 23, 0.75),
            -4px 0 rgba(0, 255, 255, 0.65);
        }
        75% {
          transform: translate(-2px, 1px);
          text-shadow:
            -3px 0 rgba(255, 0, 0, 0.55),
            3px 0 rgba(0, 255, 255, 0.45);
        }
      }
      .k-hero-mark:has(.k-hero-sun-stack--hover) .k-hero-brush {
        opacity: 0.58;
        transition: opacity 280ms ease;
      }
      .k-hero-mark:has(.k-hero-sun-stack--hover) .k-hero-brush span:first-child {
        opacity: 1;
        color: #040202;
        text-shadow:
          2px 0 0 rgba(224, 26, 23, 0.35),
          -1px 1px 0 rgba(0, 0, 0, 0.7);
      }
      .k-hero[data-reduced='true'] .k-hero-sun-stack--glitch .k-hero-sun-kami-glyph {
        animation: none;
      }
      .k-hero[data-reduced='true'] .k-hero-sun-stack--glitch .k-hero-sun-kami::after {
        display: none;
      }
      .k-hero[data-reduced='true'] .k-hero-sun-stack--hover .k-hero-sun {
        filter: brightness(1.04);
      }
      @media (hover: none) {
        .k-hero-sun-stack:active .k-hero-sun-kami {
          opacity: 1;
          transform: scale(1);
        }
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
        opacity: 0.55;
        animation: k-crt-drift 18s linear infinite;
        pointer-events: none;
      }
      .k-hero-sun-noise {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>");
        background-size: 260px 260px;
        mix-blend-mode: multiply;
        opacity: 0.45;
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

      .k-hero-mark {
        position: absolute;
        left: 50%;
        top: 48%;
        transform: translate(-50%, -50%);
        z-index: 2;
        display: grid;
        place-items: center;
        text-align: center;
        width: 115vw;
        max-width: none;
        overflow: visible;
        box-sizing: border-box;
        pointer-events: auto;
      }
      .k-hero-mark > .k-hero-wordmark,
      .k-hero-mark > .k-hero-brush {
        position: relative;
        z-index: 1;
      }
      .k-hero-wordmark {
        position: relative;
        display: block;
        font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
        font-weight: 900;
        font-stretch: 125%;
        letter-spacing: -0.055em;
        color: var(--k-bone-print);
        text-transform: uppercase;
        line-height: 0.86;
        /* Poster crop — wider than the viewport */
        font-size: clamp(52px, 15vw, 260px);
        text-shadow:
          0 0 1px rgba(10, 8, 6, 0.55),
          0.5px 0 0 rgba(10, 8, 6, 0.35),
          -0.5px 0.5px 0 rgba(10, 8, 6, 0.25),
          0 10px 36px rgba(0, 0, 0, 0.55);
        white-space: nowrap;
        grid-area: 1 / 1;
        overflow: visible;
        pointer-events: none;
      }
      .k-hero-wordmark::after {
        content: '';
        position: absolute;
        inset: -4% -1%;
        pointer-events: none;
        background-image:
          repeating-linear-gradient(
            0deg,
            rgba(10, 8, 6, 0.14) 0px,
            rgba(10, 8, 6, 0.14) 1px,
            transparent 1px,
            transparent 3px
          ),
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.04 0 0 0 0 0.03 0 0 0 0.55 0'/></filter><rect width='180' height='180' filter='url(%23g)'/></svg>");
        background-size: auto, 160px 160px;
        mix-blend-mode: multiply;
        opacity: 0.45;
      }
      .k-hero-wordmark-glyph {
        display: inline-block;
        pointer-events: auto;
      }

      /* KAMI segment — hover/touch EN ↔ 神 (grid stack, sigil pattern) */
      .k-hero-wordmark-kami {
        position: relative;
        display: inline-grid;
        cursor: default;
        isolation: isolate;
        vertical-align: baseline;
      }
      .k-hero-wordmark-kami-en,
      .k-hero-wordmark-kami-jp {
        grid-area: 1 / 1;
        transition: opacity 90ms ease;
      }
      .k-hero-wordmark-kami-en {
        display: inline;
      }
      .k-hero-wordmark-kami-jp {
        opacity: 0;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        text-transform: none;
        letter-spacing: -0.06em;
        font-stretch: normal;
        font-size: 2.35em;
        line-height: 0.86;
        place-self: center;
        pointer-events: none;
      }
      .k-hero-wordmark-kami--jp .k-hero-wordmark-kami-en {
        opacity: 0;
      }
      .k-hero-wordmark-kami--jp .k-hero-wordmark-kami-jp {
        opacity: 1;
      }
      .k-hero-wordmark-kami--glitch .k-hero-wordmark-kami-en,
      .k-hero-wordmark-kami--glitch .k-hero-wordmark-kami-jp {
        animation: k-sigil-dark-glitch 220ms steps(4) forwards;
      }
      .k-hero-wordmark-kami--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          rgba(224, 26, 23, 0.22) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 220ms steps(2);
      }
      .k-home[data-reduced='true'] .k-hero-wordmark-kami--glitch .k-hero-wordmark-kami-en,
      .k-home[data-reduced='true'] .k-hero-wordmark-kami--glitch .k-hero-wordmark-kami-jp {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-hero-wordmark-kami--glitch::after {
        display: none;
      }
      @media (hover: none) {
        .k-hero-wordmark-kami:active .k-hero-wordmark-kami-en {
          opacity: 0;
        }
        .k-hero-wordmark-kami:active .k-hero-wordmark-kami-jp {
          opacity: 1;
        }
      }

      /* KAZE segment — hover/touch EN ↔ 風 (grid stack, sigil pattern) */
      .k-hero-wordmark-kaze {
        position: relative;
        display: inline-grid;
        cursor: default;
        isolation: isolate;
        vertical-align: baseline;
      }
      .k-hero-wordmark-kaze-en,
      .k-hero-wordmark-kaze-jp {
        grid-area: 1 / 1;
        transition: opacity 90ms ease;
      }
      .k-hero-wordmark-kaze-en {
        display: inline;
      }
      .k-hero-wordmark-kaze-jp {
        opacity: 0;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        text-transform: none;
        letter-spacing: -0.06em;
        font-stretch: normal;
        font-size: 2.35em;
        line-height: 0.86;
        place-self: center;
        pointer-events: none;
      }
      .k-hero-wordmark-kaze--jp .k-hero-wordmark-kaze-en {
        opacity: 0;
      }
      .k-hero-wordmark-kaze--jp .k-hero-wordmark-kaze-jp {
        opacity: 1;
      }
      .k-hero-wordmark-kaze--glitch .k-hero-wordmark-kaze-en,
      .k-hero-wordmark-kaze--glitch .k-hero-wordmark-kaze-jp {
        animation: k-sigil-dark-glitch 220ms steps(4) forwards;
      }
      .k-hero-wordmark-kaze--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          rgba(224, 26, 23, 0.22) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 220ms steps(2);
      }
      .k-home[data-reduced='true'] .k-hero-wordmark-kaze--glitch .k-hero-wordmark-kaze-en,
      .k-home[data-reduced='true'] .k-hero-wordmark-kaze--glitch .k-hero-wordmark-kaze-jp {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-hero-wordmark-kaze--glitch::after {
        display: none;
      }
      @media (hover: none) {
        .k-hero-wordmark-kaze:active .k-hero-wordmark-kaze-en {
          opacity: 0;
        }
        .k-hero-wordmark-kaze:active .k-hero-wordmark-kaze-jp {
          opacity: 1;
        }
      }

      /* Black brush kanji — stamp over the poster */
      .k-hero-brush {
        grid-area: 1 / 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        color: #060404;
        font-size: clamp(140px, 34vmin, 440px);
        line-height: 0.82;
        pointer-events: none;
        transform: translateX(-2%);
        letter-spacing: -0.02em;
        /* Keep light so the sun modal can read through the stamp */
        opacity: 0.42;
        filter: contrast(1.35);
      }
      .k-hero-brush span {
        display: block;
        text-shadow: 2px 0 0 rgba(0, 0, 0, 0.7), -1px 1px 0 rgba(0, 0, 0, 0.65);
        transform: skewY(-2deg);
      }
      .k-hero-brush span:first-child {
        transform: skewY(-1deg) translateX(6%);
      }
      .k-hero-brush span:last-child {
        transform: skewY(-1deg) translateX(-6%);
      }

      .k-hero-bottom {
        position: absolute;
        left: clamp(24px, 4vw, 64px);
        right: clamp(24px, 4vw, 64px);
        bottom: clamp(24px, 4vh, 48px);
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: end;
        gap: clamp(16px, 3vw, 40px);
        z-index: 5;
      }
      .k-hero-scroll {
        display: inline-flex;
        align-items: center;
        font-family: 'IBM Plex Mono', monospace;
        color: var(--k-bone-3);
      }
      .k-hero-scroll-arrow {
        color: var(--k-red);
        font-size: 16px;
        line-height: 1;
      }
      .k-hero-est {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 14px;
        text-align: right;
        color: var(--k-bone-2);
        max-width: 18ch;
        justify-self: end;
      }
      .k-hero-tagline {
        display: flex;
        flex-direction: column;
        gap: 0;
        text-align: right;
        font-family: 'IBM Plex Mono', monospace;
        font-size: clamp(10px, 1vw, 13px);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--k-bone-2);
        line-height: 1.35;
      }
      .k-hero-tagline-gap {
        display: block;
        height: 0.55em;
      }
      .k-hero-est-line {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--k-bone-3);
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
      .k-section-copy {
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
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
        font-family: 'Noto Sans JP', 'IBM Plex Mono', monospace;
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
          radial-gradient(ellipse at 70% 20%, rgba(224, 26, 23, 0.06), transparent 60%),
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
          rgba(224, 26, 23, 0.16) 50%,
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
          radial-gradient(ellipse at 70% 20%, rgba(224, 26, 23, 0.1), transparent 60%),
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
            drop-shadow(-3px 0 0 rgba(224, 26, 23, 0.32))
            drop-shadow(3px 0 0 rgba(0, 255, 255, 0.2));
        }
        20% {
          transform: translate3d(2px, 1px, 0);
          clip-path: inset(52% 0 22% 0);
          filter:
            drop-shadow(2px 0 0 rgba(224, 26, 23, 0.26))
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.22));
        }
        30% {
          transform: translate3d(-1px, 0, 0);
          clip-path: inset(0 0 0 0);
          filter:
            drop-shadow(-2px 0 0 rgba(224, 26, 23, 0.18))
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
      .k-resident-tagline-jp {
        grid-area: 1 / 1;
        transition: opacity 90ms ease;
      }
      .k-resident-tagline-jp {
        opacity: 0;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        text-transform: none;
        letter-spacing: -0.03em;
        font-stretch: normal;
        font-size: 1.02em;
      }
      .k-resident-tagline--jp .k-resident-tagline-en {
        opacity: 0;
      }
      .k-resident-tagline--jp .k-resident-tagline-jp {
        opacity: 1;
      }
      .k-resident-tagline--glitch .k-resident-tagline-en,
      .k-resident-tagline--glitch .k-resident-tagline-jp {
        animation: k-sigil-dark-glitch 220ms steps(4) forwards;
      }
      .k-resident-tagline--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          rgba(224, 26, 23, 0.22) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 220ms steps(2);
      }
      .k-home[data-reduced='true'] .k-resident-tagline--glitch .k-resident-tagline-en,
      .k-home[data-reduced='true'] .k-resident-tagline--glitch .k-resident-tagline-jp {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-resident-tagline--glitch::after {
        display: none;
      }
      @media (hover: none) {
        .k-resident-tagline--swap:active .k-resident-tagline-en {
          opacity: 0;
        }
        .k-resident-tagline--swap:active .k-resident-tagline-jp {
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
      .k-sigil-eyebrow {
        display: inline-flex;
        gap: 12px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--k-bone-2);
      }
      .k-sigil-num { color: var(--k-red); font-weight: 700; }
      .k-sigil-title {
        margin-top: clamp(48px, 10vh, 120px);
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
        display: inline-grid;
        cursor: default;
        isolation: isolate;
      }
      .k-sigil-dark-en,
      .k-sigil-dark-jp {
        grid-area: 1 / 1;
        transition: opacity 90ms ease;
      }
      .k-sigil-dark-jp {
        opacity: 0;
        font-family: 'Noto Serif JP', 'Yu Mincho', serif;
        font-weight: 900;
        text-transform: none;
        letter-spacing: -0.05em;
        font-stretch: normal;
        font-size: 1.08em;
      }
      .k-sigil-dark--jp .k-sigil-dark-en {
        opacity: 0;
      }
      .k-sigil-dark--jp .k-sigil-dark-jp {
        opacity: 1;
      }
      .k-sigil-dark--glitch .k-sigil-dark-en,
      .k-sigil-dark--glitch .k-sigil-dark-jp {
        animation: k-sigil-dark-glitch 220ms steps(4) forwards;
      }
      .k-sigil-dark--glitch::after {
        content: '';
        position: absolute;
        inset: -4% -2%;
        pointer-events: none;
        background: linear-gradient(
          transparent 44%,
          rgba(224, 26, 23, 0.22) 50%,
          transparent 56%
        );
        mix-blend-mode: screen;
        opacity: 0;
        animation: k-sigil-dark-scan 220ms steps(2);
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
            -4px 0 rgba(224, 26, 23, 0.85),
            4px 0 rgba(0, 255, 255, 0.55);
        }
        50% {
          transform: translate(2px, -1px) skewX(-2deg);
          clip-path: inset(38% 0 40% 0);
          text-shadow:
            3px 0 rgba(224, 26, 23, 0.75),
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
      .k-home[data-reduced='true'] .k-sigil-dark--glitch .k-sigil-dark-en,
      .k-home[data-reduced='true'] .k-sigil-dark--glitch .k-sigil-dark-jp {
        animation: none;
      }
      .k-home[data-reduced='true'] .k-sigil-dark--glitch::after {
        display: none;
      }
      @media (hover: none) {
        .k-sigil-dark:active .k-sigil-dark-en {
          opacity: 0;
        }
        .k-sigil-dark:active .k-sigil-dark-jp {
          opacity: 1;
        }
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
      .k-panel[data-inview='true'] .k-residents-layout,
      .k-panel[data-inview='true'] .k-sigil-title,
      .k-panel[data-inview='true'] .k-sigil-footerrow,
      .k-panel[data-inview='true'] .k-hero-mark,
      .k-panel[data-inview='true'] .k-hero-subrail,
      .k-panel[data-inview='true'] .k-hero-bottom {
        opacity: 1;
      }
      .k-panel[data-inview='true'] .k-section-body,
      .k-panel[data-inview='true'] .k-section-visual,
      .k-panel[data-inview='true'] .k-residents-layout,
      .k-panel[data-inview='true'] .k-sigil-title,
      .k-panel[data-inview='true'] .k-sigil-footerrow,
      .k-panel[data-inview='true'] .k-hero-subrail {
        transform: translateY(0);
      }
      .k-section-body, .k-section-visual, .k-residents-layout, .k-sigil-title, .k-sigil-footerrow, .k-hero-subrail {
        opacity: 0;
        transform: translateY(24px);
        transition:
          opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      /* Hero mark keeps its centering transform — fade only */
      .k-hero-mark,
      .k-hero-bottom {
        opacity: 0;
        transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .k-home[data-reduced='true'] .k-section-body,
      .k-home[data-reduced='true'] .k-section-visual,
      .k-home[data-reduced='true'] .k-residents-layout,
      .k-home[data-reduced='true'] .k-sigil-title,
      .k-home[data-reduced='true'] .k-sigil-footerrow,
      .k-home[data-reduced='true'] .k-hero-mark,
      .k-home[data-reduced='true'] .k-hero-subrail,
      .k-home[data-reduced='true'] .k-hero-bottom {
        opacity: 1;
        transform: none;
        transition: none;
      }
      .k-home[data-reduced='true'] .k-hero-mark {
        transform: translate(-50%, -50%);
      }

      /* ── responsive ─────────────────────────────────────────────── */

      @media (max-width: 1024px) {
        .k-hero-brush {
          font-size: clamp(110px, 28vmin, 280px);
          opacity: 0.88;
        }
        .k-hero-wordmark {
          font-size: clamp(48px, 13vw, 160px);
        }
        .k-hero-sun-logo {
          inset: -12%;
        }
      }

      @media (max-width: 900px) {
        .k-panel {
          padding: 20px 18px 28px;
          min-height: auto;
        }
        .k-hero {
          min-height: 100svh;
          min-height: 100dvh;
          overflow: visible;
        }
        .k-hero-subrail { margin-top: 10px; }
        .k-hero-kanjistack {
          font-size: 12px;
          flex-direction: row;
          gap: 10px;
        }
        .k-hero-mark {
          width: 110vw;
          top: 46%;
        }
        .k-hero-sun-stack {
          width: min(88vw, 460px);
          height: min(88vw, 460px);
          top: 36%;
        }
        .k-hero-bottom {
          left: 18px;
          right: 18px;
          bottom: 22px;
        }
        .k-hero-wordmark {
          font-size: clamp(32px, 12.5vw, 80px);
          letter-spacing: -0.035em;
          font-stretch: 115%;
        }
        .k-hero-brush {
          font-size: clamp(88px, 26vmin, 180px);
          opacity: 0.85;
        }
        .k-hero-sun-logo {
          inset: -10%;
        }
        .k-hero-bottom {
          grid-template-columns: auto 1fr;
          gap: 14px;
          align-items: end;
        }
        .k-hero-est {
          align-items: flex-end;
          text-align: right;
          max-width: 16ch;
        }
        .k-hero-tagline {
          font-size: 10px;
          letter-spacing: 0.1em;
        }

        .k-section {
          grid-template-columns: 48px minmax(0, 1fr);
          grid-template-rows: auto auto auto auto;
          min-height: auto;
          gap: 16px;
        }
        .k-section-index { grid-column: 1 / 2; grid-row: 1 / 2; flex-direction: row; align-items: center; }
        .k-section-body { grid-column: 2 / 3; grid-row: 1 / 3; }
        .k-section-visual { grid-column: 1 / 3; grid-row: 3 / 4; min-height: 220px; }
        .k-section-rail { display: none; }

        .k-section--residents { grid-template-columns: minmax(0, 1fr); }
        .k-section--residents .k-section-index {
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }
        .k-residents-layout {
          grid-column: 1 / 2;
          grid-row: 2 / 3;
          margin-top: 12px;
          gap: 20px;
        }
        .k-residents-row {
          grid-template-columns: minmax(0, 220px);
          gap: 16px;
        }
        .k-resident-writeup {
          border-left: none;
          padding-left: 0;
          max-width: none;
        }
        .k-resident-name { font-size: 13px; letter-spacing: 0.01em; }
        .k-resident-role { font-size: 9px; letter-spacing: 0.18em; }

        .k-sigil-title {
          margin-top: 32px;
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
        .k-sigil-footerrow {
          grid-template-columns: 1fr auto;
          gap: 20px;
          margin-top: 40px;
        }
        .k-barcode { grid-column: 1 / -1; }
        .k-hanko { justify-self: end; width: 72px; height: 72px; }
        .k-hanko svg { width: 72px; height: 72px; }
        .k-horizon { height: 28vh; }
      }

      @media (max-width: 420px) {
        .k-hero-wordmark {
          font-size: clamp(26px, 10.8vw, 56px);
        }
        .k-residents-layout {
          gap: 10px;
        }
      }
    `}</style>
  )
}
