import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/layout/AppShell'
import '@/styles/globals.css'
import Script from "next/script";

export const metadata: Metadata = {
  title: 'Kamikaze | The Room Is The Headliner',
  description:
    'Independent techno events. Curated lineups, fair access, one room.',
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
        <Script
        id="meta-pixel"
        strategy="afterInteractive"
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2234042430703510');
          fbq('track', 'PageView');
        `}
      </Script>

      </head>
      <body className="bg-void text-white min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
