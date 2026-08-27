import Link from 'next/link'
import Image from 'next/image'
import StarDivider from './StarDivider'
import { SOCIAL } from '@/lib/social'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <Image src="/logo.png" alt="Ivory Vault" width={52} height={52} />
              <div className="site-footer__logo-text">
                <span>IVORY VAULT</span>
              </div>
            </div>
            <p className="site-footer__tagline">Where luxury meets chance</p>
            <p className="site-footer__desc">Luxury competitions with extraordinary prizes. From everyday rewards to once-in-a-lifetime experiences. UK regulated and fully transparent.</p>
            <div className="site-footer__badge">
              <span className="site-footer__badge-dot" />
              UK Competition Law Compliant
            </div>
            <div className="site-footer__social">
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Ivory Vault on Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.53-1.5H16.7V4.7c-.3 0-1.32-.1-2.5-.1-2.47 0-4.16 1.5-4.16 4.28v2.02H7.3V14h2.74v8h3.46Z"/></svg>
              </a>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Ivory Vault on Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>

            {/* Add us as a preferred source on Google */}
            <a
              href="https://google.com/preferences/source?q=https://www.ivoryvaultcompetitions.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__gsource"
              aria-label="Add Ivory Vault as a preferred source on Google"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
              </svg>
              Add us as a preferred source on Google
            </a>
          </div>

          <div>
            <p className="site-footer__col-head">Competitions</p>
            <nav className="site-footer__nav">
              {[['/competitions','All Competitions'],['/winners','Winners'],['/free-entry','Free Entry Route']].map(([href,label]) => (
                <Link key={href} href={href} className="site-footer__link">{label}</Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="site-footer__col-head">Company</p>
            <nav className="site-footer__nav">
              {[['/how-it-works','How It Works'],['/contact','Contact Us'],['/terms','Terms & Conditions'],['/privacy','Privacy Policy']].map(([href,label]) => (
                <Link key={label} href={href} className="site-footer__link">{label}</Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="site-footer__divider"><StarDivider dark /></div>

        <div className="site-footer__pay">
          <span className="site-footer__pay-label">Payments Accepted</span>
          <div className="site-footer__pay-cards">
            <span className="pay-card" aria-label="Visa" role="img">
              <svg width="40" height="13" viewBox="0 0 40 13" aria-hidden="true">
                <text x="0" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="700" fontStyle="italic" fill="#1434CB" letterSpacing="1.5">VISA</text>
              </svg>
            </span>
            <span className="pay-card" aria-label="Mastercard" role="img">
              <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true">
                <circle cx="13" cy="11" r="8.5" fill="#EB001B" />
                <circle cx="21" cy="11" r="8.5" fill="#F79E1B" />
                <path d="M17 4.3a8.5 8.5 0 0 0 0 13.4 8.5 8.5 0 0 0 0-13.4Z" fill="#FF5F00" />
              </svg>
            </span>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} Ivory Vault Competitions Ltd. All rights reserved.</p>
          <p>18+ only · UK residents · <Link href="/free-entry" className="site-footer__free">Free entry available</Link></p>
        </div>
      </div>
    </footer>
  )
}
