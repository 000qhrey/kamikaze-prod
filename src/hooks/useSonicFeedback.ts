'use client'

// Sonic UI feedback system
// Manages micro-sounds for interactions, ducked by main audio player

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      masterGain = audioContext.createGain()
      masterGain.gain.value = 0.3 // Base volume for UI sounds
      masterGain.connect(audioContext.destination)
    } catch {
      console.warn('[SonicFeedback] Web Audio not available')
      return null
    }
  }

  return audioContext
}

function getMasterGain(): GainNode | null {
  getAudioContext() // Ensure context is initialized
  return masterGain
}

// Duck UI sounds when main player is active
let isMainPlayerActive = false

export function setMainPlayerActive(active: boolean) {
  isMainPlayerActive = active
  const gain = getMasterGain()
  if (gain) {
    gain.gain.setTargetAtTime(active ? 0.1 : 0.3, gain.context.currentTime, 0.1)
  }
}

// Generate a low-frequency mechanical click
export function playHoverSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = 80 // Low mechanical hum

  envelope.gain.value = 0
  envelope.gain.setValueAtTime(0.15, ctx.currentTime)
  envelope.gain.setTargetAtTime(0.001, ctx.currentTime, 0.02)

  oscillator.connect(envelope)
  envelope.connect(gain)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.05)
}

// Generate a channel switch "data burst" sound
export function playChannelSwitch() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  // Create noise burst
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    // Bitcrushed noise
    const noise = Math.random() * 2 - 1
    data[i] = Math.sign(noise) * Math.floor(Math.abs(noise) * 8) / 8
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Filter for that "data" sound
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2000
  filter.Q.value = 5

  const envelope = ctx.createGain()
  envelope.gain.value = 0.3
  envelope.gain.setTargetAtTime(0, ctx.currentTime + 0.05, 0.03)

  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(gain)

  source.start()
  source.stop(ctx.currentTime + 0.15)

  // Add a mechanical clunk
  setTimeout(() => {
    const osc = ctx.createOscillator()
    const clunkEnv = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = 150
    osc.frequency.setTargetAtTime(50, ctx.currentTime, 0.02)

    clunkEnv.gain.value = 0.2
    clunkEnv.gain.setTargetAtTime(0, ctx.currentTime, 0.03)

    osc.connect(clunkEnv)
    clunkEnv.connect(gain)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  }, 30)
}

// Submit sound - ascending tone + data burst
export function playSubmitSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 200
  oscillator.frequency.setTargetAtTime(800, ctx.currentTime, 0.1)

  envelope.gain.value = 0.2
  envelope.gain.setTargetAtTime(0, ctx.currentTime + 0.2, 0.05)

  oscillator.connect(envelope)
  envelope.connect(gain)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.3)

  // Data burst after the tone
  setTimeout(() => playChannelSwitch(), 150)
}

// Error sound - descending harsh tone
export function playErrorSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.value = 400
  oscillator.frequency.setTargetAtTime(100, ctx.currentTime, 0.1)

  envelope.gain.value = 0.15
  envelope.gain.setTargetAtTime(0, ctx.currentTime + 0.15, 0.03)

  oscillator.connect(envelope)
  envelope.connect(gain)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.2)
}

// Click sound for buttons
export function playClickSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = 1200

  envelope.gain.value = 0.1
  envelope.gain.setTargetAtTime(0, ctx.currentTime, 0.01)

  oscillator.connect(envelope)
  envelope.connect(gain)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.02)
}

/** CRT POWER — tube wind-down + soft thump */
export function playPowerOffSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const t0 = ctx.currentTime

  // Descending CRT whistle
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(900, t0)
  osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.28)
  env.gain.setValueAtTime(0.22, t0)
  env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32)
  osc.connect(env)
  env.connect(gain)
  osc.start(t0)
  osc.stop(t0 + 0.34)

  // Soft mechanical click at the end
  const click = ctx.createOscillator()
  const clickEnv = ctx.createGain()
  click.type = 'square'
  click.frequency.value = 70
  clickEnv.gain.setValueAtTime(0.18, t0 + 0.22)
  clickEnv.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3)
  click.connect(clickEnv)
  clickEnv.connect(gain)
  click.start(t0 + 0.22)
  click.stop(t0 + 0.32)
}

// High-frequency chirp for fast-boot acknowledgment (800hz → 1200hz, 50ms)
export function playChirpSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 800
  oscillator.frequency.setTargetAtTime(1200, ctx.currentTime, 0.02)

  envelope.gain.value = 0.25
  envelope.gain.setTargetAtTime(0, ctx.currentTime + 0.03, 0.01)

  oscillator.connect(envelope)
  envelope.connect(gain)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.05)
}

// Boot sequence sound - ascending digital tones
export function playBootSound() {
  const ctx = getAudioContext()
  const gain = getMasterGain()
  if (!ctx || !gain) return

  // Series of ascending beeps
  const frequencies = [200, 300, 400, 600, 800]
  const spacing = 0.08

  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()

      osc.type = 'square'
      osc.frequency.value = freq

      env.gain.value = 0.15
      env.gain.setTargetAtTime(0, ctx.currentTime + 0.05, 0.02)

      osc.connect(env)
      env.connect(gain)

      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    }, i * spacing * 1000)
  })

  // Final confirmation tone
  setTimeout(() => {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 1000

    env.gain.value = 0.2
    env.gain.setTargetAtTime(0, ctx.currentTime + 0.15, 0.05)

    osc.connect(env)
    env.connect(gain)

    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  }, frequencies.length * spacing * 1000 + 100)
}
