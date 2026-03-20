import type { Metadata } from 'next'
import { LenisProvider } from '@/providers/LenisProvider'
import { CursorProvider } from '@/providers/CursorProvider'
import { TransitionProvider } from '@/providers/TransitionProvider'
import { Navigation } from '@/components/layout/Navigation'
import { DepthLayers } from '@/components/canvas/DepthLayers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'KAMIKAZE | Underground Never Dies',
  description: 'We don\'t make music. We make ruptures. Underground techno events. The underground never dies.',
  keywords: ['techno', 'rave', 'underground', 'electronic music', 'IN', 'events', 'kamikaze'],
  openGraph: {
    title: 'KAMIKAZE',
    description: 'Underground. Uncompromising. Unrepeatable.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-void text-white min-h-screen">
        <LenisProvider>
          <CursorProvider>
            <TransitionProvider>
              <Navigation />
              <main className="relative z-10">{children}</main>
              <DepthLayers />
            </TransitionProvider>
          </CursorProvider>
        </LenisProvider>
      </body>
    </html>
  )
}
