'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAssetPath } from '@/lib/basePath'
import Arrow from './Arrow'
import SoundToggle from './SoundToggle'
import s from './Nav.module.css'

const LINKS = [
  ['/events/', 'Events'],
  ['/artists/', 'Artists'],
  ['/about/', 'About'],
  ['/contact/', 'Contact'],
] as const

/** Fixed top bar. Below md the links move into a full-screen menu behind a Menu/Close button. */
export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const landed = useRef(false)

  // Every route change closes the menu. Navigation is soft, so the Meta Pixel needs its PageView fired by hand after the first page.
  useEffect(() => {
    setOpen(false)
    if (!landed.current) {
      landed.current = true
      return
    }
    const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq
    if (typeof fbq === 'function') fbq('track', 'PageView')
  }, [pathname])

  // While the menu covers the page: no scroll behind it, nothing behind it focusable, 3D paused, Escape closes.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const behind = document.querySelectorAll<HTMLElement>('#skip, #main, body > footer, #dock')
    const wide = matchMedia('(min-width: 900px)')
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      button.current?.focus()
    }
    root.style.overflow = 'hidden'
    root.dataset.sigilPause = '1'
    behind.forEach((el) => (el.inert = true))
    addEventListener('keydown', onKey)
    wide.addEventListener('change', close) // the menu does not exist at desktop width
    return () => {
      root.style.overflow = ''
      delete root.dataset.sigilPause
      behind.forEach((el) => (el.inert = false))
      removeEventListener('keydown', onKey)
      wide.removeEventListener('change', close)
    }
  }, [open])

  const current = (href: string) => (pathname.startsWith(href) ? 'page' : undefined)

  return (
    <>
    <header className="wrap fixed inset-x-0 top-0 z-10 flex h-[calc(var(--nav-h)+env(safe-area-inset-top,0px))] items-center justify-between gap-4 bg-gradient-to-b from-void via-void/90 to-void/0 pt-[env(safe-area-inset-top,0px)] [backdrop-filter:blur(3px)]">
      <Link href="/" aria-label="Kamikaze home" className="relative z-[2] flex min-h-[44px] items-center gap-[10px]">
        <img src={getAssetPath('/logo-sigil-96.webp')} alt="" width={34} height={34} />
        <span className="mono">Kamikaze</span>
      </Link>

      <nav aria-label="Main" className="mono hidden gap-x-7 md:flex">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={current(href)} className={s.link}>
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/pass/" data-kick className="cta mono hidden min-h-[48px] md:flex">
        Get the venue first
      </Link>

      <SoundToggle />

      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen(!open)}
        className="mono relative z-[2] -mr-2 min-h-[44px] min-w-[44px] px-2 text-right md:hidden"
      >
        {open ? 'Close' : 'Menu'}
      </button>
      </header>
      {/* The menu lives OUTSIDE the header: the header's backdrop-filter would otherwise make it the containing block for this fixed sheet and collapse it into the 64px bar. */}
      <div id="menu" className={`${s.menu} ${open ? s.open : ''} md:hidden`}>
        <nav aria-label="Menu" className="flex flex-1 flex-col justify-center">
          {LINKS.map(([href, label], i) => (
            <Link key={href} href={href} aria-current={current(href)} onClick={() => setOpen(false)} className={`rit ${s.item} ${s.big}`} style={{ '--d': `${60 + i * 45}ms` } as React.CSSProperties}>
              {label}
            </Link>
          ))}
        </nav>
        <div className={s.item} style={{ '--d': '260ms' } as React.CSSProperties}>
          <Link href="/pass/" onClick={() => setOpen(false)} className="cta mono">
            Get the venue first
            <Arrow />
          </Link>
        </div>
      </div>
    </>
  )
}
