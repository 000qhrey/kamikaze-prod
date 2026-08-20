'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Event, formatEventDate } from '@/data/events'
import { Artist, getArtistBySlug } from '@/data/artists'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { EVENTS } from '@/data/siteCopy'
import {
  playChannelSwitch,
  playPowerOffSound,
  playSubmitSound,
} from '@/hooks/useSonicFeedback'
import { CrtSigil } from '@/components/events/CrtSigil'
import { getAssetPath } from '@/lib/basePath'
import clsx from 'clsx'

type BootPhase = 'off' | 'static' | 'sync' | 'lock' | 'live'

interface OverrideCrtModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

function resolveChannels(event: Event): Artist[] {
  const slugs = event.lineupArtistSlugs ?? []
  return slugs
    .map((slug) => getArtistBySlug(slug))
    .filter((a): a is Artist => Boolean(a))
}

function channelLabel(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function OverrideCrtModal({ event, isOpen, onClose }: OverrideCrtModalProps) {
  const channels = useMemo(() => resolveChannels(event), [event])
  const [boot, setBoot] = useState<BootPhase>('off')
  const [channelIndex, setChannelIndex] = useState(0)
  const [tuning, setTuning] = useState(false)
  const [utcClock, setUtcClock] = useState('')
  const tuneSwapRef = useRef<number | null>(null)
  const tuneEndRef = useRef<number | null>(null)

  const active = channels[channelIndex] ?? null
  const ready = boot === 'live'

  const clearTuneTimer = useCallback(() => {
    if (tuneSwapRef.current) {
      window.clearTimeout(tuneSwapRef.current)
      tuneSwapRef.current = null
    }
    if (tuneEndRef.current) {
      window.clearTimeout(tuneEndRef.current)
      tuneEndRef.current = null
    }
  }, [])

  const runTune = useCallback(
    (nextIndex: number) => {
      if (channels.length === 0 || tuning) return
      setTuning(true)
      playChannelSwitch()
      clearTuneTimer()
      // Swap mid-static so the new channel appears as noise clears
      tuneSwapRef.current = window.setTimeout(() => {
        setChannelIndex(nextIndex)
        tuneSwapRef.current = null
      }, 120)
      tuneEndRef.current = window.setTimeout(() => {
        setTuning(false)
        tuneEndRef.current = null
      }, 280)
    },
    [channels.length, tuning, clearTuneTimer]
  )

  const changeChannel = useCallback(
    (delta: number) => {
      if (channels.length === 0 || tuning) return
      const next = (channelIndex + delta + channels.length) % channels.length
      runTune(next)
    },
    [channels.length, tuning, channelIndex, runTune]
  )

  const selectChannel = useCallback(
    (index: number) => {
      if (tuning || index === channelIndex) return
      runTune(index)
    },
    [channelIndex, tuning, runTune]
  )

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('k-crt-focus')

    const onKey = (e: KeyboardEvent) => {
      // TV mode: only POWER / [CLOSE] dismiss — Escape does not exit
      if (boot !== 'live' || channels.length === 0) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        changeChannel(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        changeChannel(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('k-crt-focus')
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, boot, channels.length, changeChannel])

  useEffect(() => {
    if (!isOpen) {
      setBoot('off')
      setChannelIndex(0)
      setTuning(false)
      clearTuneTimer()
      return
    }
    setBoot('static')
    const t1 = window.setTimeout(() => setBoot('sync'), 280)
    const t2 = window.setTimeout(() => setBoot('lock'), 520)
    const t3 = window.setTimeout(() => {
      setBoot('live')
      playSubmitSound()
    }, 800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      clearTuneTimer()
    }
  }, [isOpen, clearTuneTimer])

  useEffect(() => {
    if (!isOpen || !ready) return
    const tick = () => {
      const d = new Date()
      const dd = String(d.getUTCDate()).padStart(2, '0')
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const yyyy = d.getUTCFullYear()
      setUtcClock(`${mm}.${dd}.${yyyy}  ${d.toISOString().slice(11, 19)} UTC`)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [isOpen, ready])

  if (!isOpen) return null

  const dateLabel = formatEventDate(event.date)
  const locationLabel = event.isSecretLocation
    ? 'LOCATION TBA'
    : `${event.city.toUpperCase()}, INDIA`

  return (
    <div
      className="fixed inset-0 z-[220] flex items-stretch justify-center p-1.5 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${event.name} transmission`}
    >
      <style jsx global>{`
        /* TV on — site chrome drops out of focus with the room */
        body.k-crt-focus .k-site-topbar,
        body.k-crt-focus .k-site-menu-overlay,
        body.k-crt-focus .k-audio-bar,
        body.k-crt-focus .k-audio-panel,
        body.k-crt-focus .k-audio-sheet,
        body.k-crt-focus footer {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>
      {/* Room behind the set — solid enough that footer/ticker can't bleed through */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.94) 50%, rgba(0,0,0,0.98) 100%)',
          backdropFilter: 'blur(18px) saturate(0.55)',
          WebkitBackdropFilter: 'blur(18px) saturate(0.55)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.45) 3px)',
        }}
      />

      <div
        className={clsx(
          'relative z-10 w-full max-w-[1500px]',
          'h-full max-h-[100dvh] md:max-h-[min(96vh,920px)]',
          'flex flex-col min-h-0 overflow-hidden animate-[crt-pop_0.4s_ease-out]'
        )}
        style={{
          filter: 'drop-shadow(0 0 40px rgba(204,0,0,0.12)) drop-shadow(0 24px 80px rgba(0,0,0,0.85))',
        }}
      >
        <div
          className="relative flex flex-col flex-1 min-h-0 rounded-lg sm:rounded-2xl p-1.5 sm:p-3"
          style={{
            background:
              'linear-gradient(165deg, #222 0%, #121212 40%, #0a0a0a 75%, #161616 100%)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(204,0,0,0.08), 0 32px 100px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top plate */}
          <div className="flex items-center justify-between gap-2 px-0.5 sm:px-1 mb-1.5 sm:mb-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <CrtSigil className="shrink-0 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center" />
              <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.35em] text-white/40 uppercase truncate">
                KZ CRT v2.0
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[10px] text-white/45 hover:text-arterial transition-colors tracking-widest shrink-0 py-1"
            >
              [CLOSE]
            </button>
          </div>

          {/* Stage scrolls; CH− / TUNE / CH+ stay pinned below */}
          <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col md:flex-row gap-2 sm:gap-3">
            {/* Glass — compact hero on mobile, dominant on desktop */}
            <div
              className="relative shrink-0 md:flex-1 h-[38vh] max-h-[300px] md:h-auto md:max-h-none md:min-h-0 overflow-hidden rounded-md sm:rounded-lg bg-black"
              style={{
                boxShadow:
                  'inset 0 0 80px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(204,0,0,0.22)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 z-30"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-[0.12] mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.55) 2px, transparent 3px)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-[0.05]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Channel tune static — glass panel only, not the rail */}
              {ready && tuning && (
                <div
                  className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
                  aria-hidden
                >
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ animation: 'crt-static 0.06s steps(2) infinite' }}
                  />
                  <div
                    className="absolute inset-0 opacity-90 mix-blend-screen"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E\")",
                      animation: 'crt-noise-shift 0.05s steps(3) infinite',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] sm:text-xs tracking-[0.5em] text-white/70">
                      TUNING…
                    </span>
                  </div>
                </div>
              )}

              {(boot === 'static' || boot === 'sync') && (
                <div
                  className="absolute inset-0 z-40 bg-black"
                  style={{ animation: 'crt-static 0.08s steps(2) infinite' }}
                >
                  <div
                    className="absolute inset-0 opacity-70"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E\")",
                    }}
                  />
                  {boot === 'sync' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-signal text-xs tracking-[0.45em] animate-pulse">
                        SYNCING…
                      </span>
                    </div>
                  )}
                </div>
              )}

              {boot === 'lock' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
                  <span className="font-mono text-arterial text-sm tracking-[0.5em] animate-pulse">
                    SIGNAL LOCK
                  </span>
                </div>
              )}

              {ready && (
                <div className="absolute inset-0 z-[5] flex flex-col">
                  <div className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-6 py-2 border-b border-arterial/25 bg-black/55">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arterial opacity-55" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-arterial" />
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] text-arterial uppercase">
                        Live signal
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-white/40 tracking-wider hidden md:block">
                      {utcClock}
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] text-signal tracking-[0.3em] shrink-0">
                      CH {channelLabel(channelIndex)}
                    </span>
                  </div>

                  <div className="relative flex-1 min-h-0">
                    {active && (
                      <Image
                        key={active.id}
                        src={getAssetPath(active.photo)}
                        alt={active.name}
                        fill
                        className="object-cover opacity-[0.78]"
                        style={{
                          objectPosition: active.crtFocus ?? 'center 18%',
                        }}
                        sizes="(max-width: 1500px) 70vw, 1000px"
                        priority
                      />
                    )}
                    {/* Readability scrim — keep faces visible up-right, copy readable bottom-left */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: [
                          'linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.28) 100%)',
                          'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0.12) 55%, transparent 72%)',
                        ].join(', '),
                      }}
                    />

                    {/* Pinned channel artist — copy sits in the scrim well */}
                    <div className="relative z-10 h-full flex flex-col justify-end px-4 py-3.5 sm:p-6 md:p-10 lg:p-12">
                      <div className="max-w-lg space-y-2 sm:space-y-3.5 md:space-y-4 min-w-0">
                        <p className="hidden sm:block font-mono text-[9px] sm:text-[10px] tracking-[0.45em] text-white/40 uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                          Current signal
                        </p>
                        <h2 className="font-display text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-[0.9] drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
                          {active?.name ?? event.name}
                        </h2>
                        <p className="font-mono text-[9px] sm:text-xs tracking-[0.3em] text-arterial uppercase drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
                          Peak pressure // one room
                        </p>
                        <p className="hidden md:block font-mono text-sm text-white/70 max-w-md leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)]">
                          {event.description ?? 'Peak pressure transmission.'}
                        </p>
                        {/* Stack on phone so DATE isn't clipped by the glass edge */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1 gap-x-5 font-mono text-[10px] sm:text-xs text-white/65 leading-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                          <span className="whitespace-nowrap">
                            <span className="text-white/40">DATE </span>
                            {dateLabel}
                          </span>
                          <span className="hidden sm:inline whitespace-nowrap">
                            <span className="text-white/40">TIME </span>
                            23:59 — LATE
                          </span>
                          <span className="whitespace-nowrap">
                            <span className="text-white/40">LOC </span>
                            <span className="text-arterial">{locationLabel}</span>
                          </span>
                        </div>
                        <div
                          className="pt-1.5 sm:pt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative inline-block">
                            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-l border-t border-arterial" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-r border-t border-arterial" />
                            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-l border-b border-arterial" />
                            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-r border-b border-arterial" />
                            {event.ticketUrl ? (
                              <TerminalButton
                                className="!px-3 !py-1.5 sm:!px-5 sm:!py-2.5 text-[10px] sm:text-sm"
                                onClick={() => {
                                  window.open(
                                    event.ticketUrl,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }}
                              >
                                BOOK TICKETS
                              </TerminalButton>
                            ) : (
                              <>
                                <TerminalButton
                                  disabled
                                  className="!px-3 !py-1.5 sm:!px-5 sm:!py-2.5 text-[10px] sm:text-sm"
                                >
                                  BOOK TICKETS
                                </TerminalButton>
                                <p className="hidden sm:block mt-2 font-mono text-[9px] text-white/40 tracking-wide">
                                  {EVENTS.bookSoonHint}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rail: channels + dossier — primary surface on mobile */}
            {ready && active && (
              <aside
                className={clsx(
                  'flex flex-col flex-none min-h-0',
                  'md:w-[min(340px,36%)] md:self-stretch',
                  'border border-white/10 bg-black/85 rounded-md sm:rounded-lg overflow-hidden'
                )}
              >
                {/* Channel tuner */}
                <div className="shrink-0 border-b border-white/10 px-2.5 py-2 sm:px-3 sm:py-3">
                  <p className="font-mono text-[8px] tracking-[0.35em] text-white/35 uppercase mb-1.5 sm:mb-2.5">
                    Channels
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {channels.map((artist, i) => {
                      const selected = i === channelIndex
                      const status = artist.isOpenCall ? 'CALL' : 'LIVE'
                      const shortName = artist.isOpenCall
                        ? 'OPEN'
                        : artist.name === 'COMPETITION WINNER'
                          ? 'OPEN'
                          : artist.name
                      return (
                        <button
                          key={artist.id}
                          type="button"
                          onClick={() => selectChannel(i)}
                          className={clsx(
                            'relative min-w-0 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-arterial',
                            'rounded-sm overflow-hidden border transition-all',
                            selected
                              ? 'border-arterial z-[1] shadow-[0_0_12px_rgba(204,0,0,0.35)]'
                              : 'border-white/12 opacity-55 active:opacity-100 hover:opacity-100 hover:border-white/35'
                          )}
                        >
                          {/* Mobile: short strip; desktop: square */}
                          <div className="relative h-12 sm:h-auto sm:aspect-square">
                            <Image
                              src={getAssetPath(artist.photo)}
                              alt=""
                              fill
                              className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-[filter]"
                              style={{
                                objectPosition: artist.crtFocus ?? 'center 18%',
                              }}
                              sizes="120px"
                            />
                            {selected && (
                              <div className="absolute inset-0 ring-1 ring-inset ring-arterial/80 pointer-events-none" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent sm:hidden" />
                            <div className="absolute bottom-0.5 left-1 right-1 sm:hidden">
                              <p
                                className={clsx(
                                  'font-mono text-[8px] tracking-wider leading-none',
                                  selected ? 'text-arterial' : 'text-white/70'
                                )}
                              >
                                {channelLabel(i)}
                                {selected ? `·${status[0]}` : ''}
                              </p>
                              <p
                                className={clsx(
                                  'font-mono text-[9px] truncate leading-tight',
                                  selected ? 'text-white' : 'text-white/60'
                                )}
                              >
                                {shortName}
                              </p>
                            </div>
                          </div>
                          <div
                            className={clsx(
                              'hidden sm:block px-1.5 py-1.5',
                              selected ? 'bg-arterial/15' : 'bg-black/85'
                            )}
                          >
                            <p
                              className={clsx(
                                'font-mono text-[8px] tracking-wider',
                                selected ? 'text-arterial' : 'text-white/40'
                              )}
                            >
                              {channelLabel(i)}
                              {selected ? ` · ${status}` : ''}
                            </p>
                            <p
                              className={clsx(
                                'font-mono text-[10px] truncate mt-0.5',
                                selected ? 'text-white' : 'text-white/55'
                              )}
                            >
                              {shortName}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <ArtistDossier artist={active} channel={channelLabel(channelIndex)} />
              </aside>
            )}
          </div>

          {/* Control footer — always visible under the scroll stage */}
          {ready && (
            <div className="relative mt-1.5 sm:mt-2 shrink-0 flex items-center justify-center gap-1 px-1 pt-2 pb-1.5 border-t border-white/10 bg-[#121212]">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <CrtKnob
                  label="CH−"
                  onClick={() => changeChannel(-1)}
                  active={tuning}
                />
                <div className="flex flex-col items-center min-w-[6.5rem] sm:min-w-[9rem]">
                  <span
                    className={clsx(
                      'font-mono text-[9px] sm:text-[10px] tracking-[0.35em]',
                      tuning ? 'text-arterial animate-pulse' : 'text-signal/70'
                    )}
                  >
                    {tuning ? 'TUNING…' : '← TUNE →'}
                  </span>
                  <span className="font-mono text-[7px] sm:text-[8px] text-white/30 tracking-[0.2em] mt-0.5">
                    {channels.length} CHANNELS
                  </span>
                </div>
                <CrtKnob
                  label="CH+"
                  onClick={() => changeChannel(1)}
                  active={tuning}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  playPowerOffSound()
                  onClose()
                }}
                className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 group flex items-center gap-1.5 sm:gap-2"
                aria-label="Power off"
              >
                <span className="hidden sm:inline font-mono text-[9px] tracking-[0.3em] text-white/35 group-hover:text-white/60">
                  POWER
                </span>
                <span className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#333] bg-gradient-to-b from-[#2a2a2a] to-[#111] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover:border-arterial/60 transition-colors">
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 rounded-full bg-arterial shadow-[0_0_6px_#cc0000]" />
                  <span className="font-mono text-[8px] text-white/40">⏻</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes crt-pop {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes crt-static {
          0% {
            filter: contrast(1.2) brightness(0.9);
          }
          100% {
            filter: contrast(1.4) brightness(1.1);
          }
        }
        @keyframes crt-noise-shift {
          0% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-2%, 1%);
          }
          66% {
            transform: translate(1%, -2%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  )
}

function ArtistDossier({ artist, channel }: { artist: Artist; channel: string }) {
  const blurb = artist.blurb ?? artist.bio.split('\n')[0]
  const isOpenCall = Boolean(artist.isOpenCall)
  // Next <Link> already prefixes basePath — do not use getAssetPath here
  const profileHref = `/artists/${artist.slug}`
  const ctaHref = artist.ctaHref ?? profileHref
  const ctaLabel = artist.ctaLabel ?? (isOpenCall ? 'SEND YOUR MIX →' : 'VIEW FULL PROFILE →')

  return (
    <div className="flex flex-col flex-none md:flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto gap-3 sm:gap-4">
      <div className="space-y-3 sm:space-y-4 shrink-0">
        <div>
          <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.35em] text-signal mb-1">
            CH {channel} · {isOpenCall ? 'OPEN CALL' : 'LIVE'}
          </p>
          <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white tracking-wide leading-none">
            {artist.name}
          </h3>
          <p className="font-mono text-[9px] sm:text-[10px] text-arterial/90 mt-1.5 tracking-wide leading-snug">
            {artist.tagline}
          </p>
        </div>

        <div>
          <p className="font-mono text-[8px] tracking-[0.35em] text-white/35 uppercase mb-1.5">
            {isOpenCall ? 'Brief' : 'Biography'}
          </p>
          <p className="font-mono text-[10px] sm:text-[11px] text-white/65 leading-relaxed line-clamp-3 sm:line-clamp-4">
            {isOpenCall
              ? 'Do you have what it takes to open our night? Send your mix — you might open OVERRIDE.'
              : blurb}
          </p>
        </div>

        <div className="font-mono text-[9px] sm:text-[10px] grid grid-cols-2 md:grid-cols-1 gap-x-3 gap-y-2 border-y border-white/10 py-2.5 md:border-0 md:py-0 md:space-y-0">
          <MetaCell label="Origin" value={artist.origin ?? artist.location} />
          <MetaCell label="Genre" value={artist.genre ?? '—'} />
        </div>
      </div>

      {/* Secondary actions — tickets own the primary CTA on the glass */}
      <div className="shrink-0 flex flex-col gap-2 sm:gap-2.5 mt-0.5 md:mt-auto pt-1">
        {!isOpenCall && (artist.socials.instagram || artist.socials.soundcloud) && (
          <div className="grid grid-cols-2 gap-2">
            {artist.socials.instagram && (
              <a
                href={artist.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] sm:text-[10px] tracking-wider text-center py-2 border border-white/15 text-white/55 active:border-arterial active:text-arterial hover:border-arterial hover:text-arterial transition-colors"
              >
                INSTAGRAM
              </a>
            )}
            {artist.socials.soundcloud && (
              <a
                href={artist.socials.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] sm:text-[10px] tracking-wider text-center py-2 border border-white/15 text-white/55 active:border-signal active:text-signal hover:border-signal hover:text-signal transition-colors"
              >
                SOUNDCLOUD
              </a>
            )}
          </div>
        )}

        <Link
          href={isOpenCall ? ctaHref : profileHref}
          className={clsx(
            'relative block w-full text-center',
            'font-mono text-[10px] sm:text-[11px] tracking-[0.22em] sm:tracking-[0.28em]',
            'py-2 sm:py-2.5 px-3 transition-colors',
            isOpenCall
              ? 'bg-arterial/15 border border-arterial text-arterial active:bg-arterial active:text-void hover:bg-arterial hover:text-void'
              : 'border border-white/25 text-white/70 hover:border-white/50 hover:text-white active:border-arterial active:text-arterial'
          )}
        >
          {ctaLabel}
        </Link>
        {isOpenCall && (
          <Link
            href={profileHref}
            className="font-mono text-[9px] tracking-[0.2em] text-center text-white/40 hover:text-white/70 transition-colors"
          >
            READ THE BRIEF →
          </Link>
        )}
      </div>
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex flex-col gap-0.5 md:flex-row md:justify-between md:gap-3 md:border-b md:border-white/10 md:pb-2">
      <span className="text-white/35 tracking-wider uppercase shrink-0">{label}</span>
      <span className="text-white/70 truncate md:text-right">{value}</span>
    </div>
  )
}

function CrtKnob({
  label,
  onClick,
  compact,
  active,
}: {
  label: string
  onClick: () => void
  compact?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 sm:gap-1 group"
    >
      <span
        className={clsx(
          compact ? 'w-7 h-7' : 'w-8 h-8',
          'rounded-full border',
          'bg-gradient-to-b from-[#333] to-[#151515]',
          'shadow-[inset_0_2px_3px_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.5)]',
          'transition-all active:scale-95',
          active
            ? 'border-arterial shadow-[0_0_10px_rgba(204,0,0,0.45)]'
            : 'border-[#3a3a3a] group-hover:border-arterial/50'
        )}
      />
      <span
        className={clsx(
          'font-mono text-[7px] sm:text-[8px] tracking-wider',
          active ? 'text-arterial' : 'text-white/40 group-hover:text-white/70'
        )}
      >
        {label}
      </span>
    </button>
  )
}
