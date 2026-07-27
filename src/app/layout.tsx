import type { Metadata } from 'next'
import Script from 'next/script'
import { Montserrat, Cinzel } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const GA_ID = 'G-VY0D6ECGYP'

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

        {/* Google Analytics (gtag.js) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  )
}
