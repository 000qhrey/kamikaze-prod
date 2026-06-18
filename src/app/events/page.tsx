import { getUpcomingEvents, getPastEvents } from '@/data/events'
import { EventCard } from '@/components/events/EventCard'
import { PastEventCard } from '@/components/events/PastEventCard'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { ManifestoTexture } from '@/components/effects/ManifestoTexture'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { DeadSignalsEmpty } from '@/components/events/DeadSignalsEmpty'
import { EventsHashHandler } from '@/components/events/EventsHashHandler'
import { EVENTS, META } from '@/data/siteCopy'

export const metadata = {
  title: META.events.title,
  description: META.events.description,
}

export default function EventsPage() {
  const upcomingEvents = getUpcomingEvents()
  const pastEvents = getPastEvents()

  return (
    <div className="relative min-h-screen flex flex-col pt-24">
      <EventsHashHandler />
      {/* Manifesto texture - huge scrolling text */}
      <ManifestoTexture phrase="CONTROLLED COLLAPSE" parallaxSpeed={0.12} />

      {/* Background noise canvas */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex-grow pb-16">
        {/* Header */}
        <header className="mb-16">
          <ScrambleText
            className="font-display text-5xl md:text-7xl tracking-wider mb-4 block"
            triggerOnView
            triggerOnHover={false}
            duration={600}
            resolveToColor="#CC0000"
            finalColor="#EFEFEF"
          >
            {EVENTS.pageTitle}
          </ScrambleText>
          <p className="font-mono text-white/70">
            {EVENTS.tagline}
          </p>
        </header>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-32">
            <h2 className="font-mono text-xs text-arterial uppercase tracking-[0.5em] mb-12 -skew-x-6">
              {'>>>'} {EVENTS.upcoming}
            </h2>
            <div className="space-y-12">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Past Events / Dead Signals */}
        <section>
          <h2 className="font-mono text-xs text-white/50 uppercase tracking-[0.5em] mb-12 skew-x-3">
            [ {EVENTS.past} ]
          </h2>
          {pastEvents.length > 0 ? (
            <div className="space-y-4">
              {pastEvents.map((event, index) => (
                <PastEventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <DeadSignalsEmpty />
          )}
        </section>
      </div>

      <PerspectiveGrid />
    </div>
  )
}
