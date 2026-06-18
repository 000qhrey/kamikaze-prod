'use client'

import { useEffect, useState, useMemo } from 'react'
import { Signal, Genre, getSignals } from '@/data/signals'
import { SignalEntry } from './SignalEntry'
import { ARTISTS } from '@/data/siteCopy'
import clsx from 'clsx'

interface SignalFeedProps {
  genreFilter?: Genre | null
}

export function SignalFeed({ genreFilter }: SignalFeedProps = {}) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading delay for terminal effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSignals(getSignals())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Filter signals by genre
  const filteredSignals = useMemo(() => {
    if (!genreFilter) return signals
    return signals.filter((s) => s.genre === genreFilter)
  }, [signals, genreFilter])

  return (
    <section className="relative">
      {/* Terminal header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/30">
        <span className="font-mono text-xs text-arterial tracking-widest">
          [{ARTISTS.activeList}]
        </span>
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-mono text-xs text-white/50">
          {isLoading ? 'LOADING...' : `${filteredSignals.length} ENTRIES`}
          {genreFilter && (
            <span className="ml-2 text-arterial">
              [{genreFilter.replace(/_/g, ' ')}]
            </span>
          )}
        </span>
      </div>

      {/* Terminal window */}
      <div
        className={clsx(
          'relative border border-white/30 bg-black/40',
          'overflow-hidden'
        )}
      >
        {/* Terminal top bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border-b border-white/30">
          <div className="w-2 h-2 rounded-full bg-arterial/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
          <div className="w-2 h-2 rounded-full bg-signal/40" />
          <span className="ml-4 font-mono text-xs text-white/50 tracking-wider">
            {ARTISTS.feedLabel}
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 text-center">
            <div className="font-mono text-sm text-white/70 animate-pulse">
              {'>'} {ARTISTS.loadingConnection}
            </div>
          </div>
        )}

        {/* Signal list */}
        {!isLoading && (
          <div className="divide-y divide-white/20">
            {filteredSignals.length > 0 ? (
              filteredSignals.map((signal, index) => (
                <SignalEntry key={signal.id} signal={signal} index={index} />
              ))
            ) : (
              <div className="py-8 text-center font-mono text-sm text-white/50">
                {ARTISTS.noResults}
              </div>
            )}
          </div>
        )}

        {/* Terminal prompt at bottom */}
        <div className="px-4 py-3 bg-white/5 border-t border-white/20">
          <div className="font-mono text-xs text-white/50">
            <span className="text-signal">{'>'}</span> {ARTISTS.awaiting}
            <span className="animate-pulse">_</span>
          </div>
        </div>

        {/* Scan line overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.1) 2px,
              rgba(255, 255, 255, 0.1) 4px
            )`,
          }}
        />
      </div>

      {/* Status line */}
      <div className="flex items-center justify-between mt-4 font-mono text-xs text-white/50">
        <span>LAST_UPDATE: {new Date().toISOString().split('T')[0]}</span>
        <span>STATUS: RECEIVING</span>
      </div>
    </section>
  )
}
