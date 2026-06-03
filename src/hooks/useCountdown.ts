'use client'

export interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
  progress: number // 0-1 (0 = just started, 1 = complete)
  totalSeconds: number
}

const LOCKED_COUNTDOWN: CountdownState = {
  days: 66,
  hours: 66,
  minutes: 66,
  seconds: 666,
  isComplete: false,
  progress: 0.666,
  totalSeconds: 666666,
}

export function resetCountdown(): void {
}

export function setCountdownSeconds(seconds: number): void {
}

export function useCountdown(): CountdownState {
  return LOCKED_COUNTDOWN
}

// Hook to get just the progress (for sigil animation)
export function useRitualProgress(): number {
  const { progress } = useCountdown()
  return progress
}

// Hook to check if ritual is complete
export function useRitualComplete(): boolean {
  const { isComplete } = useCountdown()
  return isComplete
}
