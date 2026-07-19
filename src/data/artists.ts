export interface Artist {
  id: string
  name: string
  slug: string
  photo: string
  bio: string
  tagline: string
  taglineJa?: string
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
    bio: `Driven by a lifelong passion for music, our resident artist ibliiiz has been immersed in sound at every stage of life. Constantly evolving while staying true to one thing—'speed'—they embody the true meaning of Kamikaze: an all-out assault on sound. Through carefully selected elements, relentless energy, and uncompromising pace, they deliver the signature Kamikaze experience—explosive, immersive, and built to leave a lasting impact.`,
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

export function getAllArtistSlugs(): string[] {
  return artists.map((a) => a.slug)
}
