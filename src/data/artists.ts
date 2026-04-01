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
    bio: `The architect of sonic destruction. ibliiiz emerged from the depths of the underground scene with a singular mission—to dismantle the boundary between noise and transcendence.

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
]

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug)
}

export function getAllArtistSlugs(): string[] {
  return artists.map((a) => a.slug)
}
