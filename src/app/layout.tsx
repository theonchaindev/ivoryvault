import type { Metadata } from 'next'
import { Montserrat, Cinzel } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import CookieConsent from '@/components/CookieConsent'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const SITE_URL = 'https://www.ivoryvaultcompetitions.co.uk'
const DESCRIPTION = 'Enter Ivory Vault prize competitions for the chance to win luxury watches, tech, cash and more. UK-based, fully transparent draws with a free postal entry route. 18+.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Ivory Vault — Luxury Prize Competitions',
    template: '%s · Ivory Vault',
  },
  description: DESCRIPTION,
  keywords: ['prize competition', 'UK competition', 'luxury raffle', 'win a watch', 'win a car', 'online competitions UK', 'prize draw', 'instant win'],
  applicationName: 'Ivory Vault',
  authors: [{ name: 'Ivory Vault Competitions Ltd' }],
  creator: 'Ivory Vault Competitions Ltd',
  publisher: 'Ivory Vault Competitions Ltd',
  category: 'shopping',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Ivory Vault',
    title: 'Ivory Vault — Luxury Prize Competitions',
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_GB',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Ivory Vault' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ivory Vault — Luxury Prize Competitions',
    description: DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  icons: { icon: '/icon.png', apple: '/logo.png' },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ivory Vault Competitions Ltd',
  alternateName: 'Ivory Vault',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: 'support@ivoryvaultcompetitions.co.uk',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '68 Laburnum Crescent',
    addressLocality: 'Northampton',
    postalCode: 'NN3 2LF',
    addressCountry: 'GB',
  },
}
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ivory Vault',
  url: SITE_URL,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cinzel.variable}`}>
      <body style={{ fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />

        <CartProvider>{children}</CartProvider>

        {/* Cookie consent — loads Google Analytics only after the user accepts */}
        <CookieConsent />
      </body>
    </html>
  )
}
