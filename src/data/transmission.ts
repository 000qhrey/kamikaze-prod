export const TRANSMISSION_PROGRESS = {
  FRAGMENT_01: 12,
  FRAGMENT_02: 63,
  COMPLETE: 100,
} as const

export const MASKED_TIMESTAMP = 'XX.09.2026'

export const FRAGMENT_01_SEEN_KEY = 'kamikaze-fragment-01-seen'
export const FRAGMENT_01_DISMISSED_KEY = 'kamikaze-transmission-dismissed'

export function getProgressBar(percent: number): string {
  const filled = Math.round(percent / 5)
  const empty = 20 - filled
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${percent}%`
}
