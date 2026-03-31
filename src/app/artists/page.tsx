import { SignalUpload } from '@/components/artists/SignalUpload'
import { AsciiSigilBackground } from '@/components/canvas/AsciiSigil'
import { ScrambleText } from '@/components/effects/ScrambleText'

export const metadata = {
  title: 'OPEN SIGNAL NETWORK | KAMIKAZE',
  description:
    'Transmission is open. Hierarchy is terminated. Submit your signal.',
}

export default function ArtistsPage() {
  return (
    <div className="relative pt-24 pb-16">
      {/* ASCII Sigil - terminal aesthetic background */}
      <AsciiSigilBackground />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <header className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
            <span className="font-mono text-arterial text-xs tracking-widest hidden sm:inline">
              [SYS://
            </span>
            <ScrambleText
              className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-7xl tracking-wider break-words"
              triggerOnView
              triggerOnHover={false}
              duration={600}
              resolveToColor="#CC0000"
              finalColor="#EFEFEF"
            >
              OPEN_SIGNAL_NETWORK
            </ScrambleText>
            <span className="font-mono text-arterial text-xs tracking-widest hidden sm:inline">
              ]
            </span>
          </div>

          <p className="font-mono text-white/70 text-sm md:text-base tracking-wide">
            Transmission is open. Hierarchy is terminated.
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-arterial/50 to-transparent" />
            <span className="font-mono text-xs text-white/50 tracking-widest">
              NO_IDOLS // ONLY_FREQUENCY
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-arterial/50 to-transparent" />
          </div>
        </header>

        {/* Signal Upload Form */}
        <SignalUpload />

        {/* Manifesto snippet */}
        <div className="mt-16 py-8 border-y border-white/20">
          <p className="font-mono text-sm text-white/70 leading-relaxed max-w-2xl">
            <span className="text-arterial">{'>'}</span> We are not here to
            build idols. We are here to amplify sound. The underground was
            never about names—it was about energy. Submit your frequency.
            Become part of the signal.
          </p>
        </div>
      </div>
    </div>
  )
}
