'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

export function TerminalAudioPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)
  const [state, setState] = useState(getAudioState)
  const [isExpanded, setIsExpanded] = useState(true) // Default maximized
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [bars, setBars] = useState<number[]>(new Array(16).fill(0.1))
  const [trackTitle, setTrackTitle] = useState('LOADING...')
  const [scReady, setScReady] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(CHANNELS[0].url)
  const [isFading, setIsFading] = useState(false)
  const savedVolumeRef = useRef(70) // Store volume during fade
  const animationRef = useRef<number>(0)

  // Load SoundCloud Widget API script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    script.onload = () => {
      initAudioEngine()
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize widget when iframe loads/changes
  useEffect(() => {
    if (!iframeRef.current || !window.SC?.Widget) return

    const SC = window.SC // Capture reference for TypeScript

    // Small delay to let iframe load
    const initWidget = setTimeout(() => {
      if (!iframeRef.current || !SC?.Widget) return

      const widget = SC.Widget(iframeRef.current)
      widgetRef.current = widget

      widget.bind(SC.Widget.Events.READY, () => {
        setScReady(true)
        initSoundCloudWidget(iframeRef.current!)

        // If we're coming back from a fade, restore volume and play
        if (isFading) {
          // Fade in
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
    }, 100)

    return () => clearTimeout(initWidget)
  }, [currentUrl, isFading])

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

  return (
    <div
      className={clsx(
        'fixed bottom-4 left-4 z-50',
        'font-mono text-[10px]',
        'border border-arterial/30 bg-void/95',
        'transition-all duration-300',
        isExpanded ? 'w-72' : 'w-44'
      )}
    >
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="hidden"
        allow="autoplay"
        title="Audio Stream"
      />

      {/* Terminal header */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b border-arterial/20 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-[8px]', state.isPlaying ? 'text-arterial animate-pulse' : 'text-grey-dark')}>
            {state.isPlaying ? '[LIVE]' : '[IDLE]'}
          </span>
          <span className="text-grey-mid">AUDIO_TAP</span>
        </div>
        <span className="text-grey-dark">{isExpanded ? '[-]' : '[+]'}</span>
      </div>

      {/* Frequency visualizer - 8-bit blocky style */}
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
        <div className="text-white/90 truncate tracking-wider">
          {scReady ? trackTitle : 'CONNECTING...'}
        </div>
        <div className="flex items-center gap-2 text-grey-dark truncate">
          <span style={{ color: channel.color }}>[{channel.code}]</span>
          <span>{channel.name}</span>
          <span className="text-arterial">{state.spm} SPM</span>
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="px-2 py-2 border-t border-arterial/10 mt-1">
          {/* Transport controls */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={prevTrack}
              className="text-grey-mid hover:text-arterial transition-colors"
              title="Previous"
            >
              |&lt;
            </button>
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
            <button
              onClick={nextTrack}
              className="text-grey-mid hover:text-arterial transition-colors"
              title="Next"
            >
              &gt;|
            </button>
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
                    i < state.volume * 10
                      ? 'bg-arterial/70 hover:bg-arterial'
                      : 'bg-grey-dark/30 hover:bg-grey-dark/50'
                  )}
                />
              ))}
            </div>
            <span className="text-grey-mid w-6 text-right">
              {Math.round(state.volume * 100)}%
            </span>
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
              <span className="text-arterial/50 ml-2">// SWITCH</span>
            </button>
          </div>
        </div>
      )}

      {/* Channel Selector Popup */}
      {showChannelSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowChannelSelector(false)}
          />

          {/* Selector panel */}
          <div
            className="relative bg-void border border-arterial/50 p-4 min-w-[300px]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-arterial/30">
              <span className="text-arterial tracking-wider text-sm">SIGNAL_ACQUISITION</span>
              <button
                onClick={() => setShowChannelSelector(false)}
                className="text-grey-mid hover:text-arterial transition-colors"
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
                  {/* Channel indicator */}
                  <div
                    className="w-2 h-8 transition-colors"
                    style={{ backgroundColor: ch.color }}
                  />

                  {/* Channel info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-grey-mid text-[10px]">[{ch.code}]</span>
                      <span className="text-white tracking-wider text-sm">{ch.name}</span>
                    </div>
                    <div className="text-grey-dark text-[10px]">
                      {ch.spm} SPM
                    </div>
                  </div>

                  {/* Active indicator */}
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

      {/* Collapsed mini controls */}
      {!isExpanded && (
        <div className="flex items-center justify-center gap-2 px-2 py-1.5">
          <button
            onClick={handlePlayPause}
            className="text-arterial hover:text-white transition-colors"
          >
            {state.isPlaying ? '[||]' : '[>]'}
          </button>
          <button
            onClick={nextTrack}
            className="text-grey-mid hover:text-arterial transition-colors text-[8px]"
          >
            SKIP&gt;
          </button>
        </div>
      )}
    </div>
  )
}
