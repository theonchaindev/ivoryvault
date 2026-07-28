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

export const metadata: Metadata = {
  title: 'Ivory Vault — Luxury Prize Competitions',
  description: 'Enter world-class prize competitions for a chance to win luxury watches, cash, and more. UK-based, fully transparent draws.',
  keywords: ['prize competition', 'luxury raffle', 'win a watch', 'UK competition'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cinzel.variable}`}>
      <body style={{ fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
        <CartProvider>{children}</CartProvider>

        {/* Cookie consent — loads Google Analytics only after the user accepts */}
        <CookieConsent />
      </body>
    </html>
  )
}
