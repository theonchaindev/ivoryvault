'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#1c1a18',
        color: '#9a8878',
        marginTop: 'auto',
      }}
    >
      {/* Rose gold accent line */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #b76e79, #d4959e, #b76e79, transparent)',
        }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem 2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  color: '#fdf6ef',
                }}
              >
                IVORY VAULT
              </span>
              <div
                style={{
                  height: '1px',
                  width: '80px',
                  background: 'linear-gradient(90deg, #b76e79, transparent)',
                  marginTop: '4px',
                }}
              />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: '#9a8878',
                marginBottom: '1rem',
              }}
            >
              Where luxury meets chance
            </p>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.7, color: '#5c524a' }}>
              Premium prize competitions. 100% transparent draws. UK-based and fully compliant.
            </p>
          </div>

          {/* Competitions */}
          <div>
            <h4
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#b76e79',
                marginBottom: '1.25rem',
                fontWeight: 500,
              }}
            >
              Competitions
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/competitions', label: 'All Competitions' },
                { href: '/competitions?category=watches', label: 'Watches & Jewellery' },
                { href: '/competitions?category=cash', label: 'Cash Prizes' },
                { href: '/competitions?category=electronics', label: 'Electronics' },
                { href: '/winners', label: 'Past Winners' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.85rem',
                    color: '#5c524a',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5c524a')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#b76e79',
                marginBottom: '1.25rem',
                fontWeight: 500,
              }}
            >
              Company
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/free-entry', label: 'Free Entry Route' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.85rem',
                    color: '#5c524a',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5c524a')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#b76e79',
                marginBottom: '1.25rem',
                fontWeight: 500,
              }}
            >
              Legal
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/free-entry', label: 'Free Entry' },
                { href: '/contact', label: 'Privacy Policy' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.85rem',
                    color: '#5c524a',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5c524a')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                border: '1px solid #2a2826',
                display: 'inline-block',
              }}
            >
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b76e79' }}>
                UK Competition Law Compliant
              </p>
              <p style={{ fontSize: '0.7rem', color: '#5c524a', marginTop: '0.25rem' }}>
                No purchase necessary. 18+ only.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #2a2826',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: '#5c524a' }}>
            © 2025 Ivory Vault. All rights reserved.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#5c524a' }}>
            Must be 18 or over to enter. Please play responsibly.{' '}
            <Link href="/free-entry" style={{ color: '#b76e79', textDecoration: 'none' }}>
              Free entry available
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
