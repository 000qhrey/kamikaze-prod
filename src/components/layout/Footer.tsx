'use client'

import { contactInfo } from '@/data/moto'
import { SignalStrengthLink } from './SignalStrengthLink'
import { DataStreamBar } from './DataStreamBar'
import { AscendButton } from './AscendButton'

export function Footer() {
  return (
    <footer className="relative bg-black">
      {/* Data Stream Status Bar */}
      <DataStreamBar />

      {/* Main Footer Content */}
      <div className="py-10 px-6 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Signal Strength Socials */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-8">
              <SignalStrengthLink
                href={contactInfo.instagramUrl}
                label="IG"
                strength={3}
              />
              <SignalStrengthLink
                href="https://soundcloud.com/kamikaze-events"
                label="SC"
                strength={7}
              />
            </div>

            <a
              href={`mailto:${contactInfo.email}`}
              className="font-mono text-xs text-white/70 hover:text-arterial transition-colors"
            >
              {contactInfo.email}
            </a>
          </div>

          {/* Bottom Row: Copyright & Location */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="font-mono text-[10px] text-white/60 tracking-wider">
              &copy; {new Date().getFullYear()} KAMIKAZE
              <span className="mx-3 text-white/30">{'//'}</span>
              BERLIN
              <span className="mx-3 text-white/30">{'//'}</span>
              STAY_UNDERGROUND
            </div>

            <AscendButton />
          </div>
        </div>
      </div>
    </footer>
  )
}
