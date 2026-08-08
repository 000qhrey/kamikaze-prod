/**
 * Homepage copy — English.
 */

export const HOME_COPY = {
  topbar: {
    collective: 'TECHNO COLLECTIVE',
    zone: 'UNDERGROUND',
    menu: 'MENU',
    menuClose: 'CLOSE',
  },

  hero: {
    metaStack: ['TECHNO', 'COLLECTIVE', 'UNDERGROUND'] as const,
    tagline: "WE DON'T THROW EVENTS.\nWE BUILD MOMENTS.",
    est: 'EST. MMXXVI',
    scroll: 'SCROLL',
  },

  events: {
    label: 'FEATURED EVENT',
    locationTbd: 'LOCATION TBA',
    cta: 'DETAILS →',
    viewAll: 'ALL EVENTS →',
  },

  mix: {
    label: 'FEATURED MIX',
    eyebrow: 'SOUNDCLOUD',
    play: '▶ PLAY',
    listen: '[ LISTEN ON SOUNDCLOUD → ]',
    artist: 'ARTIST PROFILE →',
  },

  residents: {
    label: 'THE COLLECTIVE',
    heading: 'ONE NAME.\nONE ROOM.',
    viewAll: 'VIEW ALL →',
    role: (n: number) => `RESIDENT · ${String(n).padStart(3, '0')}`,
  },

  telemetry: {
    frequency: 'FREQUENCY',
    transmission: 'TRANSMISSION',
    signal: 'SIGNAL STRENGTH',
    live: 'LIVE FEED',
  },

  sigil: {
    label: 'MANIFESTO',
    heading: 'LEVIATHANS\nIN THE\nDARK.',
    caption: 'KAMIKAZE / MMXXVI',
    zone: 'UNDERGROUND',
    readMore: 'READ MORE →',
  },

  footer: {
    marquee:
      '[!] WARNING: NO VIP. NO BACKSTAGE. ONE SOUL. ONE TICKET. ONE ROOM.',
  },
} as const

export const CONSTANT = {
  wordmark: 'KAMIKAZE',
  coords: { lat: '00.0000° N', lon: '00.0000° E' },
  residents: [
    { name: 'IBLIIIZ', handle: '@IBLIIIZ', href: '/artists/ibliiiz' },
  ],
} as const
