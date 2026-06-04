import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        {/* Top row */}
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <Image src="/logo.png" alt="Ivory Vault" width={52} height={52} style={{ opacity: .9 }} />
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

          <div className="site-footer__cols">
            <div>
              <p className="site-footer__col-head">Competitions</p>
              <nav className="site-footer__nav">
                {[
                  ['/competitions', 'All Competitions'],
                  ['/competitions?category=watches', 'Watches & Jewellery'],
                  ['/competitions?category=cash', 'Cash Prizes'],
                  ['/competitions?category=electronics', 'Electronics'],
                  ['/winners', 'Past Winners'],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="site-footer__link">{label}</Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="site-footer__col-head">Company</p>
              <nav className="site-footer__nav">
                {[
                  ['/how-it-works', 'How It Works'],
                  ['/contact', 'Contact Us'],
                  ['/free-entry', 'Free Entry Route'],
                  ['/terms', 'Terms & Conditions'],
                  ['/free-entry', 'Privacy Policy'],
                ].map(([href, label]) => (
                  <Link key={label} href={href} className="site-footer__link">{label}</Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="site-footer__bottom">
          <p>© {year} Ivory Vault Ltd. All rights reserved.</p>
          <p>18+ only · UK residents · <Link href="/free-entry" className="site-footer__free">Free entry available</Link></p>
        </div>
      </div>

      <style>{`
        .site-footer { background: #0a0908; color: #fff; border-top: 1px solid rgba(255,255,255,.06); }
        .site-footer__inner { max-width: 1440px; margin: 0 auto; padding: clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,5rem) 2rem; }
        .site-footer__top { display: grid; grid-template-columns: 1.75fr 1fr; gap: 4rem; margin-bottom: 3rem; }
        .site-footer__brand { display: flex; flex-direction: column; gap: .875rem; }
        .site-footer__logo { display: flex; align-items: center; gap: .875rem; margin-bottom: .25rem; }
        .site-footer__logo-text { display: flex; flex-direction: column; gap: .2rem; }
        .site-footer__logo-text span:first-child { font-size: .5625rem; font-weight: 700; letter-spacing: .28em; color: rgba(255,255,255,.9); }
        .site-footer__logo-sub { font-size: .45rem; letter-spacing: .18em; text-transform: uppercase; color: var(--rg); }
        .site-footer__tagline { font-family: var(--font-cormorant,serif); font-style: italic; font-size: 1rem; color: rgba(255,255,255,.35); }
        .site-footer__desc { font-size: .8125rem; line-height: 1.75; color: rgba(255,255,255,.3); max-width: 360px; }
        .site-footer__badge { display: inline-flex; align-items: center; gap: .5rem; border: 1px solid rgba(184,104,122,.3); padding: .5rem .875rem; font-size: .5625rem; letter-spacing: .16em; text-transform: uppercase; color: var(--rg,#b8687a); width: fit-content; }
        .site-footer__badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--rg,#b8687a); flex-shrink: 0; }
        .site-footer__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .site-footer__col-head { font-size: .5rem; letter-spacing: .22em; text-transform: uppercase; color: rgba(255,255,255,.25); margin-bottom: 1.25rem; }
        .site-footer__nav { display: flex; flex-direction: column; gap: .75rem; }
        .site-footer__link { font-size: .8125rem; color: rgba(255,255,255,.45); text-decoration: none; transition: color .2s; }
        .site-footer__link:hover { color: #fff; }
        .site-footer__bottom { border-top: 1px solid rgba(255,255,255,.06); padding-top: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: .6875rem; color: rgba(255,255,255,.2); }
        .site-footer__free { color: rgba(184,104,122,.6); text-decoration: none; transition: color .2s; }
        .site-footer__free:hover { color: var(--rg,#b8687a); }
        @media (max-width: 768px) { .site-footer__top { grid-template-columns: 1fr; gap: 2.5rem; } .site-footer__cols { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </footer>
  )
}
