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
    tagline: "WE DON'T\nTHROW EVENTS.\n\nWE BUILD\nMOMENTS.",
    est: 'EST. MMXXVI',
    scroll: 'SCROLL',
  },

  residents: {
    label: 'RESIDENTS',
    heading: 'ONE NAME.\nONE ROOM.',
    viewAll: 'VIEW ALL →',
    role: (n: number) => `RESIDENT · ${String(n).padStart(3, '0')}`,
  },

  sigil: {
    label: 'SIGIL',
    heading: 'LEVIATHANS\nIN THE\nDARK.',
    caption: 'KAMIKAZE / MMXXVI',
    zone: 'UNDERGROUND',
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
