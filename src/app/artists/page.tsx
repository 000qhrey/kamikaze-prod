import { SignalUpload } from '@/components/artists/SignalUpload'
import { ArtistsBackground } from '@/components/artists/ArtistsBackground'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { ARTISTS, META } from '@/data/siteCopy'

export const metadata = {
  title: META.artists.title,
  description: META.artists.description,
}

export default function ArtistsPage() {
  return (
    <div className="relative pt-24 pb-16">
      <ArtistsBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <header className="mb-16">
          <ScrambleText
            className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-7xl tracking-wider break-words mb-4 block"
            triggerOnView
            triggerOnHover={false}
            duration={600}
            resolveToColor="#CC0000"
            finalColor="#EFEFEF"
          >
            {ARTISTS.pageTitle}
          </ScrambleText>

          <p className="font-mono text-white/70 text-sm md:text-base tracking-wide">
            {ARTISTS.subtitle}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-arterial/50 to-transparent" />
            <span className="font-mono text-xs text-white/50 tracking-widest">
              {ARTISTS.divider}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-arterial/50 to-transparent" />
          </div>
        </header>

        <SignalUpload />

        <div className="mt-16 py-8 border-y border-white/20">
          <p className="font-mono text-sm text-white/70 leading-relaxed max-w-2xl">
            <span className="text-arterial">{'>'}</span> {ARTISTS.footerNote}
          </p>
        </div>
      </div>
    </div>
  )
}
