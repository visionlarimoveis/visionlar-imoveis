import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VisionLar Imóveis',
  description: 'Sistema imobiliário VisionLar — Compra, venda e locação de imóveis',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
