export interface Artist {
  id: string
  name: string
  slug: string
  photo: string
  bio: string
  location: string
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
    id: '1',
    name: 'IBLIIIZ',
    slug: 'ibliiiz',
    photo: '/artists/ibliiiz.png',
    location: 'Underground',
    bio: `The architect of sonic destruction. IBLIIIZ emerged from the depths of the underground scene with a singular mission—to dismantle the boundary between noise and transcendence.

Every set is a ritual. Every track, an incantation. The dancefloor doesn't move to the music—it surrenders to it.

"I don't play for the crowd. I play through them."`,
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
    id: '2',
    name: 'REBEKAH',
    slug: 'rebekah',
    photo: '/artists/rebekah.jpeg',
    location: 'Birmingham, UK',
    bio: `Birmingham's hardest export. Rebekah has spent two decades proving that British techno can match and exceed Continental intensity.

Her Elements series redefined what a mix album could be—conceptual journeys through texture and pressure rather than just BPM escalation.

Founder of the Decoy label. Advocate for women in electronic music. Absolutely zero compromise.`,
    socials: {
      instagram: 'https://instagram.com/reaboretum',
      soundcloud: 'https://soundcloud.com/reaboretum',
      bandcamp: 'https://rebekah.bandcamp.com',
    },
    mixes: [
      {
        title: 'Awakenings 2024',
        url: 'https://soundcloud.com/rebekah/awakenings',
        platform: 'soundcloud',
      },
    ],
  },
  {
    id: '3',
    name: 'PHASE FATALE',
    slug: 'phase-fatale',
    photo: '/artists/phase-fatale.jpg',
    location: 'Berlin, DE',
    bio: `Hayden Payne. American transplant to Berlin's Berghain orbit. His work on Ostgut Ton defines the label's darker periphery—EBM-inflected techno that moves like smoke through concrete.

Co-founder of Friction Vienna. His B2Bs with Ancient Methods have become legend.

"I make music for the 5AM moment when everyone's defenses are down."`,
    socials: {
      instagram: 'https://instagram.com/phasefatale',
      soundcloud: 'https://soundcloud.com/phase-fatale',
    },
    mixes: [
      {
        title: 'Berghain Live 2024',
        url: 'https://soundcloud.com/phase-fatale/berghain',
        platform: 'soundcloud',
      },
    ],
  },
]

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug)
}

export function getAllArtistSlugs(): string[] {
  return artists.map((a) => a.slug)
}
