'use client'

/**
 * Quiet sitewide menu — KAMIKAZE · MENU topbar + side overlay.
 * Shared by the poster homepage and interior routes.
 *
 * Overlay (Framer Motion) loads only when the menu opens so homepage
 * initial JS stays lean.
 */

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { NAV_LINKS } from '@/data/navigation'
import { HOME_COPY } from '@/components/home/homeCopy'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

const SiteMenuOverlay = dynamic(() => import('./SiteMenuOverlay'), {
  ssr: false,
})

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
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
        <a href={getAssetPath('/')} className="k-site-topbar-brand" aria-label="Home">
          KAMIKAZE
        </a>
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
          background: transparent;
        }
        .k-site-topbar > * {
          pointer-events: auto;
        }
        .k-site-topbar-brand {
          justify-self: start;
          font-family: var(--font-archivo), 'Archivo', 'Archivo Black', system-ui,
            sans-serif;
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
        .k-site-topbar-nav {
          justify-self: center;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(10px, 1.6vw, 22px);
          max-width: min(720px, 70vw);
        }
        .k-site-topbar-nav-spacer {
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
          .k-site-topbar-nav {
            display: none;
          }
          .k-site-topbar {
            padding-left: 18px;
            padding-right: 18px;
          }
        }
        @media (max-width: 700px) {
          .k-site-topbar {
            font-size: 10px;
            letter-spacing: 0.18em;
          }
          .k-site-topbar-brand {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}
