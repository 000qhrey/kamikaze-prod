'use client'

/**
 * Quiet sitewide menu — KAMIKAZE · MENU topbar + side overlay.
 * Shared by the poster homepage and interior routes.
 *
 * Overlay (Framer Motion) loads only when the menu opens so homepage
 * initial JS stays lean.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { NAV_LINKS } from '@/data/navigation'
import { HOME_COPY } from '@/components/home/homeCopy'
import { getAssetPath } from '@/lib/basePath'
import { playHoverSound } from '@/hooks/useSonicFeedback'
import clsx from 'clsx'

const SiteMenuOverlay = dynamic(() => import('./SiteMenuOverlay'), {
  ssr: false,
})

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

const BRAND_IDLE = 'KAMIKAZE'
const BRAND_KANJI = '神風'
const BRAND_FULL = 'UNDERGROUND NEVER DIES'
/** Settled hover look — mixed Latin + 神風 + block (the cool mid-scramble vibe) */
const BRAND_CORRUPT = 'KA神風▓ZE'
const BRAND_GLITCH = '神風死暴走地下カミカゼ力地ミ▓▒░█01<>[]'

type BrandPhase = 'idle' | 'kanji' | 'full' | 'corrupt'

function TopbarBrand() {
  const [display, setDisplay] = useState(BRAND_IDLE)
  const [phase, setPhase] = useState<BrandPhase>('idle')
  const [live, setLive] = useState(false)
  const morphRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chainRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fromRef = useRef(BRAND_IDLE)

  const clearTimers = useCallback(() => {
    if (morphRef.current) {
      clearInterval(morphRef.current)
      morphRef.current = null
    }
    for (const t of chainRef.current) clearTimeout(t)
    chainRef.current = []
    if (pulseRef.current) {
      clearInterval(pulseRef.current)
      pulseRef.current = null
    }
  }, [])

  const morphTo = useCallback((target: string) => {
    if (morphRef.current) clearInterval(morphRef.current)
    const from = fromRef.current
    const maxLen = Math.max(target.length, from.length)
    let frame = 0
    const total = 18

    morphRef.current = setInterval(() => {
      frame++
      if (frame >= total) {
        setDisplay(target)
        fromRef.current = target
        if (morphRef.current) {
          clearInterval(morphRef.current)
          morphRef.current = null
        }
        return
      }
      const progress = frame / total
      const revealed = Math.floor(progress * target.length)
      let out = ''
      for (let i = 0; i < maxLen; i++) {
        if (i < revealed) out += target[i] ?? ''
        else if (i < target.length)
          out += BRAND_GLITCH[Math.floor(Math.random() * BRAND_GLITCH.length)]
      }
      setDisplay(out)
    }, 28)
  }, [])

  const startCorruptPulse = useCallback(() => {
    if (pulseRef.current) clearInterval(pulseRef.current)
    // Keep the cool mixed mark, occasionally re-glitch the block glyph
    pulseRef.current = setInterval(() => {
      const blocks = '▓▒░█'
      const block = blocks[Math.floor(Math.random() * blocks.length)]
      const next = `KA神風${block}ZE`
      setDisplay(next)
      fromRef.current = next
    }, 180)
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const onEnter = () => {
    // Touch / narrow — keep static wordmark
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(max-width: 700px)').matches) return
      if (window.matchMedia('(pointer: coarse)').matches) return
    }
    playHoverSound()
    clearTimers()
    setLive(true)
    setPhase('kanji')
    morphTo(BRAND_KANJI)
    chainRef.current.push(
      setTimeout(() => {
        setPhase('full')
        morphTo(BRAND_FULL)
      }, 700),
      setTimeout(() => {
        setPhase('corrupt')
        morphTo(BRAND_CORRUPT)
        // After morph settles, keep the block glyph alive
        chainRef.current.push(
          setTimeout(() => {
            startCorruptPulse()
          }, 520),
        )
      }, 1700),
    )
  }

  const onLeave = () => {
    clearTimers()
    setLive(false)
    setPhase('idle')
    morphTo(BRAND_IDLE)
  }

  return (
    <a
      href={getAssetPath('/')}
      className={clsx(
        'k-site-topbar-brand',
        live && phase !== 'idle' && 'k-site-topbar-brand--live',
      )}
      aria-label="Home"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span className="k-site-topbar-brand-text" data-phase={phase}>
        {display}
      </span>
    </a>
  )
}

export function SiteMenu() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  // Keep overlay module mounted after first open so AnimatePresence can exit
  const [overlayReady, setOverlayReady] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const openMenu = useCallback(() => {
    setOverlayReady(true)
    setMenuOpen(true)
  }, [])

  return (
    <>
      <header
        className={clsx('k-site-topbar', isHome && 'k-site-topbar--home')}
      >
        <TopbarBrand />
        {isHome ? (
          <nav className="k-site-topbar-nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={getAssetPath(link.href)}
                className={clsx(
                  'k-site-topbar-nav-link',
                  isNavLinkActive(pathname, link.href) &&
                    'k-site-topbar-nav-link--active',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <span className="k-site-topbar-nav-spacer" aria-hidden />
        )}
        <button
          type="button"
          className="k-site-topbar-menu"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          {HOME_COPY.topbar.menu}
        </button>
      </header>

      {overlayReady && (
        <SiteMenuOverlay open={menuOpen} onClose={closeMenu} pathname={pathname} />
      )}

      <style jsx global>{`
        .k-site-topbar {
          --k-menu-void: var(--k-void);
          --k-menu-bone: var(--k-bone);
          --k-menu-bone-2: var(--k-bone-2);
          --k-menu-bone-3: var(--k-bone-3);
          --k-menu-red: var(--k-accent);
          --k-menu-hair: var(--k-hair);

          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: max(0.75rem, env(safe-area-inset-top))
            clamp(24px, 4vw, 64px) 0.75rem;
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--k-menu-bone-2);
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgb(var(--void-rgb) / 0.72) 0%,
            rgb(var(--void-rgb) / 0.35) 55%,
            rgb(var(--void-rgb) / 0) 100%
          );
        }
        .k-site-topbar--home {
          /* Keep brand/MENU readable once page content scrolls under the bar */
          background: linear-gradient(
            to bottom,
            rgb(var(--void-rgb) / 0.88) 0%,
            rgb(var(--void-rgb) / 0.45) 70%,
            rgb(var(--void-rgb) / 0) 100%
          );
        }
        .k-site-topbar > * {
          pointer-events: auto;
        }
        .k-site-topbar-brand {
          grid-column: 1;
          justify-self: start;
          font-family: var(--font-archivo), 'Archivo', 'Archivo Black', system-ui,
            sans-serif;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: var(--k-menu-bone);
          font-size: 14px;
          text-decoration: none;
          transition: color 200ms ease;
          min-width: 5.5rem;
          max-width: min(48vw, 18rem);
          overflow: hidden;
          text-overflow: clip;
          white-space: nowrap;
        }
        .k-site-topbar-brand:hover,
        .k-site-topbar-brand--live {
          color: var(--k-menu-red);
        }
        .k-site-topbar-brand-text {
          display: inline-block;
          transition: letter-spacing 200ms ease;
        }
        .k-site-topbar-brand-text[data-phase='full'] {
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.14em;
        }
        .k-site-topbar-brand-text[data-phase='kanji'] {
          letter-spacing: 0.2em;
        }
        .k-site-topbar-brand-text[data-phase='corrupt'] {
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-shadow: 0 0 12px color-mix(in srgb, var(--k-menu-red) 55%, transparent);
        }
        .k-site-topbar-nav {
          grid-column: 2;
          justify-self: center;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(10px, 1.6vw, 22px);
          max-width: min(720px, 70vw);
        }
        .k-site-topbar-nav-spacer {
          grid-column: 2;
          display: block;
        }
        .k-site-topbar-nav-link {
          color: var(--k-menu-bone-3);
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.22em;
          transition: color 200ms ease;
          white-space: nowrap;
        }
        .k-site-topbar-nav-link:hover,
        .k-site-topbar-nav-link--active {
          color: var(--k-menu-red);
        }
        .k-site-topbar-menu {
          /* Pin to last track — survives nav display:none collapsing the grid */
          grid-column: 3;
          justify-self: end;
          display: inline-flex;
          align-items: center;
          color: var(--k-menu-bone-2);
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          cursor: pointer;
          transition: color 200ms ease;
        }
        .k-site-topbar-menu:hover {
          color: var(--k-menu-red);
        }
        @media (max-width: 900px) {
          .k-site-topbar {
            grid-template-columns: 1fr auto;
            padding-left: 18px;
            padding-right: 18px;
          }
          .k-site-topbar-nav,
          .k-site-topbar-nav-spacer {
            display: none;
          }
          .k-site-topbar-menu {
            grid-column: 2;
          }
          .k-site-topbar--home {
            background: rgb(var(--void-rgb) / 0.92);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
        }
        @media (max-width: 700px) {
          .k-site-topbar {
            font-size: 10px;
            letter-spacing: 0.18em;
          }
          .k-site-topbar-brand {
            font-size: 13px;
            letter-spacing: 0.04em;
          }
          .k-site-topbar-menu {
            letter-spacing: 0.2em;
          }
        }
      `}</style>
    </>
  )
}
