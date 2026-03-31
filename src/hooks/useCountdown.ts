'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
  progress: number // 0-1 (0 = just started, 1 = complete)
  totalSeconds: number
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Get or create the target date (stored in localStorage for persistence)
function getTargetDate(): Date {
  if (typeof window === 'undefined') {
    return new Date(Date.now() + THIRTY_DAYS_MS)
  }

  const stored = localStorage.getItem('kamikaze_ritual_target')
  if (stored) {
    const target = new Date(stored)
    // Validate it's a real date
    if (!isNaN(target.getTime())) {
      return target
    }
  }

  // Create new target 30 days from now
  const target = new Date(Date.now() + THIRTY_DAYS_MS)
  localStorage.setItem('kamikaze_ritual_target', target.toISOString())
  return target
}

// For testing: reset the countdown
export function resetCountdown(): void {
  if (typeof window === 'undefined') return
  const target = new Date(Date.now() + THIRTY_DAYS_MS)
  localStorage.setItem('kamikaze_ritual_target', target.toISOString())
}

// For testing: set countdown to complete in X seconds
export function setCountdownSeconds(seconds: number): void {
  if (typeof window === 'undefined') return
  const target = new Date(Date.now() + seconds * 1000)
  localStorage.setItem('kamikaze_ritual_target', target.toISOString())
}

function calculateCountdown(targetDate: Date): CountdownState {
  const now = Date.now()
  const target = targetDate.getTime()
  const diff = target - now

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
      progress: 1,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  // Progress: how much of 30 days has elapsed (0 = just started, 1 = complete)
  const elapsed = THIRTY_DAYS_MS - diff
  const progress = Math.max(0, Math.min(1, elapsed / THIRTY_DAYS_MS))

  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: false,
    progress,
    totalSeconds,
  }
}

export function useCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(() => {
    // SSR-safe initial state
    return {
      days: 30,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: false,
      progress: 0,
      totalSeconds: THIRTY_DAYS_MS / 1000,
    }
  })

  const [targetDate, setTargetDate] = useState<Date | null>(null)

  // Initialize target date on client
  useEffect(() => {
    setTargetDate(getTargetDate())
  }, [])

  // Update countdown every second
  useEffect(() => {
    if (!targetDate) return

    const update = () => {
      setState(calculateCountdown(targetDate))
    }

    update() // Initial calculation
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  // Listen for storage changes (if countdown is reset in another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kamikaze_ritual_target' && e.newValue) {
        setTargetDate(new Date(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return state
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
