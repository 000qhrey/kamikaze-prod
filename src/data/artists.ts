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
  /**
   * Open-call / competition slot — CRT + profile become a mix submission CTA
   * instead of a normal artist dossier.
   */
  isOpenCall?: boolean
  /** Override primary CTA href (defaults to /artists for open-call) */
  ctaHref?: string
  ctaLabel?: string
}

export const artists: Artist[] = [
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

She’s shared decks with names like Charlotte de Witte, Ben Klock, Indira Paganotto, and Lily Palmer, hitting stages including Awakenings, Decibel Outdoor, and DGTL India, with sets broadcast on HÖR Berlin and Rinse FM. Releases include the Throttle and Error EPs. On OVERRIDE she holds Channel 01 — the red channel opens the night.`,
    blurb:
      'SIREN333 — India → Belgium. Hard groove, Awakenings / Decibel / DGTL. Channel 01 — the red channel.',
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
      'IBLIIIZ — Kamikaze resident. Speed, schranz, all-out assault on sound. Channel 02.',
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

On the road she runs a strict NXS2 brief (DJM + linked CDJs), treating every booth like a sealed transmission. For OVERRIDE she arrives as Channel 03 — locked pressure in the middle of the night.`,
    blurb:
      'AN’SHE (Priyanka Das) — hard techno, peak pressure, zero soft landings. Channel 03 for OVERRIDE.',
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
    id: 'junvon',
    name: 'JUNVON',
    slug: 'junvon',
    photo: '/artists/junvon.jpg',
    location: 'Trivandrum',
    origin: 'Trivandrum, India',
    genre: 'Peak-Time Techno',
    activeSince: '—',
    bio: `The underground spirit of our city is known for hypnotic, peak-time sets and an unmatched instinct for reading the room. With a sharp awareness of every shift in energy, he knows exactly when to take control, catching crowds off guard with perfectly timed selections and seamless execution.

Blending deep grooves, driving rhythms, and peak-time intensity, JUNVON doesn’t just play music, he shapes the night into an immersive journey, leaving audiences wanting more long after the final track.`,
    blurb:
      'JUNVON — Trivandrum. Hypnotic peak-time, room reader, underground spirit. Channel 04.',
    tagline: 'read the room // take control',
    socials: {
      instagram: 'https://www.instagram.com/junvon_/',
    },
    mixes: [],
  },
  {
    id: 'open-slot',
    name: 'COMPETITION WINNER',
    slug: 'open-slot',
    photo: '/artists/open-slot.png',
    location: 'Trivandrum',
    origin: 'Open call',
    genre: 'Your frequency',
    activeSince: 'TBD',
    isOpenCall: true,
    ctaHref: '/artists',
    ctaLabel: 'SEND YOUR MIX →',
    bio: `Do you have what it takes to open our night?

Send us your mix and you might be the one to open this legendary night — OVERRIDE, Trivandrum. We’re looking for an opener who can hold pressure, read the room, and earn the first hour.

No VIP. No backstage. One soul. One ticket. One room. Upload a SoundCloud link through the artists page and we’ll listen.`,
    blurb:
      'Open call — send your mix. You might open OVERRIDE. Channel 05.',
    tagline: 'do you have what it takes // open the night',
    socials: {},
    mixes: [],
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

/** Lineup artists only — excludes open-call / competition slots */
export function getRosterArtists(): Artist[] {
  return artists.filter((a) => !a.isOpenCall)
}
