import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VisionLar Imóveis',
  description: 'Encontre o imóvel ideal com a VisionLar Imóveis — Compra, venda e locação em Santa Cruz do Sul e região.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VisionLar',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'VisionLar Imóveis',
    description: 'Encontre o imóvel ideal — Compra, venda e locação',
    type: 'website',
    locale: 'pt_BR',
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VisionLar" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0D2137" />
        <meta name="msapplication-TileImage" content="/logo.png" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('SW registrado:', reg.scope); })
                  .catch(function(err) { console.log('SW erro:', err); });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
