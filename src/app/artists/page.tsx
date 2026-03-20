import { artists } from '@/data/artists'
import { ArtistTile } from '@/components/artists/ArtistTile'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { ManifestoTexture } from '@/components/effects/ManifestoTexture'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'ARTISTS | KAMIKAZE',
  description: 'The collective. Meet the artists behind KAMIKAZE.',
}

export default function ArtistsPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-32">
      {/* Manifesto texture - huge scrolling text */}
      <ManifestoTexture phrase="WE MAKE RUPTURES" parallaxSpeed={0.1} />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-arterial text-sm">[ROSTER]</span>
            <h1 className="font-display text-5xl md:text-7xl tracking-wider">
              ARTISTS
            </h1>
          </div>
          <p className="font-mono text-grey-dark mt-4 tracking-widest">
            {'>'} THE ARCHITECTS OF COLLAPSE
          </p>
        </header>

        {/* Artist Grid - larger gaps for rotated tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {artists.map((artist, index) => (
            <ArtistTile key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      </div>

      <Footer />
      <PerspectiveGrid />
    </div>
  )
}
