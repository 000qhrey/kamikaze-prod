// Waitlist localStorage helpers for Ritual Chamber

export interface WaitlistEntry {
  email: string
  timestamp: number
  initiateNumber: number
}

const STORAGE_KEY = 'kamikaze_waitlist'
const COUNT_KEY = 'kamikaze_waitlist_count'

// Base count to show (makes it look like others have joined)
const BASE_COUNT = 247

function getEntries(): WaitlistEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return []
}

function saveEntries(entries: WaitlistEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function getStoredCount(): number {
  if (typeof window === 'undefined') return BASE_COUNT

  try {
    const stored = localStorage.getItem(COUNT_KEY)
    if (stored) {
      return parseInt(stored, 10)
    }
  } catch {
    // Ignore parse errors
  }
  return BASE_COUNT
}

function saveCount(count: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COUNT_KEY, count.toString())
}

/**
 * Add email to waitlist
 * Returns the entry with initiate number, or null if already exists
 */
export function addToWaitlist(email: string): WaitlistEntry | null {
  const normalizedEmail = email.toLowerCase().trim()

  // Check if already bound
  if (isAlreadyBound(normalizedEmail)) {
    return null
  }

  const entries = getEntries()
  const currentCount = getStoredCount()
  const newCount = currentCount + 1

  const entry: WaitlistEntry = {
    email: normalizedEmail,
    timestamp: Date.now(),
    initiateNumber: newCount,
  }

  entries.push(entry)
  saveEntries(entries)
  saveCount(newCount)

  return entry
}

/**
 * Check if email is already on waitlist
 */
export function isAlreadyBound(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim()
  const entries = getEntries()
  return entries.some((e) => e.email === normalizedEmail)
}

/**
 * Get entry for email (if exists)
 */
export function getEntry(email: string): WaitlistEntry | null {
  const normalizedEmail = email.toLowerCase().trim()
  const entries = getEntries()
  return entries.find((e) => e.email === normalizedEmail) || null
}

/**
 * Get total waitlist count (base + actual signups)
 */
export function getWaitlistCount(): number {
  return getStoredCount()
}

/**
 * Get all entries (for admin/debug)
 */
export function getAllEntries(): WaitlistEntry[] {
  return getEntries()
}

/**
 * Clear waitlist (for testing)
 */
export function clearWaitlist(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(COUNT_KEY)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email.trim())
}
