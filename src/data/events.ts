export interface Event {
  id: string
  name: string
  date: string
  venue: string
  city: string
  lineup: string[]
  ticketUrl?: string
  isPast: boolean
  description?: string
  isSecretLocation?: boolean // For events with hidden location reveal (click to decrypt)
  isFullyRedacted?: boolean // For fully locked events (no access at all)
  isDateHidden?: boolean // Hide the date completely
}

export const events: Event[] = [
  {
    id: 'kamikaze-override',
    name: 'KAMIKAZE OVERRIDE',
    date: '2026-09-04',
    venue: 'Undisclosed',
    city: 'Trivandrum',
    lineup: ['KAMIKAZE COLLECTIVE', 'LOCAL FREQUENCIES', 'TBA'],
    ticketUrl: 'https://ra.co/events/kamikaze-override',
    isPast: false,
    description: 'The convention is camouflage. Beneath the dome, the network breathes. Coordinates burn clear at T−48.',
    isSecretLocation: true, // Special flag for hacking sequence
  },
  {
    id: 'redacted-session-01',
    name: '[REDACTED SESSION]',
    date: '2025-05-17',
    venue: 'UNKNOWN',
    city: 'UNKNOWN',
    lineup: ['█████████', '███████', '██████'],
    isPast: false,
    description: 'You are not authorized to view this transmission. Clearance required. Signal locked until further notice.',
    isFullyRedacted: true,
  },
]

export function getUpcomingEvents(): Event[] {
  return events.filter((e) => !e.isPast)
}

export function getPastEvents(): Event[] {
  return events.filter((e) => e.isPast)
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id)
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '.')
}
