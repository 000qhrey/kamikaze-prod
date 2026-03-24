'use client'

// Audio Engine - Hybrid approach with Channel/Genre switching
// "Signals Per Minute" not BPM - this is a hacked terminal, not a music app

interface AudioEngineState {
  mode: 'local' | 'soundcloud' | 'idle'
  isInitialized: boolean
  isPlaying: boolean
  currentChannel: number
  volume: number
  spm: number // Signals Per Minute
  isSwitching: boolean
  audioContext: AudioContext | null
  analyzer: AnalyserNode | null
  frequencyData: Uint8Array<ArrayBuffer>
}

// Shared playlist URL (replace individual channels later)
const SHARED_PLAYLIST = 'https://soundcloud.com/neeraj-hari-839626007/sets/4-akedo-final'

// Channel definitions - each is a SoundCloud playlist
export const CHANNELS = [
  {
    id: 0,
    name: 'HARDGROOVE',
    code: '01',
    spm: 140,
    url: SHARED_PLAYLIST,
    color: '#cc0000',
  },
  {
    id: 1,
    name: 'INDUSTRIAL_BOUNCE',
    code: '02',
    spm: 145,
    url: SHARED_PLAYLIST,
    color: '#ff4400',
  },
  {
    id: 2,
    name: 'PUNK_TECHNO',
    code: '03',
    spm: 150,
    url: SHARED_PLAYLIST,
    color: '#00ccff',
  },
  {
    id: 3,
    name: 'RAW_SIGNAL',
    code: '04',
    spm: 160,
    url: SHARED_PLAYLIST,
    color: '#ff00ff',
  },
]

// Global state
const state: AudioEngineState = {
  mode: 'idle',
  isInitialized: false,
  isPlaying: false,
  currentChannel: 0,
  volume: 0.7,
  spm: CHANNELS[0].spm,
  isSwitching: false,
  audioContext: null,
  analyzer: null,
  frequencyData: new Uint8Array(128) as Uint8Array<ArrayBuffer>,
}

// Pending play flag - set when play() is called before widget is ready
let pendingPlay = false

const listeners: Set<() => void> = new Set()
let beatPhase = 0
let lastBeatTime = 0
let scWidget: any = null

// ============================================
// INITIALIZATION
// ============================================

export function initAudioEngine(): boolean {
  if (state.isInitialized) return true
  if (typeof window === 'undefined') return false

  state.mode = 'soundcloud'
  state.isInitialized = true
  notifyListeners()

  return true
}

export function initSoundCloudWidget(iframe: HTMLIFrameElement) {
  if (!iframe || !window.SC?.Widget) return

  scWidget = window.SC.Widget(iframe)

  scWidget.bind(window.SC.Widget.Events.READY, () => {
    state.isInitialized = true
    state.isSwitching = false
    notifyListeners()

    // If play was requested before widget was ready, play now
    if (pendingPlay) {
      pendingPlay = false
      scWidget.play()
    }
  })

  scWidget.bind(window.SC.Widget.Events.PLAY, () => {
    state.isPlaying = true
    lastBeatTime = performance.now()
    notifyListeners()
  })

  scWidget.bind(window.SC.Widget.Events.PAUSE, () => {
    state.isPlaying = false
    notifyListeners()
  })

  scWidget.bind(window.SC.Widget.Events.FINISH, () => {
    // Auto-advance handled by SoundCloud widget
    notifyListeners()
  })
}

// ============================================
// CHANNEL SWITCHING
// ============================================

export function switchChannel(channelId: number): string {
  if (channelId < 0 || channelId >= CHANNELS.length) return CHANNELS[state.currentChannel].url

  state.isSwitching = true
  state.currentChannel = channelId
  state.spm = CHANNELS[channelId].spm

  // Notify listeners for glitch effect
  notifyListeners()

  // Return the new playlist URL for the iframe to reload
  return CHANNELS[channelId].url
}

export function getCurrentChannel() {
  return CHANNELS[state.currentChannel]
}

