import { Hero } from '@/components/home/Hero'
import { FeaturedEvent } from '@/components/home/FeaturedEvent'
import { FeaturedMix } from '@/components/home/FeaturedMix'
import { AboutSection } from '@/components/home/AboutSection'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow">
        <Hero />
        <FeaturedEvent />
        <FeaturedMix />
        <AboutSection />
      </div>
      <PerspectiveGrid />
    </div>
  )
}
