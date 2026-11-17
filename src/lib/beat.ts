// The room's heartbeat. 144 BPM, shared by the CSS light (--beat) and the Web Audio engine.
// No imports: both the sigil and the sound schedule against the same number.
export const BPM = 144
export const BEAT = 60 / BPM // seconds per beat
export const BAR = 16 // beats per bar — every 16th lands a harder downbeat
