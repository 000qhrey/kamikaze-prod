import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/layout/AppShell'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Kamikaze | The Room Is The Headliner',
  description:
    'Independent techno events. Curated lineups, fair access, one dancefloor.',
  keywords: ['techno', 'rave', 'underground', 'electronic music', 'events', 'kamikaze'],
  openGraph: {
    title: 'Kamikaze',
    description: 'Independent techno events. The room is the headliner.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon-32x32.png',
    apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/favicon/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload 3D assets for faster loading */}
        <link rel="preload" href="/draco/draco_decoder.wasm" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/logo.glb" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="bg-void text-white min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
