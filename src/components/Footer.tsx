import Link from 'next/link'
import { EMAIL, INSTAGRAM, SOUNDCLOUD } from '@/lib/site'
import Arrow from './Arrow'

const row = 'rowlink md:mono md:min-h-[44px] md:border-0 md:underline-offset-4 md:hover:underline'
const copyright = '© 2026 Kamikaze'

/** The same footer on every page: links, the outlined wordmark, the copyright line. */
export default function Footer() {
  return (
    // bottom padding on phone clears the dock
    <footer data-sigil="footer" className="wrap pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-10 md:pb-7">
      <div className="md:flex md:items-center md:justify-between md:gap-x-8 md:border-t md:border-hair md:pt-3">
        <nav aria-label="Footer" className="flex flex-col md:flex-row md:flex-wrap md:gap-x-8">
          <a className={row} href={INSTAGRAM}>
            Instagram
            <Arrow className="md:hidden" />
          </a>
          <a className={row} href={SOUNDCLOUD}>
            SoundCloud
            <Arrow className="md:hidden" />
          </a>
          <a className={row} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <Link className={`${row} border-b border-hair`} href="/privacy/">
            Privacy
            <Arrow className="md:hidden" />
          </Link>
        </nav>
        <p className="mono dim hidden md:block">{copyright}</p>
      </div>
      <div aria-hidden="true" className="relative mt-9">
        <p className="rit overflow-hidden whitespace-nowrap text-[15.4vw] text-transparent [-webkit-text-stroke:1px_rgba(239,239,239,.4)] [text-shadow:none] md:text-[min(15.5vw,240px)]">
          Kamikaze
        </p>
        {/* a hot light flows through the outlined letters; the same text clipped to a moving gradient, overlaid exactly */}
        <p className="footmark-sweep rit pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-[15.4vw] [text-shadow:none] md:text-[min(15.5vw,240px)]">
          Kamikaze
        </p>
      </div>
      <p className="mono dim mt-5 md:hidden">{copyright}</p>
    </footer>
  )
}