// ============================================
// PLAYBACK CONTROLS
// ============================================

export function play() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.play()
  } else {
    // Widget not ready yet - set pending flag
    pendingPlay = true
  }
}

export function pause() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.pause()
  }
}

export function toggle() {
  if (state.isPlaying) {
    pause()
  } else {
    play()
  }
}

export function nextTrack() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.next()
  }
}

export function prevTrack() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.prev()
  }
}

export function setVolume(vol: number) {
  state.volume = Math.max(0, Math.min(1, vol))
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.setVolume(vol * 100)
  }
  notifyListeners()
}

// ============================================
// FREQUENCY DATA (SPM-based simulation)
// ============================================

function generateSPMBasedFrequency(): void {
  if (!state.isPlaying) {
    state.frequencyData.fill(0)
    return
  }

  const now = performance.now()
  const beatDuration = 60000 / state.spm
  const timeSinceBeat = (now - lastBeatTime) % beatDuration
  beatPhase = timeSinceBeat / beatDuration

  // Kick drum envelope
  const kickEnvelope = beatPhase < 0.1
    ? 1 - (beatPhase / 0.1)
    : beatPhase > 0.9
    ? (beatPhase - 0.9) / 0.1 * 0.5
    : 0

  // Hi-hat on off-beats
  const hihatPhase = (beatPhase + 0.5) % 1
  const hihatEnvelope = hihatPhase < 0.05 ? 1 - (hihatPhase / 0.05) : 0

  // Channel-specific intensity modifier
  const channelIntensity = 0.8 + (state.currentChannel * 0.1)

  for (let i = 0; i < state.frequencyData.length; i++) {
    if (i < 10) {
      state.frequencyData[i] = Math.floor(kickEnvelope * 255 * (1 - i / 10) * channelIntensity)
    } else if (i < 30) {
      const mid = Math.sin(now / 200 + i) * 0.3 + 0.2
      state.frequencyData[i] = Math.floor(mid * 128 * channelIntensity)
    } else {
      state.frequencyData[i] = Math.floor(hihatEnvelope * 200 * Math.random() * channelIntensity)
    }
  }
}

export function getFrequencyData(): Uint8Array<ArrayBuffer> {
  if (state.mode === 'soundcloud') {
    generateSPMBasedFrequency()
  } else if (state.analyzer && state.isPlaying) {
    state.analyzer.getByteFrequencyData(state.frequencyData)
  }
  return state.frequencyData
}

export function getBass(): number {
  const data = getFrequencyData()
  const sum = data[0] + data[1] + data[2] + data[3]
  return sum / 4 / 255
}

export function getMids(): number {
  const data = getFrequencyData()
  let sum = 0
  for (let i = 10; i < 30; i++) {
    sum += data[i]
  }
  return sum / 20 / 255
}

export function getHighs(): number {
  const data = getFrequencyData()
  let sum = 0
  for (let i = 50; i < 80; i++) {
    sum += data[i]
  }
  return sum / 30 / 255
}

// ============================================
// STATE GETTERS
// ============================================

export function getAudioState() {
  return {
    mode: state.mode,
    isInitialized: state.isInitialized,
    isPlaying: state.isPlaying,
    currentChannel: state.currentChannel,
    channel: CHANNELS[state.currentChannel],
    volume: state.volume,
    spm: state.spm,
    isSwitching: state.isSwitching,
  }
}

export function getIsSwitching() {
  return state.isSwitching
}

export function getBeatPhase() {
  return beatPhase
}

export function clearSwitching() {
  state.isSwitching = false
  notifyListeners()
}

// ============================================
// SUBSCRIPTIONS
// ============================================

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

export function onAudioChange(callback: () => void) {
  listeners.add(callback)
  return () => { listeners.delete(callback) }
}

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  interface Window {
    SC?: {
      Widget: {
        (iframe: HTMLIFrameElement): any
        Events: {
          READY: string
          PLAY: string
          PAUSE: string
          FINISH: string
          PLAY_PROGRESS: string
        }
      }
    }
  }
}
