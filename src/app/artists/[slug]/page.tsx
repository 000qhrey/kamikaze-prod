import { notFound } from 'next/navigation'
import { getArtistBySlug, getAllArtistSlugs } from '@/data/artists'
import { ArtistPageContent } from '@/components/artists/ArtistPageContent'
import { ArtistHeader } from '@/components/artists/ArtistHeader'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { Footer } from '@/components/layout/Footer'

interface ArtistPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllArtistSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: ArtistPageProps) {
  const artist = getArtistBySlug(params.slug)
  if (!artist) return { title: 'Artist Not Found' }

  return {
    title: `${artist.name} | KAMIKAZE`,
    description: artist.bio.split('\n')[0],
  }
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const artist = getArtistBySlug(params.slug)

  if (!artist) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-void">
      {/* Persistent noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <ArtistHeader artist={artist} />
      <ArtistPageContent artist={artist} />

      <Footer />
      <PerspectiveGrid />
    </div>
  )
}
