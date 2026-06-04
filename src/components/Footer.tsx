import Link from 'next/link'
import Image from 'next/image'

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
                <span className="site-footer__logo-sub">Luxury Rewards. Elevated.</span>
              </div>
            </div>
            <p className="site-footer__tagline">Where luxury meets chance</p>
            <p className="site-footer__desc">Premium prize competitions for watches, cash & electronics. UK regulated, fully transparent draws.</p>
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

        <div className="site-footer__bottom">
          <p>© {year} Ivory Vault Ltd. All rights reserved.</p>
          <p>18+ only · UK residents · <Link href="/free-entry" className="site-footer__free">Free entry available</Link></p>
        </div>
      </div>
    </footer>
  )
}
