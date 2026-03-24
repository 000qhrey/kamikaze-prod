'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  initAudioEngine,
  initSoundCloudWidget,
  toggle,
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

type PlayerMode = 'widget' | 'bar'

export function TerminalAudioPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(getAudioState)
  const [mode, setMode] = useState<PlayerMode>('widget') // widget = floating, bar = attached to footer
  const [isManuallyMinimized, setIsManuallyMinimized] = useState(false)
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [bars, setBars] = useState<number[]>(new Array(16).fill(0.1))
  const [trackTitle, setTrackTitle] = useState('INITIALIZING...')
  const [scApiLoaded, setScApiLoaded] = useState(false)
  const [scReady, setScReady] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(CHANNELS[0].url)
  const [isFading, setIsFading] = useState(false)
  const savedVolumeRef = useRef(70) // Store volume during fade
  const animationRef = useRef<number>(0)

  // Scroll detection - switch to bar mode when near footer
  useEffect(() => {
    const handleScroll = () => {
      if (isManuallyMinimized) return // User manually minimized, don't auto-switch

      const scrollBottom = window.scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const footerThreshold = 200 // pixels from bottom to trigger bar mode

      if (docHeight - scrollBottom < footerThreshold) {
        setMode('bar')
      } else {
        setMode('widget')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isManuallyMinimized])

  // Load SoundCloud Widget API script
  useEffect(() => {
    // Check if already loaded
    if (window.SC?.Widget) {
      setScApiLoaded(true)
      initAudioEngine()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    script.onload = () => {
      setScApiLoaded(true)
      initAudioEngine()
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize widget when API is loaded and iframe exists
  useEffect(() => {
    if (!scApiLoaded || !iframeRef.current || !window.SC?.Widget) return

    const SC = window.SC

    // Small delay to let iframe load
    const initWidget = setTimeout(() => {
      if (!iframeRef.current || !SC?.Widget) return

      const widget = SC.Widget(iframeRef.current)
      widgetRef.current = widget

      widget.bind(SC.Widget.Events.READY, () => {
        setScReady(true)
        setTrackTitle('READY // PRESS PLAY')
        initSoundCloudWidget(iframeRef.current!)

        // Set initial volume
        widget.setVolume(70)

        // If we're coming back from a fade, restore volume and play
        if (isFading) {
          let vol = 0
          const fadeIn = setInterval(() => {
            vol += 10
            widget.setVolume(vol)
            if (vol >= savedVolumeRef.current) {
              clearInterval(fadeIn)
              setIsFading(false)
              widget.play()
            }
          }, 50)
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
  }, [scApiLoaded, currentUrl, isFading])

  // Subscribe to audio state changes
  useEffect(() => {
    const unsubscribe = onAudioChange(() => {
      setState(getAudioState())
    })
    return () => { unsubscribe() }
  }, [])

  // Animate frequency bars
  useEffect(() => {
    const updateBars = () => {
      const freqData = getFrequencyData()
      const newBars: number[] = []

      // Sample 16 frequency bands
      const bandSize = Math.floor(freqData.length / 16)
      for (let i = 0; i < 16; i++) {
        let sum = 0
        for (let j = 0; j < bandSize; j++) {
          sum += freqData[i * bandSize + j]
        }
        newBars.push(sum / bandSize / 255)
      }

      setBars(newBars)
      animationRef.current = requestAnimationFrame(updateBars)
    }

    updateBars()
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  const handlePlayPause = useCallback(() => {
    toggle()
  }, [])

  // Handle channel switch with fade transition
  const handleChannelSwitch = useCallback((channelId: number) => {
    const widget = widgetRef.current
    setShowChannelSelector(false)

    if (widget && state.isPlaying) {
      // Save current volume and start fading
      savedVolumeRef.current = Math.round(state.volume * 100)
      setIsFading(true)

      // Fade out
      let vol = savedVolumeRef.current
      const fadeOut = setInterval(() => {
        vol -= 10
        widget.setVolume(Math.max(0, vol))
        if (vol <= 0) {
          clearInterval(fadeOut)
          // Now switch the channel
          const newUrl = switchChannel(channelId)
          setCurrentUrl(newUrl)
          setScReady(false) // Widget will reinitialize
          setTrackTitle('SWITCHING...')
          // Clear switching state after glitch effect
          setTimeout(() => clearSwitching(), 300)
        }
      }, 30)
    } else {
      // Not playing, just switch immediately
      const newUrl = switchChannel(channelId)
      setCurrentUrl(newUrl)
      setScReady(false)
      setTrackTitle('LOADING...')
      setTimeout(() => clearSwitching(), 300)
    }
  }, [state.isPlaying, state.volume])

  // Get current channel info
  const channel = getCurrentChannel()

  // SoundCloud embed URL (hidden)
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentUrl)}&color=%23CC0000&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`

  // Handle manual minimize toggle
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
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="hidden"
        allow="autoplay"
        title="Audio Stream"
      />

      {/* === WIDGET MODE: Floating panel in corner === */}
      <AnimatePresence mode="wait">
        {mode === 'widget' && (
          <motion.div
            key="widget"
            ref={playerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-4 left-4 z-50 w-72 border border-arterial/30 bg-void/95 font-mono"
            style={{ fontSize: '10px' }}
          >
          {/* Terminal header */}
          <div
            className="flex items-center justify-between px-2 py-1 border-b border-arterial/20 cursor-pointer select-none"
            onClick={handleMinimize}
          >
            <div className="flex items-center gap-1.5">
              <span className={clsx('text-[8px]', state.isPlaying ? 'text-arterial animate-pulse' : 'text-grey-dark')}>
                {state.isPlaying ? '[LIVE]' : '[IDLE]'}
              </span>
              <span className="text-grey-mid">SIGNAL_TAP</span>
            </div>
            <span className="text-grey-dark hover:text-arterial">[-]</span>
          </div>

          {/* Frequency visualizer */}
          <div className="flex items-end justify-between h-8 px-2 py-1 gap-px bg-black/50">
            {bars.map((height, i) => (
              <div
                key={i}
                className={clsx(
                  'w-full transition-all duration-75',
                  state.isPlaying ? 'bg-arterial' : 'bg-grey-dark/50'
                )}
                style={{
                  height: `${Math.max(8, height * 100)}%`,
                  opacity: state.isPlaying ? 0.4 + height * 0.6 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Track info */}
          <div className="px-2 py-1.5">
            <div className={clsx(
              'truncate tracking-wider',
              scReady ? 'text-white/90' : 'text-grey-mid animate-pulse'
            )}>
              {!scApiLoaded ? 'LOADING_API...' : !scReady ? 'CONNECTING...' : trackTitle}
            </div>
            <div className="flex items-center gap-2 text-grey-dark truncate">
              <span style={{ color: channel.color }}>[{channel.code}]</span>
              <span>{channel.name}</span>
              <span className="text-arterial">{state.spm} SPM</span>
            </div>
          </div>

          {/* Controls section */}
          <div className="px-2 py-2 border-t border-arterial/10 mt-1">
            {/* Transport controls */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <button onClick={prevTrack} className="text-grey-mid hover:text-arterial transition-colors">|&lt;</button>
              <button
                onClick={handlePlayPause}
                className={clsx(
                  'px-3 py-1 border transition-colors',
                  state.isPlaying
                    ? 'border-arterial text-arterial hover:bg-arterial/10'
                    : 'border-grey-mid text-grey-mid hover:border-arterial hover:text-arterial'
                )}
              >
                {state.isPlaying ? 'PAUSE' : 'PLAY_'}
              </button>
              <button onClick={nextTrack} className="text-grey-mid hover:text-arterial transition-colors">&gt;|</button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 text-[8px] mb-2">
              <span className="text-grey-dark">VOL:</span>
              <div className="flex-1 flex gap-px">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVolume((i + 1) / 10)}
                    className={clsx(
                      'flex-1 h-2 transition-colors',
                      i < state.volume * 10 ? 'bg-arterial/70 hover:bg-arterial' : 'bg-grey-dark/30 hover:bg-grey-dark/50'
                    )}
                  />
                ))}
              </div>
              <span className="text-grey-mid w-6 text-right">{Math.round(state.volume * 100)}%</span>
            </div>

            {/* Channel selector button */}
            <div className="flex items-center gap-2 text-[8px]">
              <span className="text-grey-dark">FREQ:</span>
              <button
                onClick={() => setShowChannelSelector(true)}
                className="flex-1 px-2 py-1 border border-arterial/30 hover:bg-arterial/10 hover:border-arterial transition-colors text-left"
              >
                <span style={{ color: channel.color }}>[{channel.code}]</span>
                <span className="text-grey-mid ml-1">{channel.name}</span>
                <span className="text-arterial/50 ml-2">{'// SWITCH'}</span>
              </button>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* === BAR MODE: Full-width bar above footer === */}
      <AnimatePresence mode="wait">
        {mode === 'bar' && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 h-10 border-t border-arterial/40 bg-void/98 backdrop-blur-sm font-mono"
            style={{ fontSize: '10px' }}
          >
          <div className="h-full flex items-center px-4 gap-4">
            {/* Expand button */}
            <button
              onClick={handleExpand}
              className="text-grey-mid hover:text-arterial transition-colors shrink-0"
            >
              [+]
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className={clsx(
                'shrink-0 px-2 py-0.5 border transition-colors',
                state.isPlaying
                  ? 'border-arterial text-arterial'
                  : 'border-grey-dark text-grey-mid hover:border-arterial hover:text-arterial'
              )}
            >
              {state.isPlaying ? '||' : '▶'}
            </button>

            {/* Signal bars */}
            <div className="flex-1 flex items-center h-6 gap-px overflow-hidden">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className={clsx('flex-1 transition-all duration-75', state.isPlaying ? 'bg-arterial' : 'bg-grey-dark/30')}
                  style={{ height: `${Math.max(15, height * 100)}%`, opacity: state.isPlaying ? 0.5 + height * 0.5 : 0.2 }}
                />
              ))}
            </div>

            {/* Track info */}
            <div className="shrink-0 text-right max-w-[200px] truncate hidden sm:block">
              <span className="text-grey-mid">{trackTitle.slice(0, 25)}</span>
            </div>

            {/* Channel indicator */}
            <button
              onClick={() => setShowChannelSelector(true)}
              className="shrink-0 flex items-center gap-1 hover:text-arterial transition-colors"
            >
              <span className="w-2 h-4 inline-block" style={{ backgroundColor: channel.color }} />
              <span className="text-grey-dark">[{channel.code}]</span>
            </button>

            {/* SPM */}
            <span className="shrink-0 text-arterial">{state.spm} SPM</span>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Channel Selector Popup - centered on screen */}
      {showChannelSelector && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowChannelSelector(false)}
          />

          {/* Selector panel */}
          <div
            className="relative bg-void border border-arterial/50 p-4 w-full max-w-[320px] max-h-[80vh] overflow-y-auto"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-arterial/30">
              <span className="text-arterial tracking-wider text-sm">SIGNAL_ACQUISITION</span>
              <button
                onClick={() => setShowChannelSelector(false)}
                className="text-grey-mid hover:text-arterial transition-colors text-lg"
              >
                [X]
              </button>
            </div>

            {/* Channel list */}
            <div className="space-y-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSwitch(ch.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-2 border transition-all text-left',
                    state.currentChannel === ch.id
                      ? 'border-arterial bg-arterial/10'
                      : 'border-grey-dark/50 hover:border-arterial/50 hover:bg-arterial/5'
                  )}
                >
                  <div className="w-2 h-8 transition-colors" style={{ backgroundColor: ch.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-grey-mid text-[10px]">[{ch.code}]</span>
                      <span className="text-white tracking-wider text-sm">{ch.name}</span>
                    </div>
                    <div className="text-grey-dark text-[10px]">{ch.spm} SPM</div>
                  </div>
                  {state.currentChannel === ch.id && (
                    <span className="text-arterial text-[10px] animate-pulse">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-arterial/20 text-[8px] text-grey-dark">
              SELECT FREQUENCY TO TAP INTO SIGNAL
            </div>
          </div>
        </div>
      )}
    </>
  )
}
