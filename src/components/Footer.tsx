import Link from 'next/link'
import Image from 'next/image'
import StarDivider from './StarDivider'

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
          </div>

          <div>
            <p className="site-footer__col-head">Competitions</p>
            <nav className="site-footer__nav">
              {[['/competitions','All Competitions'],['/winners','Past Winners'],['/free-entry','Free Entry Route']].map(([href,label]) => (
                <Link key={href} href={href} className="site-footer__link">{label}</Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="site-footer__col-head">Company</p>
            <nav className="site-footer__nav">
              {[['/how-it-works','How It Works'],['/contact','Contact Us'],['/terms','Terms & Conditions'],['/free-entry','Privacy Policy']].map(([href,label]) => (
                <Link key={label} href={href} className="site-footer__link">{label}</Link>
              ))}
            </nav>
          </div>
        </div>

        <div style={{ margin: '0 0 1.75rem' }}><StarDivider dark /></div>

        <div className="site-footer__bottom">
          <p>© {year} Ivory Vault Ltd. All rights reserved.</p>
          <p>18+ only · UK residents · <Link href="/free-entry" className="site-footer__free">Free entry available</Link></p>
        </div>
      </div>
    </footer>
  )
}
