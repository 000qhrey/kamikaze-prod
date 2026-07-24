'use client'

/**
 * Menu overlay — Framer Motion enter/exit.
 * Lazy-loaded from SiteMenu so homepage initial JS skips framer-motion
 * until the user opens the menu.
 */

import { useEffect } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import { NAV_LINKS } from '@/data/navigation'
import { HOME_COPY } from '@/components/home/homeCopy'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

const EASE = [0.16, 1, 0.3, 1] as const

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

export default function SiteMenuOverlay({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  const reduced = useReducedMotion()
  const dur = reduced ? 0.01 : 0.28
  const panelDur = reduced ? 0.01 : 0.34
  const exitDur = reduced ? 0.01 : 0.2

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

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="site-menu"
            className="k-site-menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: open ? dur : exitDur, ease: EASE }}
          >
            <motion.div
              className="k-site-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur, ease: EASE }}
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              className="k-site-menu-panel"
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.985 }
              }
              animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, x: 16, scale: 0.99 }
              }
              transition={{ duration: panelDur, ease: EASE }}
            >
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
                    <motion.a
                      key={link.href}
                      href={getAssetPath(link.href)}
                      className={clsx(
                        'k-site-menu-link',
                        isActive && 'k-site-menu-link--active',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onClose}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      transition={{
                        duration: reduced ? 0.01 : 0.28,
                        ease: EASE,
                        delay: reduced ? 0 : 0.08 + i * 0.04,
                      }}
                    >
                      <span className="k-site-menu-idx">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="k-site-menu-label">{link.label}</span>
                      <span className="k-site-menu-arrow" aria-hidden>
                        →
                      </span>
                    </motion.a>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .k-site-menu-overlay {
          --k-menu-void: var(--k-void);
          --k-menu-bone: var(--k-bone);
          --k-menu-bone-2: var(--k-bone-2);
          --k-menu-bone-3: var(--k-bone-3);
          --k-menu-red: var(--k-accent);
          --k-menu-hair: var(--k-hair);

          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          grid-template-columns: 1fr minmax(280px, 480px);
          color: var(--k-menu-bone);
        }
        .k-site-menu-backdrop {
          background: rgba(0, 0, 0, 0.72);
          /* Light blur — menu only, not always-on chrome */
          backdrop-filter: blur(2px);
        }
        .k-site-menu-panel {
          background: var(--k-menu-void);
          border-left: 1px solid var(--k-menu-hair);
          display: flex;
          flex-direction: column;
          padding: clamp(24px, 4vw, 48px);
          box-shadow: -24px 0 80px rgba(0, 0, 0, 0.55);
          transform-origin: 100% 50%;
          will-change: transform, opacity;
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
          font-family: var(--font-archivo), 'Archivo', system-ui, sans-serif;
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
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
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
            padding-left 200ms ease;
        }
        .k-site-menu-link:not(.k-site-menu-link--active) .k-site-menu-label {
          color: var(--k-menu-bone-3);
        }
        .k-site-menu-link:not(.k-site-menu-link--active):hover {
          color: var(--k-menu-red);
          padding-left: 20px;
        }
        .k-site-menu-link:not(.k-site-menu-link--active):hover .k-site-menu-label {
          color: var(--k-menu-red);
        }
        .k-site-menu-link--active {
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
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: var(--k-menu-red);
          transition: color 200ms ease, opacity 200ms ease;
        }
        .k-site-menu-link:not(.k-site-menu-link--active) .k-site-menu-idx {
          color: rgba(179, 14, 18, 0.45);
        }
        .k-site-menu-label {
          font-family: var(--font-archivo), 'Archivo', system-ui, sans-serif;
          font-weight: 900;
          font-stretch: 125%;
          font-size: clamp(28px, 4vw, 42px);
          letter-spacing: -0.02em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 200ms ease;
        }
        .k-site-menu-arrow {
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
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
          font-family: var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace;
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
        }

        @media (max-width: 768px), (hover: none) {
          .k-site-menu-backdrop {
            backdrop-filter: none;
          }
        }
      `}</style>
    </>
  )
}
