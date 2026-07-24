export interface Artist {
  id: string
  name: string
  slug: string
  photo: string
  bio: string
  /** Short CRT dossier copy — keep ~2 lines so the rail never scrolls */
  blurb?: string
  tagline: string
  taglineJa?: string
  location: string
  /** Dossier fields for CRT / profile UI */
  origin?: string
  genre?: string
  activeSince?: string
  socials: {
    instagram?: string
    soundcloud?: string
    bandcamp?: string
    spotify?: string
  }
  mixes: {
    title: string
    url: string
    platform: 'soundcloud' | 'youtube' | 'mixcloud'
  }[]
}

export const artists: Artist[] = [
  {
    id: 'anshe',
    name: 'ANSHE',
    slug: 'anshe',
    photo: '/artists/anshe.png',
    location: 'India',
    origin: 'India',
    genre: 'Hard Techno',
    activeSince: '2018',
    bio: `AN’SHE (Priyanka Das) is a hard-techno operator built for peak pressure — precise, unsentimental, and locked to the floor. Her sets favour relentless pacing over soft landings: acid edges, industrial weight, and selections that keep bodies committed past the point of polite exit.

On the road she runs a strict NXS2 brief (DJM + linked CDJs), treating every booth like a sealed transmission. For OVERRIDE she arrives as Channel 01 — the first frequency in the night’s pirate broadcast.`,
    blurb:
      'AN’SHE (Priyanka Das) — hard techno, peak pressure, zero soft landings. Channel 01 for OVERRIDE.',
    tagline: 'signal locked // pressure incoming',
    socials: {
      instagram: 'https://instagram.com/anshemusic',
      soundcloud: 'https://soundcloud.com/anshemusic',
    },
    mixes: [
      {
        title: 'AN’SHE // SoundCloud',
        url: 'https://soundcloud.com/anshemusic',
        platform: 'soundcloud',
      },
    ],
  },
  {
    id: 'siren',
    name: 'SIREN',
    slug: 'siren',
    photo: '/artists/siren.png',
    location: 'Belgium',
    origin: 'India → Belgium',
    genre: 'Hard Groove / Techno',
    activeSince: '—',
    bio: `SIREN333 is a rising force in the global hard-groove wave — originally from India, now based in Belgium. Fast, percussive techno with a hypnotic low-end signature: tension, release, and zero soft exits.

She’s shared decks with names like Charlotte de Witte, Ben Klock, Indira Paganotto, and Lily Palmer, hitting stages including Awakenings, Decibel Outdoor, and DGTL India, with sets broadcast on HÖR Berlin and Rinse FM. Releases include the Throttle and Error EPs. On OVERRIDE she holds Channel 02 — the red channel.`,
    blurb:
      'SIREN333 — India → Belgium. Hard groove, Awakenings / Decibel / DGTL. Channel 02 — the red channel.',
    tagline: 'red channel // no soft exits',
    socials: {
      instagram: 'https://instagram.com/siren333_',
      soundcloud: 'https://soundcloud.com/siren333-music',
    },
    mixes: [
      {
        title: 'SIREN333 // SoundCloud',
        url: 'https://soundcloud.com/siren333-music',
        platform: 'soundcloud',
      },
    ],
  },
  {
    id: '1',
    name: 'IBLIIIZ',
    slug: 'ibliiiz',
    photo: '/artists/ibliiiz.png',
    location: 'Underground',
    origin: 'Underground',
    genre: 'Hard Techno / Schranz',
    activeSince: '—',
    bio: `Driven by a lifelong passion for music, our resident artist ibliiiz has been immersed in sound at every stage of life. Constantly evolving while staying true to one thing—'speed'—they embody the true meaning of Kamikaze: an all-out assault on sound. Through carefully selected elements, relentless energy, and uncompromising pace, they deliver the signature Kamikaze experience—explosive, immersive, and built to leave a lasting impact.`,
    blurb:
      'IBLIIIZ — Kamikaze resident. Speed, schranz, all-out assault on sound. Channel 03.',
    tagline: 'this for the ones who never belonged',
    taglineJa: '属せなかった者たちへ',
    socials: {
      instagram: 'https://instagram.com/ibliiiz',
      soundcloud: 'https://soundcloud.com/ibliiiz',
    },
    mixes: [
      {
        title: 'KAMIKAZE Sessions 001',
        url: 'https://soundcloud.com/ibliiiz/kamikaze-001',
        platform: 'soundcloud',
      },
    ],
  },
]

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug)
}

export function getArtistByName(name: string): Artist | undefined {
  const key = name.trim().toLowerCase()
  return artists.find((a) => a.name.toLowerCase() === key || a.slug === key)
}

export function getAllArtistSlugs(): string[] {
  return artists.map((a) => a.slug)
}
