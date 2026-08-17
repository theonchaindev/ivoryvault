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
          <p>© {year} Ivory Vault Ltd. All rights reserved.</p>
          <p>18+ only · UK residents · <Link href="/free-entry" className="site-footer__free">Free entry available</Link></p>
        </div>
      </div>
    </footer>
  )
}
