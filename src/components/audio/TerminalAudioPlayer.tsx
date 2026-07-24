'use client'

/**
 * Minimized music bar + expandable widget.
 * SoundCloud API + iframe load only after the user hits play (or switches channel).
 * CSS transitions instead of framer-motion to keep this chunk smaller.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import {
  initAudioEngine,
  initSoundCloudWidget,
  play,
  pause,
  nextTrack,
  prevTrack,
  setVolume,
  getAudioState,
  getFrequencyData,
  onAudioChange,
  switchChannel,
  getCurrentChannel,
  clearSwitching,
  CHANNELS,
} from '@/hooks/useAudioEngine'
import { AUDIO } from '@/data/siteCopy'
import { useIsMobile } from '@/hooks/useIsMobile'

type PlayerMode = 'widget' | 'bar'

const soundCloudPlayerOptions = {
  color: '#CC0000',
  hide_related: true,
  show_comments: false,
  show_user: false,
  show_reposts: false,
  show_teaser: false,
  visual: false,
}

function playWidgetWithRetries(widget: any) {
  widget.play()

  for (let attempt = 1; attempt <= 4; attempt++) {
    setTimeout(() => widget.play(), attempt * 250)
  }
}

function loadSoundCloudApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.SC?.Widget) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-sc-widget-api]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('SC API')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    script.dataset.scWidgetApi = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('SC API'))
    document.body.appendChild(script)
  })
}

export function TerminalAudioPlayer() {
  const isMobile = useIsMobile()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(getAudioState)
  const [mode, setMode] = useState<PlayerMode>('bar')
  const [isManuallyMinimized, setIsManuallyMinimized] = useState(true)
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [bars, setBars] = useState<number[]>(new Array(16).fill(0.1))
  const [trackTitle, setTrackTitle] = useState('PRESS PLAY')
  const [scApiLoaded, setScApiLoaded] = useState(false)
  const [scReady, setScReady] = useState(false)
  const [embedActive, setEmbedActive] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(CHANNELS[0].url)
  const [isMuted, setIsMuted] = useState(false)
  const savedVolumeRef = useRef(70)
  const resumeAfterLoadRef = useRef(false)
  const pendingPlayRef = useRef(false)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    setMode('bar')
    setIsManuallyMinimized(true)
  }, [isMobile])

  useEffect(() => {
    if (isMobile || isManuallyMinimized) return

    const handleScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const footerThreshold = 200

      if (docHeight - scrollBottom < footerThreshold) {
        setMode('bar')
      } else {
        setMode('widget')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isManuallyMinimized, isMobile])

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      const restore = savedVolumeRef.current / 100
      setVolume(restore > 0 ? restore : 0.7)
      setIsMuted(false)
      return
    }

    savedVolumeRef.current = Math.round(state.volume * 100) || savedVolumeRef.current
    setVolume(0)
    setIsMuted(true)
  }, [isMuted, state.volume])

  const ensureSoundCloud = useCallback(async () => {
    setEmbedActive(true)
    await loadSoundCloudApi()
    setScApiLoaded(true)
  }, [])

  // Bind widget once API + iframe exist
  useEffect(() => {
    if (!embedActive || !scApiLoaded || !iframeRef.current || !window.SC?.Widget) {
      return
    }

    const SC = window.SC
    const initWidget = setTimeout(() => {
      if (!iframeRef.current || !SC?.Widget) return

      const widget = SC.Widget(iframeRef.current)
      widgetRef.current = widget
      initSoundCloudWidget(iframeRef.current)

      widget.bind(SC.Widget.Events.READY, () => {
        setScReady(true)
        setTrackTitle(AUDIO.pressPlay)
        initSoundCloudWidget(iframeRef.current!)

        if (pendingPlayRef.current || resumeAfterLoadRef.current) {
          pendingPlayRef.current = false
          resumeAfterLoadRef.current = false
          widget.setVolume(0)
          let vol = 0
          const fadeIn = setInterval(() => {
            vol += 10
            widget.setVolume(vol)
            if (vol >= savedVolumeRef.current) {
              clearInterval(fadeIn)
              playWidgetWithRetries(widget)
            }
          }, 50)
          play()
        } else {
          widget.setVolume(savedVolumeRef.current)
        }
      })

      widget.bind(SC.Widget.Events.PLAY, () => {
        widget.getCurrentSound((sound: any) => {
          if (sound?.title) {
            setTrackTitle(sound.title.toUpperCase())
          }
        })
      })
    }, 300)

    return () => clearTimeout(initWidget)
  }, [embedActive, scApiLoaded, currentUrl])

  useEffect(() => {
    const unsubscribe = onAudioChange(() => {
      setState(getAudioState())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!state.isPlaying) {
      setBars(new Array(16).fill(0.1))
      return
    }

    let frame = 0
    const stride = isMobile ? 3 : 1

    const updateBars = () => {
      animationRef.current = requestAnimationFrame(updateBars)
      if (document.visibilityState === 'hidden') return
      frame += 1
      if (frame % stride !== 0) return

      const freqData = getFrequencyData()
      const newBars: number[] = []
      const bandSize = Math.floor(freqData.length / 16)
      for (let i = 0; i < 16; i++) {
        let sum = 0
        for (let j = 0; j < bandSize; j++) {
          sum += freqData[i * bandSize + j]
        }
        newBars.push(sum / bandSize / 255)
      }

      setBars(newBars)
    }

    updateBars()
    return () => cancelAnimationFrame(animationRef.current)
  }, [state.isPlaying, isMobile])

  const handlePlayPause = useCallback(async () => {
    initAudioEngine()

    if (state.isPlaying) {
      pause()
      widgetRef.current?.pause?.()
      return
    }

    if (!embedActive) {
      pendingPlayRef.current = true
      setTrackTitle('CONNECTING...')
      try {
        await ensureSoundCloud()
      } catch {
        setTrackTitle('AUDIO UNAVAILABLE')
        pendingPlayRef.current = false
      }
      return
    }

    if (iframeRef.current && window.SC?.Widget) {
      initSoundCloudWidget(iframeRef.current)
      if (!widgetRef.current) {
        widgetRef.current = window.SC.Widget(iframeRef.current)
      }
    }

    play()
    if (widgetRef.current) {
      playWidgetWithRetries(widgetRef.current)
    }
  }, [state.isPlaying, embedActive, ensureSoundCloud])

  const handleChannelSwitch = useCallback(
    async (channelId: number) => {
      if (channelId === state.currentChannel) {
        setShowChannelSelector(false)
        return
      }

      setShowChannelSelector(false)
      const wasPlaying = state.isPlaying
      const newUrl = switchChannel(channelId)

      if (!embedActive) {
        setCurrentUrl(newUrl)
        resumeAfterLoadRef.current = wasPlaying
        pendingPlayRef.current = wasPlaying
        setTrackTitle(wasPlaying ? 'CONNECTING...' : AUDIO.pressPlay)
        try {
          await ensureSoundCloud()
        } catch {
          setTrackTitle('AUDIO UNAVAILABLE')
        }
        setTimeout(() => clearSwitching(), 300)
        return
      }

      const widget = widgetRef.current

      const loadChannel = () => {
        setScReady(false)
        setTrackTitle('SWITCHING...')

        if (!widget) {
          resumeAfterLoadRef.current = wasPlaying
          setCurrentUrl(newUrl)
          return
        }

        resumeAfterLoadRef.current = wasPlaying
        widget.load(newUrl, {
          ...soundCloudPlayerOptions,
          auto_play: wasPlaying,
          callback: () => {
            setScReady(true)
            setTrackTitle(wasPlaying ? 'PLAYING' : AUDIO.pressPlay)
            widget.setVolume(wasPlaying ? 0 : savedVolumeRef.current)

            if (!wasPlaying) return

            let vol = 0
            const fadeIn = setInterval(() => {
              vol += 10
              widget.setVolume(vol)
              if (vol >= savedVolumeRef.current) {
                clearInterval(fadeIn)
                playWidgetWithRetries(widget)
              }
            }, 50)
          },
        })

        if (wasPlaying) {
          setTimeout(() => playWidgetWithRetries(widget), 750)
        }
      }

      if (widget && wasPlaying) {
        savedVolumeRef.current = Math.round(state.volume * 100)

        let vol = savedVolumeRef.current
        const fadeOut = setInterval(() => {
          vol -= 10
          widget.setVolume(Math.max(0, vol))
          if (vol <= 0) {
            clearInterval(fadeOut)
            loadChannel()
          }
        }, 30)
      } else {
        loadChannel()
      }

      setTimeout(() => clearSwitching(), 300)
    },
    [
      state.currentChannel,
      state.isPlaying,
      state.volume,
      embedActive,
      ensureSoundCloud,
    ],
  )

  const channel = getCurrentChannel()
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentUrl)}&color=%23CC0000&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`

  const handleMinimize = () => {
    setIsManuallyMinimized(true)
    setMode('bar')
  }

  const handleExpand = () => {
    setIsManuallyMinimized(false)
    setMode('widget')
  }

  return (
    <>
      {embedActive && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute h-px w-px opacity-0 pointer-events-none"
          allow="autoplay"
          title="Audio Stream"
          loading="lazy"
        />
      )}

      {mode === 'widget' && (
        <div
          ref={playerRef}
          className="k-audio-panel fixed left-4 z-[110] w-72 max-w-[calc(100vw-2rem)] border border-arterial/30 bg-void/95 font-mono"
          style={{
            bottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
            fontSize: '10px',
          }}
        >
          <div
            className="flex items-center justify-between px-2 py-1 border-b border-arterial/20 cursor-pointer select-none"
            onClick={handleMinimize}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  'text-[8px]',
                  state.isPlaying ? 'text-arterial animate-pulse' : 'text-white/50',
                )}
              >
                {state.isPlaying ? '[LIVE]' : '[IDLE]'}
              </span>
              <span className="text-white/70">{AUDIO.playerLabel}</span>
            </div>
            <span className="text-white/50 hover:text-arterial">[-]</span>
          </div>

          <div className="flex items-end justify-between h-8 px-2 py-1 gap-px bg-black/50">
            {bars.map((height, i) => (
              <div
                key={i}
                className={clsx(
                  'w-full transition-all duration-75',
                  state.isPlaying ? 'bg-arterial' : 'bg-white/20/50',
                )}
                style={{
                  height: `${Math.max(8, height * 100)}%`,
                  opacity: state.isPlaying ? 0.4 + height * 0.6 : 0.3,
                }}
              />
            ))}
          </div>

          <div className="px-2 py-1.5">
            <div
              className={clsx(
                'truncate tracking-wider',
                scReady || !embedActive ? 'text-white/90' : 'text-white/70 animate-pulse',
              )}
            >
              {!embedActive
                ? trackTitle
                : !scApiLoaded
                  ? 'LOADING_API...'
                  : !scReady
                    ? 'CONNECTING...'
                    : trackTitle}
            </div>
            <div className="flex items-center gap-2 text-white/50 truncate">
              <span style={{ color: channel.color }}>[{channel.code}]</span>
              <span>{channel.name}</span>
              <span className="text-arterial">{state.spm} SPM</span>
            </div>
          </div>

          <div className="px-2 py-2 border-t border-arterial/10 mt-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <button onClick={prevTrack} className="text-white/70 hover:text-arterial transition-colors">
                |&lt;
              </button>
              <button
                onClick={handlePlayPause}
                className={clsx(
                  'px-3 py-1 border transition-colors',
                  state.isPlaying
                    ? 'border-arterial text-arterial hover:bg-arterial/10'
                    : 'border-white/40 text-white/70 hover:border-arterial hover:text-arterial',
                )}
              >
                {state.isPlaying ? 'PAUSE' : 'PLAY_'}
              </button>
              <button onClick={nextTrack} className="text-white/70 hover:text-arterial transition-colors">
                &gt;|
              </button>
            </div>

            <div className="flex items-center gap-2 text-[8px] mb-2">
              <span className="text-white/50">VOL:</span>
              <div className="flex-1 flex gap-px">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsMuted(false)
                      setVolume((i + 1) / 10)
                      savedVolumeRef.current = (i + 1) * 10
                    }}
                    className={clsx(
                      'flex-1 h-2 transition-colors',
                      i < state.volume * 10
                        ? 'bg-arterial/70 hover:bg-arterial'
                        : 'bg-white/20/30 hover:bg-white/20/50',
                    )}
                  />
                ))}
              </div>
              <span className="text-white/70 w-6 text-right">
                {Math.round(state.volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-[8px]">
              <span className="text-white/50">FREQ:</span>
              <button
                onClick={() => setShowChannelSelector(true)}
                className="flex-1 px-2 py-1 border border-arterial/30 hover:bg-arterial/10 hover:border-arterial transition-colors text-left"
              >
                <span style={{ color: channel.color }}>[{channel.code}]</span>
                <span className="text-white/70 ml-1">{channel.name}</span>
                <span className="text-arterial/50 ml-2">{'// SWITCH'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'bar' && (
        <div
          className="k-audio-bar fixed bottom-0 left-0 right-0 z-[110] h-11 border-t border-arterial/40 bg-void/98 font-mono pb-[env(safe-area-inset-bottom,0px)]"
          style={{ fontSize: '10px' }}
        >
          <div className="h-11 flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
            <button
              onClick={handleExpand}
              className="text-white/70 hover:text-arterial transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Expand music player"
            >
              <span className="text-xs">MUSIC</span>
            </button>

            <button
              onClick={handlePlayPause}
              className={clsx(
                'shrink-0 px-2 py-0.5 border transition-colors',
                state.isPlaying
                  ? 'border-arterial text-arterial'
                  : 'border-white/30 text-white/70 hover:border-arterial hover:text-arterial',
              )}
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? '||' : '▶'}
            </button>

            <button
              onClick={handleMuteToggle}
              className={clsx(
                'shrink-0 px-1.5 py-0.5 border transition-colors text-[9px]',
                isMuted || state.volume === 0
                  ? 'border-arterial/60 text-arterial'
                  : 'border-white/30 text-white/70 hover:border-arterial hover:text-arterial',
              )}
              aria-label={isMuted || state.volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || state.volume === 0 ? 'MUTE' : 'VOL'}
            </button>

            <div className="flex-1 flex items-center h-6 gap-px overflow-hidden min-w-0">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex-1 transition-all duration-75',
                    state.isPlaying ? 'bg-arterial' : 'bg-white/20/30',
                  )}
                  style={{
                    height: `${Math.max(15, height * 100)}%`,
                    opacity: state.isPlaying ? 0.5 + height * 0.5 : 0.2,
                  }}
                />
              ))}
            </div>

            <div className="shrink-0 text-right max-w-[160px] truncate hidden sm:block">
              <span className="text-white/70">{trackTitle.slice(0, 25)}</span>
            </div>

            <button
              onClick={() => setShowChannelSelector(true)}
              className="shrink-0 flex items-center gap-1 hover:text-arterial transition-colors"
              aria-label="Select channel"
            >
              <span
                className="w-2 h-4 inline-block"
                style={{ backgroundColor: channel.color }}
              />
              <span className="text-white/50">[{channel.code}]</span>
            </button>

            <span className="shrink-0 text-arterial hidden sm:inline">
              {state.spm} SPM
            </span>
          </div>
        </div>
      )}

      {showChannelSelector && (
        <div className="k-audio-sheet fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setShowChannelSelector(false)}
          />

          <div
            className="relative bg-void border border-arterial/50 p-4 w-full max-w-[320px] max-h-[80vh] overflow-y-auto"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-arterial/30">
              <span className="text-arterial tracking-wider text-sm">NOW PLAYING</span>
              <button
                onClick={() => setShowChannelSelector(false)}
                className="text-white/70 hover:text-arterial transition-colors text-lg"
              >
                [X]
              </button>
            </div>

            <div className="space-y-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSwitch(ch.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-2 border transition-all text-left',
                    state.currentChannel === ch.id
                      ? 'border-arterial bg-arterial/10'
                      : 'border-white/30/50 hover:border-arterial/50 hover:bg-arterial/5',
                  )}
                >
                  <div
                    className="w-2 h-8 transition-colors"
                    style={{ backgroundColor: ch.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-[10px]">[{ch.code}]</span>
                      <span className="text-white tracking-wider text-sm">{ch.name}</span>
                    </div>
                    <div className="text-white/50 text-[10px]">{ch.spm} SPM</div>
                  </div>
                  {state.currentChannel === ch.id && (
                    <span className="text-arterial text-[10px] animate-pulse">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-2 border-t border-arterial/20 text-[8px] text-white/50">
              {AUDIO.selectChannel}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TerminalAudioPlayer
