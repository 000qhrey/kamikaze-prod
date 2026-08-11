export interface Event {
  id: string
  name: string
  date: string
  venue: string
  city: string
  lineup: string[]
  /** Optional artist slugs for CRT / rich lineup UI */
  lineupArtistSlugs?: string[]
  ticketUrl?: string
  isPast: boolean
  description?: string
  isSecretLocation?: boolean
  isFullyRedacted?: boolean
  isDateHidden?: boolean
  /** Homepage featured event — only one should be true */
  featured?: boolean
  /** Optional cover art for events page card */
  coverImage?: string
  tbdFields?: ('venue' | 'lineup' | 'date')[]
}

export const events: Event[] = [
  {
    id: 'kamikaze-override',
    name: 'OVERRIDE',
    date: '2026-09-05',
    venue: 'Venue TBA',
    city: 'Trivandrum',
    lineup: ['SIREN', 'IBLIIIZ', 'ANSHE', 'JUNVON', 'OPEN SLOT'],
    /** Artist slugs for CRT channel surf — order = channel order */
    lineupArtistSlugs: ['siren', 'ibliiiz', 'anshe', 'junvon', 'open-slot'],
    ticketUrl:
      'https://whatsaround.app/home/events/kamikaze-presents-override-born-beneath-the-sound',
    isPast: false,
    featured: true,
    coverImage: '/events/override-cover.png',
    description: 'Peak pressure in Trivandrum. Venue TBA — tickets live.',
    isSecretLocation: false,
    tbdFields: ['venue'],
  },
  {
    id: 'redacted-session-01',
    name: '[REDACTED SESSION]',
    date: '2025-05-17',
    venue: 'UNKNOWN',
    city: 'UNKNOWN',
    lineup: ['█████████', '███████', '██████'],
    isPast: true,
    description:
      'You are not authorized to view this transmission. Clearance required. Signal locked until further notice.',
    isFullyRedacted: true,
  },
]

export function getUpcomingEvents(): Event[] {
  return events.filter((e) => !e.isPast)
}

/** Single homepage feature — OVERRIDE */
export function getFeaturedEvent(): Event | undefined {
  return events.find((e) => e.featured && !e.isPast) ?? getUpcomingEvents()[0]
}

export function getPastEvents(): Event[] {
  return events.filter((e) => e.isPast)
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id)
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '.')
}

/** Day redacted — month and year only (e.g. XX.09.2026) */
export function formatEventDatePartial(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `XX.${month}.${year}`
}

export function formatEventMonthYear(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
