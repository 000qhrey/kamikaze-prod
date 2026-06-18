'use client'

import { useState } from 'react'
import { ARTISTS } from '@/data/siteCopy'
import { Genre } from '@/data/signals'
import { SignalFeed } from './SignalFeed'
import { SignalUpload } from './SignalUpload'
import { FrequencyTuner } from './FrequencyTuner'
import FrequencySigil from '@/components/canvas/FrequencySigil'

export function SignalNetworkContent() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)

  return (
    <div className="relative min-h-screen pt-24 pb-32">
      {/* Frequency Sigil - background visual */}
      <FrequencySigil />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="font-mono text-arterial text-xs tracking-widest">
              [SYS://
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-wider">
              {ARTISTS.networkTitle}
            </h1>
            <span className="font-mono text-arterial text-xs tracking-widest hidden sm:inline">
              ]
            </span>
          </div>

          <p className="font-mono text-white/70 text-sm md:text-base tracking-wide">
            {ARTISTS.networkSubtitle}
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-arterial/50 to-transparent" />
            <span className="font-mono text-[10px] text-white/50 tracking-widest">
              {ARTISTS.networkDivider}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-arterial/50 to-transparent" />
          </div>
        </header>

        {/* Manifesto snippet */}
        <div className="mb-12 py-8 border-y border-white/30/20">
          <p className="font-mono text-sm text-white/70 leading-relaxed max-w-2xl">
            <span className="text-arterial">{'>'}</span> We are not here to
            build idols. We are here to amplify sound. The underground was
            never about names—it was about energy. Submit your frequency.
            Become part of the signal.
          </p>
        </div>

        {/* Frequency Tuner */}
        <div className="mb-12">
          <FrequencyTuner
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
          />
        </div>

        {/* Signal Feed */}
        <SignalFeed genreFilter={selectedGenre} />

        {/* Signal Upload Form */}
        <SignalUpload />
      </div>
    </div>
  )
}
