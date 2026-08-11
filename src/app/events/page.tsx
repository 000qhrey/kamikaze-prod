import { getUpcomingEvents } from '@/data/events'
import { EventCard } from '@/components/events/EventCard'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { ManifestoTexture } from '@/components/effects/ManifestoTexture'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { EventsHashHandler } from '@/components/events/EventsHashHandler'
import { EVENTS, META } from '@/data/siteCopy'

export const metadata = {
  title: META.events.title,
  description: META.events.description,
}

export default function EventsPage() {
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="relative min-h-screen flex flex-col pt-24">
      <EventsHashHandler />
      <ManifestoTexture phrase="CONTROLLED COLLAPSE" parallaxSpeed={0.12} />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex-grow pb-20 w-full">
        <header className="mb-8 sm:mb-12">
          <ScrambleText
            className="font-display text-4xl sm:text-5xl md:text-7xl tracking-wider mb-3 sm:mb-4 block"
            triggerOnView
            triggerOnHover={false}
            duration={600}
            resolveToColor="#CC0000"
            finalColor="#EFEFEF"
          >
            {EVENTS.pageTitle}
          </ScrambleText>
          <p className="font-mono text-sm sm:text-base text-white/70">
            {EVENTS.tagline}
          </p>
        </header>

        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="font-mono text-[10px] sm:text-xs text-arterial uppercase tracking-[0.5em] mb-6 sm:mb-10 -skew-x-6">
              {'>>>'} {EVENTS.upcoming}
            </h2>
            <div className="space-y-10 sm:space-y-14">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>

      <PerspectiveGrid />
    </div>
  )
}
