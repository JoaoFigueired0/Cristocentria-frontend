import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--ff-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--ff-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cristocentria',
    template: '%s | Cristocentria',
  },
  description: 'Roupas com propósito. Moda que expressa fé.',
  icons: {
    icon: '/logo/icon-app.svg',
    shortcut: '/logo/icon-app.svg',
    apple: '/logo/icon-app.svg',
  },
  openGraph: {
    siteName: 'Cristocentria',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${dmSans.variable}`}
    >
      <body className="bg-brand-surface font-body text-brand-black antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
