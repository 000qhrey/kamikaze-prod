export const TRANSMISSION_PROGRESS = {
  FRAGMENT_01: 12,
  FRAGMENT_02: 63,
  COMPLETE: 100,
} as const

export const MASKED_TIMESTAMP = 'XX.09.2026'

export const FRAGMENT_01_SEEN_KEY = 'kamikaze-fragment-01-seen'
export const FRAGMENT_01_DISMISSED_KEY = 'kamikaze-transmission-dismissed'
export const CITY_REVEALED_KEY = 'kamikaze-override-city-revealed'

export function isCityRevealed(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(CITY_REVEALED_KEY) === '1'
}

export function markCityRevealed(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CITY_REVEALED_KEY, '1')
}

export function getProgressBar(percent: number): string {
  const filled = Math.round(percent / 5)
  const empty = 20 - filled
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${percent}%`
}
