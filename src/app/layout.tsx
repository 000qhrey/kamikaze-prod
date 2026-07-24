import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Archivo, Archivo_Black, IBM_Plex_Mono } from 'next/font/google'
import { AppShell } from '@/components/layout/AppShell'
import '@/styles/globals.css'
import Script from 'next/script'

// Self-hosted at build time — no runtime Google Fonts CSS round-trips.
// Preload display + body only; Archivo Black is secondary brand face.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-archivo',
  adjustFontFallback: true,
  preload: true,
})

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-archivo-black',
  adjustFontFallback: true,
  preload: false,
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  adjustFontFallback: true,
  preload: true,
})

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
    <html
      lang="en"
      data-theme="pacific"
      className={`${archivo.variable} ${archivoBlack.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        {/* Apply stored theme before paint to avoid Pacific→Heatmap flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('k-theme');if(t==='heatmap'||t==='pacific')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* Third-party pixel — defer past LCP / hydration */}
        <Script id="meta-pixel" strategy="lazyOnload">
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
      <body className="bg-void text-white min-h-screen overflow-x-hidden font-mono">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
