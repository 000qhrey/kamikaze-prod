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
}

export const events: Event[] = [
  {
    id: 'kamikaze-override',
    name: 'KAMIKAZE OVERRIDE',
    date: '2026-07-26',
    venue: 'Undisclosed',
    city: 'Trivandrum',
    lineup: ['KAMIKAZE COLLECTIVE', 'LOCAL FREQUENCIES', 'TBA'],
    ticketUrl: 'https://ra.co/events/kamikaze-override',
    isPast: false,
    description: 'The signal reaches the subcontinent. Location decrypts 48 hours before.',
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
  {
    id: 'ritual-001',
    name: 'RITUAL 001',
    date: '2025-02-22',
    venue: 'Tresor',
    city: 'Berlin',
    lineup: ['KOBOSIL', 'RÖYKSOPP', 'FJAAK'],
    isPast: true,
    description: 'The first invocation. 800 souls witnessed.',
  },
  {
    id: 'concrete-prayer',
    name: 'CONCRETE PRAYER',
    date: '2024-11-30',
    venue: 'Printworks',
    city: 'London',
    lineup: ['I HATE MODELS', 'DASHA RUSH', 'SETAOC MASS'],
    isPast: true,
    description: 'Sold out in 4 minutes. 3000 bodies. One frequency.',
  },
  {
    id: 'neural-damage',
    name: 'NEURAL DAMAGE',
    date: '2024-09-14',
    venue: 'Bassiani',
    city: 'Tbilisi',
    lineup: ['ANCIENT METHODS', 'NENE H', 'HECTOR OAKS'],
    isPast: true,
    description: 'The Caucasus experiment. Frequencies still echoing.',
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
