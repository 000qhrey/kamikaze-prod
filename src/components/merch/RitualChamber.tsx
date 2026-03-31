'use client'

import { useCountdown } from '@/hooks/useCountdown'
import { merchItems } from '@/data/merch'
import { CyberFanSigil } from './CyberFanSigil'
import { CountdownDisplay } from './CountdownDisplay'
import { BindingForm } from './BindingForm'
import { ArtifactTeaser } from './ArtifactTeaser'
import { EmberParticles } from './EmberParticles'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { ManifestoTexture } from '@/components/effects/ManifestoTexture'

export function RitualChamber() {
  const countdown = useCountdown()

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(
            ellipse at 50% 30%,
            rgba(10, 26, 10, 0.4) 0%,
            transparent 50%
          ),
          radial-gradient(
            ellipse at 50% 70%,
            rgba(26, 10, 26, 0.3) 0%,
            transparent 50%
          ),
          var(--void)
        `,
      }}
    >
      {/* Manifesto texture - huge scrolling text */}
      <ManifestoTexture phrase="BIND YOUR SIGNAL" parallaxSpeed={0.12} />

      {/* Chromatic diagonal streaks */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background: `
            linear-gradient(
              135deg,
              transparent 0%,
              transparent 45%,
              rgba(204, 0, 0, 0.1) 50%,
              transparent 55%,
              transparent 100%
            ),
            linear-gradient(
              -45deg,
              transparent 0%,
              transparent 45%,
              rgba(0, 255, 255, 0.03) 50%,
              transparent 55%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Ambient particles */}
      <EmberParticles count={30} />

      {/* Ambient glow layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(
            circle at 50% 40%,
            rgba(204, 0, 0, 0.08) 0%,
            transparent 60%
          )`,
          animation: 'ambient-flicker 4s ease-in-out infinite',
        }}
      />

      {/* Content container - unified max-w-2xl */}
      <div className="relative z-10 max-w-2xl mx-auto min-h-screen py-8 px-6 flex flex-col items-center">
        {/* Terminal header */}
        <div className="w-full text-center mb-8 pt-16">
          <div className="font-mono text-xs text-arterial/70 tracking-[0.3em] mb-2">
            [SYSTEM] ACCESSING RESTRICTED SECTOR...
          </div>
          <div className="font-mono text-[10px] text-white/40 tracking-wider">
            CLEARANCE: <span className="text-arterial">PENDING</span>
          </div>
        </div>

        {/* Main title - FILE:// style like Manifesto */}
        <div className="mb-8">
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-mono text-sm md:text-base text-arterial tracking-wider">[VAULT://</span>
            <ScrambleText
              className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider"
              triggerOnView
              triggerOnHover={false}
              duration={600}
              resolveToColor="#CC0000"
              finalColor="#EFEFEF"
            >
              ARTIFACTS
            </ScrambleText>
            <span className="font-mono text-sm md:text-base text-arterial tracking-wider">]</span>
          </div>
          <p className="font-mono text-xs text-white/40 mt-4 tracking-[0.2em] text-center">
            THE RITUAL COMPLETES WHEN THE SIGIL AWAKENS
          </p>
        </div>

        {/* 3D Cyber Fan Sigil */}
        <div className="mb-8">
          <CyberFanSigil progress={countdown.progress} />
        </div>

        {/* Countdown */}
        <div className="mb-12 w-full">
          <CountdownDisplay
            days={countdown.days}
            hours={countdown.hours}
            minutes={countdown.minutes}
            seconds={countdown.seconds}
            progress={countdown.progress}
          />
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-arterial/30 to-transparent" />
          <span className="font-mono text-xs text-arterial/60">&#x25C8;</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-arterial/30 to-transparent" />
        </div>

        {/* Binding form */}
        <div className="w-full mb-16">
          <BindingForm />
        </div>

        {/* Artifact teasers */}
        <div className="w-full mb-16">
          <ArtifactTeaser items={merchItems} progress={countdown.progress} />
        </div>

        {/* Footer warning */}
        <div className="w-full text-center pb-8">
          <div className="font-mono text-[10px] text-white/30 tracking-wider space-y-1">
            <p>ALL ARTIFACTS FINAL SALE // NO RETURNS // NO REFUNDS</p>
            <p className="text-arterial/50">
              THOSE WHO BIND THEIR SIGNAL WILL RECEIVE PRIORITY ACCESS
            </p>
          </div>
        </div>
      </div>

      {/* CSS for ambient effects */}
      <style jsx>{`
        @keyframes ambient-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
  )
}
