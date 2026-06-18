import { ManifestoSection } from '@/components/about/ManifestoSection'
import { ManifestoTexture } from '@/components/effects/ManifestoTexture'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { ClientNavButton } from '@/components/layout/ClientNavButton'
import { ABOUT, META } from '@/data/siteCopy'

export const metadata = {
  title: META.about.title,
  description: META.about.description,
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col pt-24">
      <ManifestoTexture phrase={ABOUT.texturePhrase} parallaxSpeed={0.08} />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex-grow pb-16">
        <header className="mb-8">
          <ScrambleText
            className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-7xl tracking-wider break-words mb-4 block"
            triggerOnView
            triggerOnHover={false}
            duration={600}
            resolveToColor="#CC0000"
            finalColor="#EFEFEF"
          >
            {ABOUT.pageTitle}
          </ScrambleText>

          <p className="font-mono text-white/60 text-sm tracking-wide">
            {ABOUT.subtitle}
          </p>
        </header>

        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-arterial/50 to-transparent" />
          <span className="font-mono text-xs text-white/50 tracking-widest">
            {ABOUT.clearance}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-arterial/50 to-transparent" />
        </div>

        <ManifestoSection />

        <section className="mt-24 py-12 border-y border-white/20">
          <div className="text-center">
            <p className="font-mono text-sm text-white/70 mb-6">
              {ABOUT.ctaPrompt}
            </p>
            <ClientNavButton
              href="/artists"
              className="inline-flex items-center justify-center px-8 py-4 min-h-[48px] border border-arterial/50 bg-arterial/10 font-mono text-sm tracking-widest text-arterial hover:bg-arterial/20 hover:border-arterial transition-all duration-200 focus:ring-2 focus:ring-arterial focus:outline-none disabled:opacity-50"
            >
              [ {ABOUT.ctaButton} ]
            </ClientNavButton>
          </div>
        </section>
      </div>

      <PerspectiveGrid />
    </div>
  )
}
