import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import Cursor from '@/components/Cursor'
import Dock from '@/components/Dock'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import { SigilCanvas } from '@/components/sigil/SigilCanvas'
import FlashLayer from '@/components/FlashLayer'
import { fmtDate, nextEvent } from '@/data/events'
import { basePath, getAssetPath } from '@/lib/basePath'
import { DEPLOY_URL } from '@/lib/site'
import '@/styles/globals.css'

// All three faces are local files: the build never talks to Google.
const rit = localFont({ src: '../../public/sdcyberpunkcitydemo/SDCyberPunkCityDemo.otf', variable: '--font-rit', display: 'swap' })
const archivo = localFont({
  src: '../fonts/Archivo-Variable.woff2',
  variable: '--font-archivo',
  display: 'swap',
  weight: '400 900',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }], // the width axis: .num sets font-stretch 125%
})
const mono = localFont({
  src: [
    { path: '../fonts/IBMPlexMono-400.woff2', weight: '400' },
    { path: '../fonts/IBMPlexMono-500.woff2', weight: '500' },
  ],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: false,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
}

// Metadata is fixed at build time: rebuild after an event passes.
const next = nextEvent()

export const metadata: Metadata = {
  metadataBase: new URL(DEPLOY_URL),
  title: { default: 'Kamikaze / The room is the headliner', template: '%s / Kamikaze' },
  description: next
    ? `Kamikaze is an independent techno collective in India. Next date: ${fmtDate(next.date)}, venue sealed. The first one was planned for 250. 500 came.`
    : 'Kamikaze is an independent techno collective in India. One ticket, one room. The first one, OVERRIDE, was planned for 250. 500 came.',
  openGraph: {
    type: 'website',
    siteName: 'Kamikaze',
    url: './',
    // a plain file in public/, resolved against metadataBase (which already carries the base path)
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Kamikaze. The room is the headliner.' }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: getAssetPath('/favicon/favicon-32x32.png'), sizes: '32x32', type: 'image/png' },
      { url: getAssetPath('/favicon/favicon-16x16.png'), sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: getAssetPath('/favicon/apple-touch-icon.png'), sizes: '180x180' },
  },
  manifest: getAssetPath('/favicon/site.webmanifest'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: scripts add classes to <html> (js, sigil-live) that React did not render
    <html lang="en" className={`${rit.variable} ${archivo.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }} />
      </head>
      <body>
        <div className="fx-room" aria-hidden="true" />
        <SigilCanvas />
        <FlashLayer />
        <a id="skip" href="#main" className="mono sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-30 focus:bg-bone focus:px-4 focus:py-3 focus:text-void">
          Skip to content
        </a>
        <div className="fx fx-vig" aria-hidden="true" />
        <div className="fx fx-scan" aria-hidden="true" />
        <div className="fx fx-grain" aria-hidden="true" />
        <Cursor />
        <Nav />
        <main id="main" className="pt-[calc(var(--nav-h)+env(safe-area-inset-top,0px))]">
          {children}
        </main>
        <Footer />
        <Dock />
        {/* Vercel serves the analytics script; on GitHub Pages the request can only 404 */}
        {!basePath && <Analytics />}
        {/* Meta Pixel, after everything else. Later page views are sent from Nav on route change. */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2234042430703510');fbq('track','PageView');`}
        </Script>
      </body>
    </html>
  )
}
