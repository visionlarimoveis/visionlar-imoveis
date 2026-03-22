import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VisionLar Imóveis',
  description: 'Encontre o imóvel ideal com a VisionLar Imóveis — Compra, venda e locação.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VisionLar',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D2137',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VisionLar" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="VisionLar" />
        <meta name="msapplication-TileColor" content="#0D2137" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(reg) {
                    console.log('VisionLar PWA pronto!', reg.scope);
                  })
                  .catch(function(err) {
                    console.log('SW erro:', err);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
