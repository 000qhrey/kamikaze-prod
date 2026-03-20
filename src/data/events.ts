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
}

export const events: Event[] = [
  {
    id: 'void-descent',
    name: 'VOID DESCENT',
    date: '2025-05-17',
    venue: 'Warehouse 17',
    city: 'Berlin',
    lineup: ['KNTXT', 'VTSS', 'TRYM', 'PARFAIT'],
    ticketUrl: 'https://ra.co/events/kamikaze-void-descent',
    isPast: false,
    description: 'Six hours of unrelenting industrial techno in the depths of Kreuzberg.',
  },
  {
    id: 'system-collapse',
    name: 'SYSTEM COLLAPSE',
    date: '2025-06-28',
    venue: 'The Tunnels',
    city: 'London',
    lineup: ['999999999', 'BLAWAN', 'PAULA TEMPLE', 'PHASE FATALE'],
    ticketUrl: 'https://ra.co/events/kamikaze-system-collapse',
    isPast: false,
    description: 'The system fails. We dance in the wreckage.',
  },
  {
    id: 'total-destruction',
    name: 'TOTAL DESTRUCTION',
    date: '2025-08-15',
    venue: 'Bunker Unknown',
    city: 'Amsterdam',
    lineup: ['ANSOME', 'REBEKAH', 'HEADLESS HORSEMAN'],
    isPast: false,
    description: 'Location revealed 24 hours before. No phones. No mercy.',
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
