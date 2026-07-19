'use client'

/**
 * Quiet sitewide menu — KAMIKAZE · MENU topbar + side overlay.
 * Shared by the poster homepage and interior routes.
 */

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/data/navigation'
import { HOME_COPY } from '@/components/home/homeCopy'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

function MenuOverlay({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="k-site-menu-overlay" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="k-site-menu-backdrop" onClick={onClose} aria-hidden />
      <div className="k-site-menu-panel">
        <header className="k-site-menu-head">
          <span className="k-site-menu-brand-mark">KAMIKAZE</span>
          <button type="button" className="k-site-menu-close" onClick={onClose}>
            {HOME_COPY.topbar.menuClose}
            <span aria-hidden>×</span>
          </button>
        </header>

        <nav className="k-site-menu-nav" aria-label="Site">
          {NAV_LINKS.map((link, i) => {
            const isActive = isNavLinkActive(pathname, link.href)
            return (
              // Hard <a> + getAssetPath: full page load with correct staging
              // (/kamikaze/…) vs production (/…) prefix. Avoids Next <Link>
              // soft-nav edge cases on static GitHub Pages exports.
              <a
                key={link.href}
                href={getAssetPath(link.href)}
                className={clsx('k-site-menu-link', isActive && 'k-site-menu-link--active')}
                aria-current={isActive ? 'page' : undefined}
                onClick={onClose}
              >
                <span className="k-site-menu-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="k-site-menu-label">{link.label}</span>
                <span className="k-site-menu-arrow" aria-hidden>
                  →
                </span>
              </a>
            )
          })}
        </nav>

        <footer className="k-site-menu-foot">
          <span>TECHNO COLLECTIVE</span>
          <span aria-hidden>·</span>
          <span>UNDERGROUND</span>
          <span aria-hidden>·</span>
          <span>EST. MMXXVI</span>
        </footer>
      </div>
    </div>
  )
}

export function SiteMenu() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Close overlay on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={clsx('k-site-topbar', isHome && 'k-site-topbar--home')}
      >
        <a href={getAssetPath('/')} className="k-site-topbar-brand" aria-label="Home">
          KAMIKAZE
        </a>
        <button
          type="button"
          className="k-site-topbar-menu"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          {HOME_COPY.topbar.menu}
        </button>
      </header>

      <MenuOverlay open={menuOpen} onClose={closeMenu} pathname={pathname} />

      <style jsx global>{`
        .k-site-topbar {
          --k-menu-void: #050505;
          --k-menu-bone: #f1ede4;
          --k-menu-bone-2: rgba(241, 237, 228, 0.7);
          --k-menu-bone-3: rgba(241, 237, 228, 0.45);
          --k-menu-red: #b30e12;
          --k-menu-hair: rgba(241, 237, 228, 0.1);

          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: max(0.75rem, env(safe-area-inset-top))
            clamp(24px, 4vw, 64px) 0.75rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--k-menu-bone-2);
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(5, 5, 5, 0.72) 0%,
            rgba(5, 5, 5, 0.35) 55%,
            rgba(5, 5, 5, 0) 100%
          );
        }
        .k-site-topbar--home {
          background: transparent;
        }
        .k-site-topbar > * {
          pointer-events: auto;
        }
        .k-site-topbar-brand {
          font-family: 'Archivo', 'Archivo Black', system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: var(--k-menu-bone);
          font-size: 14px;
          text-decoration: none;
          transition: color 200ms ease;
        }
        .k-site-topbar-brand:hover {
          color: var(--k-menu-red);
        }
        .k-site-topbar-menu {
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

        .k-site-menu-overlay {
          --k-menu-void: #050505;
          --k-menu-bone: #f1ede4;
          --k-menu-bone-2: rgba(241, 237, 228, 0.7);
          --k-menu-bone-3: rgba(241, 237, 228, 0.45);
          --k-menu-red: #b30e12;
          --k-menu-hair: rgba(241, 237, 228, 0.1);

          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          grid-template-columns: 1fr minmax(280px, 480px);
          color: var(--k-menu-bone);
        }
        .k-site-menu-backdrop {
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(2px);
        }
        .k-site-menu-panel {
          background: var(--k-menu-void);
          border-left: 1px solid var(--k-menu-hair);
          display: flex;
          flex-direction: column;
          padding: clamp(24px, 4vw, 48px);
          box-shadow: -24px 0 80px rgba(0, 0, 0, 0.55);
        }
        .k-site-menu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--k-menu-hair);
          padding-bottom: 16px;
          margin-bottom: 32px;
        }
        .k-site-menu-brand-mark {
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: 0.04em;
          font-size: 14px;
        }
        .k-site-menu-close {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: var(--k-menu-bone-2);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.32em;
          cursor: pointer;
          padding: 0;
          transition: color 200ms ease;
        }
        .k-site-menu-close:hover {
          color: var(--k-menu-red);
        }
        .k-site-menu-close span {
          font-size: 22px;
          line-height: 1;
        }
        .k-site-menu-nav {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex: 1;
        }
        .k-site-menu-link {
          position: relative;
          display: grid;
          grid-template-columns: 40px 1fr auto;
          align-items: baseline;
          gap: 16px;
          padding: 18px 0 18px 12px;
          border-bottom: 1px solid var(--k-menu-hair);
          color: var(--k-menu-bone);
          text-decoration: none;
          transition:
            color 200ms ease,
            padding-left 200ms ease,
            opacity 200ms ease;
        }
        .k-site-menu-link:not(.k-site-menu-link--active) {
          opacity: 0.5;
        }
        .k-site-menu-link:not(.k-site-menu-link--active):hover {
          opacity: 1;
          color: var(--k-menu-red);
          padding-left: 20px;
        }
        .k-site-menu-link--active {
          opacity: 1;
          padding-left: 20px;
        }
        .k-site-menu-link--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 18px;
          bottom: 18px;
          width: 3px;
          background: var(--k-menu-red);
          box-shadow: 0 0 12px rgba(179, 14, 18, 0.55);
        }
        .k-site-menu-link--active .k-site-menu-label {
          color: var(--k-menu-red);
        }
        .k-site-menu-link--active .k-site-menu-idx {
          color: var(--k-menu-red);
        }
        .k-site-menu-idx {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: var(--k-menu-red);
          transition: color 200ms ease, opacity 200ms ease;
        }
        .k-site-menu-link:not(.k-site-menu-link--active) .k-site-menu-idx {
          color: rgba(179, 14, 18, 0.45);
        }
        .k-site-menu-label {
          font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 900;
          font-stretch: 125%;
          font-size: clamp(28px, 4vw, 42px);
          letter-spacing: -0.02em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 200ms ease;
        }
        .k-site-menu-link:not(.k-site-menu-link--active) .k-site-menu-label {
          color: var(--k-menu-bone-3);
        }
        .k-site-menu-arrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 18px;
          color: var(--k-menu-red);
          opacity: 0;
          transition: opacity 200ms ease, transform 200ms ease;
          transform: translateX(-6px);
        }
        .k-site-menu-link:hover .k-site-menu-arrow,
        .k-site-menu-link--active .k-site-menu-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .k-site-menu-foot {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 40px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          color: var(--k-menu-bone-3);
          text-transform: uppercase;
        }

        @media (max-width: 700px) {
          .k-site-menu-overlay {
            grid-template-columns: 1fr;
          }
          .k-site-menu-backdrop {
            display: none;
          }
          .k-site-topbar {
            font-size: 10px;
            letter-spacing: 0.18em;
            padding-left: 18px;
            padding-right: 18px;
          }
          .k-site-topbar-brand {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}
