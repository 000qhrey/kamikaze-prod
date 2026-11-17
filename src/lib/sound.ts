// "The room next door": a synthesized sealed-venue atmosphere. No audio files, no dependencies.
// Three layers through one master "door" low-pass: a BED (kick through a wall + sub drone + vent noise)
// on the 144 BPM grid, a DOOR cutoff that opens/closes per route, and HITS fired on the sigil:kick event.
// Off by default; the AudioContext is not created until the user turns it on. Tune by ear on real hardware.
import { BAR, BEAT } from './beat'

const MASTER_MAX = 0.3 // hard ceiling on the whole room
const BED_GAIN = 0.5 // the continuous bed, relative to master
const DRONE_GAIN = 0.05
const VENT_GAIN = 0.012
const DOOR_READ = 320 // resting cutoff (Hz) — muffled thud
const FADE = 1.5 // seconds to fade the room in/out
const LOOKAHEAD = 0.12 // seconds of beats to schedule ahead
export const DOOR = { open: 1400, read: DOOR_READ, shut: 90 } as const

type Ctx = AudioContext & { createGain: AudioContext['createGain'] }

let ctx: Ctx | null = null
let master: GainNode | null = null
let door: BiquadFilterNode | null = null
let bed: GainNode | null = null
let shaper: WaveShaperNode | null = null
let noiseBuf: AudioBuffer | null = null
let timer: ReturnType<typeof setInterval> | null = null
let nextBeatTime = 0
let beatIndex = 0
let running = false

// soft saturation curve (tanh), built once
function satCurve() {
  const n = 1024
  const c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    c[i] = Math.tanh(x * 2.2)
  }
  return c
}

function build() {
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  ctx = new AC() as Ctx
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -6
  limiter.ratio.value = 20
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  master = ctx.createGain()
  master.gain.value = 0
  door = ctx.createBiquadFilter()
  door.type = 'lowpass'
  door.frequency.value = DOOR_READ
  door.Q.value = 0.7
  shaper = ctx.createWaveShaper()
  shaper.curve = satCurve()
  door.connect(master)
  master.connect(limiter)
  limiter.connect(ctx.destination)

  // vent noise buffer (2s loop), reused for clicks too
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = noiseBuf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

  // BED: drone (two detuned saws) + ventilation, all behind the door
  bed = ctx.createGain()
  bed.gain.value = BED_GAIN
  bed.connect(door)
  for (const f of [55, 55.4]) {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = DRONE_GAIN
    o.connect(g)
    g.connect(bed)
    o.start()
  }
  const vent = ctx.createBufferSource()
  vent.buffer = noiseBuf
  vent.loop = true
  const vg = ctx.createGain()
  vg.gain.value = VENT_GAIN
  const vf = ctx.createBiquadFilter()
  vf.type = 'lowpass'
  vf.frequency.value = 140
  vent.connect(vf)
  vf.connect(vg)
  vg.connect(bed)
  vent.start()
}

// one kick: sine 160->46 Hz over 60ms through saturation + a 4ms noise click.
// Audible as a sub on headphones and a knock on a phone speaker.
function kick(at: number, gain: number, dest: AudioNode) {
  if (!ctx || !shaper || !noiseBuf) return
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(160, at)
  o.frequency.exponentialRampToValueAtTime(46, at + 0.06)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(gain, at + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
  o.connect(g)
  g.connect(shaper)
  shaper.connect(dest)
  o.start(at)
  o.stop(at + 0.2)
  // click transient
  const c = ctx.createBufferSource()
  c.buffer = noiseBuf
  const cg = ctx.createGain()
  cg.gain.setValueAtTime(gain * 0.5, at)
  cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.004)
  const cf = ctx.createBiquadFilter()
  cf.type = 'bandpass'
  cf.frequency.value = 1800
  c.connect(cf)
  cf.connect(cg)
  cg.connect(dest)
  c.start(at)
  c.stop(at + 0.02)
}

function schedule() {
  if (!ctx || !bed) return
  while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
    const down = beatIndex % BAR === 0
    kick(nextBeatTime, down ? 0.9 : 0.55, bed) // bed kick goes through the door
    nextBeatTime += BEAT
    beatIndex++
  }
}

/** Open or close the door (low-pass cutoff) — the one expressive control, set per route. */
export function door_to(hz: number) {
  if (!ctx || !door) return
  door.frequency.cancelScheduledValues(ctx.currentTime)
  door.frequency.setTargetAtTime(hz, ctx.currentTime, 0.25)
}

/** A hard, unfiltered accent on an interaction (bypasses the door so it cuts through). */
export function hit(gain = 1) {
  if (!ctx || !master || !running) return
  kick(ctx.currentTime + 0.001, gain, master)
}

/** The one loud moment: a sub sweep with the door snapping open then sealing (pass success). */
export function seal() {
  if (!ctx || !master || !door || !running) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(110, t)
  o.frequency.exponentialRampToValueAtTime(32, t + 1.2)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3)
  o.connect(g)
  g.connect(master)
  o.start(t)
  o.stop(t + 1.4)
  door.frequency.cancelScheduledValues(t)
  door.frequency.setValueAtTime(DOOR.open, t)
  door.frequency.setTargetAtTime(DOOR_READ, t + 0.3, 0.4)
}

/** Turn the room on/off. Builds the AudioContext on first `true` (must be called from a user gesture). */
export function setSound(on: boolean) {
  if (on) {
    if (!ctx) build()
    void ctx!.resume()
    running = true
    master!.gain.cancelScheduledValues(ctx!.currentTime)
    master!.gain.setTargetAtTime(MASTER_MAX, ctx!.currentTime, FADE / 3)
    if (!timer) {
      nextBeatTime = ctx!.currentTime + 0.08
      beatIndex = 0
      timer = setInterval(schedule, 25)
    }
  } else {
    running = false
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, FADE / 4)
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function isOn() {
  return running
}

// pause the room when the tab is hidden, resume when visible (if it was on)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else if (running) void ctx.resume()
  })
}
