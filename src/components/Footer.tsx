import Link from 'next/link'

const col1 = [
  { href: '/competitions', label: 'All Competitions' },
  { href: '/competitions?category=watches', label: 'Watches & Jewellery' },
  { href: '/competitions?category=cash', label: 'Cash Prizes' },
  { href: '/competitions?category=electronics', label: 'Electronics' },
  { href: '/winners', label: 'Past Winners' },
]
const col2 = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/free-entry', label: 'Free Entry Route' },
  { href: '/terms', label: 'Terms & Conditions' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0e0c0a', color: '#faf5ee' }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #b76e79 30%, #cc8f99 50%, #b76e79 70%, transparent 100%)' }} />

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 5rem)' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '3.5rem' }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '0.2em', color: '#faf5ee', textTransform: 'uppercase' }}>Ivory</span>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.2em', color: '#b76e79', textTransform: 'uppercase' }}>Vault</span>
              </div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontStyle: 'italic', color: 'rgba(250,245,238,0.4)', lineHeight: 1.5 }}>
                Where luxury meets chance
              </p>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: 'rgba(250,245,238,0.35)', maxWidth: '340px' }}>
              Premium prize competitions for watches, cash & electronics. Fully transparent draws, UK regulated, no purchase necessary to enter.
            </p>
            <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 1rem', border: '1px solid rgba(183,110,121,0.3)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b76e79', flexShrink: 0 }} />
              <span style={{ fontSize: '0.5625rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b76e79' }}>UK Competition Law Compliant</span>
            </div>
          </div>

          {/* Competitions */}
          <div>
            <p style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,245,238,0.35)', marginBottom: '1.5rem' }}>Competitions</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {col1.map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,245,238,0.35)', marginBottom: '1.5rem' }}>Company</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {col2.map(l => (
                <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(250,245,238,0.07)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(250,245,238,0.25)', letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} Ivory Vault Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(250,245,238,0.25)' }}>
            18+ only · Must be UK resident ·{' '}
            <Link href="/free-entry" style={{ color: 'rgba(183,110,121,0.7)', textDecoration: 'none' }}>Free entry available</Link>
          </p>
        </div>
      </div>

      <style>{`
        .footer-link { font-size: 0.8125rem; color: rgba(250,245,238,0.55); text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: #faf5ee; }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}
