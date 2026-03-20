import { Hero } from '@/components/home/Hero'
import { Manifesto } from '@/components/home/Manifesto'
import { TeaseCards } from '@/components/home/TeaseCards'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Hero />
      <Manifesto />
      <TeaseCards />
      <Footer />
      <PerspectiveGrid />
    </div>
  )
}
