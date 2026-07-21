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
    <html lang="en" data-theme="pacific">
      <head>
        {/* Apply stored theme before paint to avoid Pacific→Heatmap flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('k-theme');if(t==='heatmap'||t==='pacific')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* 3D assets (logo.glb / draco) preload via useGLTF when Canvas mounts —
            avoid competing with LCP on mobile / GH Pages static path */}
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

        {/* Display + mono — drop unused JP families / italic axes for smaller CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400;700;900&family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="bg-void text-white min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
