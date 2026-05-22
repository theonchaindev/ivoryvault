'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface User { id: string; name: string; email: string; role: string }

const links = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/winners', label: 'Winners' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.user && setUser(d.user))
      .catch(() => {})
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.4s ease',
          backgroundColor: scrolled ? 'rgba(250,245,238,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #e2d0c0' : '1px solid transparent',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 2.5rem',
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.375rem',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  color: '#141210',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Ivory
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.375rem',
                  fontWeight: 300,
                  letterSpacing: '0.22em',
                  color: '#b76e79',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Vault
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.75rem',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            className="iv-desktop-nav"
          >
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.6875rem',
                  fontWeight: 400,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: '#4a423c',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a423c')}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="iv-desktop-nav">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b76e79', textDecoration: 'none', fontWeight: 500 }}>
                    Admin
                  </Link>
                )}
                <Link href="/account" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a423c', textDecoration: 'none', fontWeight: 400 }} onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')} onMouseLeave={e => (e.currentTarget.style.color = '#4a423c')}>
                  Account
                </Link>
                <button className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.625rem' }} onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a423c', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')} onMouseLeave={e => (e.currentTarget.style.color = '#4a423c')}>
                  Sign In
                </Link>
                <Link href="/signup" className="btn-rg" style={{ padding: '0.5625rem 1.375rem', fontSize: '0.625rem' }}>
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="iv-burger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'none' }}
            aria-label="Menu"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '22px' }}>
              <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 9 : 0 }} style={{ display: 'block', width: '100%', height: '1px', background: '#141210', transformOrigin: 'center' }} />
              <motion.span animate={{ opacity: open ? 0 : 1 }} style={{ display: 'block', width: '100%', height: '1px', background: '#141210' }} />
              <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -9 : 0 }} style={{ display: 'block', width: '100%', height: '1px', background: '#141210', transformOrigin: 'center' }} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(340px, 90vw)',
              backgroundColor: '#faf5ee',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              padding: '5rem 2.5rem 3rem',
              borderLeft: '1px solid #e2d0c0',
            }}
          >
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#141210', lineHeight: 1 }}>
              ✕
            </button>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {links.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '2.25rem',
                      fontWeight: 300,
                      color: '#141210',
                      textDecoration: 'none',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid #e2d0c0',
                      lineHeight: 1.2,
                    }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user ? (
                <Link href="/account" className="btn-outline" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>My Account</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn-rg" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Join Free</Link>
                  <Link href="/login" className="btn-outline" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Sign In</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,18,16,0.4)', zIndex: 199 }} />
      )}

      <style>{`
        @media (max-width: 900px) {
          .iv-desktop-nav { display: none !important; }
          .iv-burger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
