'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

interface User { id: string; name: string; role: string }

const NAV = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/winners', label: 'Winners' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d?.user && setUser(d.user)).catch(() => {})
  }, [])

  return (
    <>
      <header className={`iv-nav ${solid ? 'iv-nav--solid' : ''}`}>
        <div className="iv-nav__inner">

          {/* Logo */}
          <Link href="/" className="iv-nav__logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="iv-nav__logo-mark">
              <rect x="1" y="1" width="20" height="20" stroke="currentColor" strokeWidth="1"/>
              <path d="M7 7 L11 15 L15 7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>IVORY VAULT</span>
          </Link>

          {/* Centre links */}
          <nav className="iv-nav__links">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className="iv-nav__link">{l.label}</Link>
            ))}
          </nav>

          {/* Right */}
          <div className="iv-nav__right">
            {user ? (
              <>
                {user.role === 'admin' && <Link href="/admin" className="iv-nav__link" style={{ color: 'var(--rg)' }}>Admin</Link>}
                <Link href="/account" className="iv-nav__link">Account</Link>
                <button className="btn-ghost" style={{ padding: '.5rem 1.125rem', fontSize: '.625rem' }} onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="iv-nav__link">Sign In</Link>
                <Link href="/signup" className="btn-rg" style={{ padding: '.5625rem 1.25rem', fontSize: '.625rem' }}>Join Free</Link>
              </>
            )}
          </div>

          {/* Burger */}
          <button className="iv-nav__burger" onClick={() => setOpen(!open)} aria-label="Menu">
            <span className={open ? 'open' : ''} />
            <span className={open ? 'open' : ''} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="iv-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: .32, ease: [.4, 0, .2, 1] }}>
              <button className="iv-drawer__close" onClick={() => setOpen(false)}>✕</button>
              <nav>
                {NAV.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="iv-drawer__link">{l.label}</Link>
                  </motion.div>
                ))}
              </nav>
              <div className="iv-drawer__footer">
                {user ? <Link href="/account" className="btn-dark" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>My Account</Link> : (
                  <>
                    <Link href="/signup" className="btn-rg" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Join Free</Link>
                    <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Sign In</Link>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div className="iv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          </>
        )}
      </AnimatePresence>

      <style>{`
        .iv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background .35s, box-shadow .35s, border-color .35s;
          border-bottom: 1px solid transparent;
        }
        .iv-nav--solid {
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-color: var(--border);
          box-shadow: 0 1px 0 var(--border);
        }
        .iv-nav__inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 2.5rem; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem;
        }
        .iv-nav__logo {
          display: flex; align-items: center; gap: .625rem;
          text-decoration: none; flex-shrink: 0; color: var(--ink);
        }
        .iv-nav__logo span {
          font-family: var(--font-inter, sans-serif);
          font-size: .625rem; font-weight: 600; letter-spacing: .25em;
          color: var(--ink);
        }
        .iv-nav__links {
          display: flex; align-items: center; gap: 2.25rem;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .iv-nav__link {
          font-size: .6875rem; font-weight: 400; letter-spacing: .1em;
          text-transform: uppercase; color: var(--ink2); text-decoration: none;
          transition: color .2s;
        }
        .iv-nav__link:hover { color: var(--rg); }
        .iv-nav__right { display: flex; align-items: center; gap: 1.25rem; }
        .iv-nav__burger {
          display: none; flex-direction: column; gap: 6px;
          background: none; border: none; cursor: pointer; padding: .5rem; width: 36px;
        }
        .iv-nav__burger span {
          display: block; width: 22px; height: 1.5px; background: var(--ink);
          transition: transform .25s, opacity .25s;
          transform-origin: center;
        }
        .iv-nav__burger span.open:nth-child(1) { transform: rotate(45deg) translate(3px, 6px); }
        .iv-nav__burger span.open:nth-child(2) { transform: rotate(-45deg) translate(3px, -6px); }

        /* Drawer */
        .iv-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: min(360px, 90vw);
          background: #fff; z-index: 200;
          display: flex; flex-direction: column;
          padding: 5rem 2.5rem 3rem;
          border-left: 1px solid var(--border);
        }
        .iv-drawer__close {
          position: absolute; top: 1.5rem; right: 1.5rem;
          background: none; border: none; cursor: pointer;
          font-size: 1.125rem; color: var(--ink2); line-height: 1;
        }
        .iv-drawer__link {
          display: block; padding: 1rem 0;
          font-family: var(--font-cormorant, serif);
          font-size: 2.25rem; font-weight: 300;
          color: var(--ink); text-decoration: none;
          border-bottom: 1px solid var(--border); line-height: 1.2;
          transition: color .2s;
        }
        .iv-drawer__link:hover { color: var(--rg); }
        .iv-drawer__footer { margin-top: auto; display: flex; flex-direction: column; gap: .75rem; }
        .iv-overlay {
          position: fixed; inset: 0;
          background: rgba(12,11,10,.45); z-index: 199;
        }

        @media (max-width: 900px) {
          .iv-nav__links, .iv-nav__right { display: none !important; }
          .iv-nav__burger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
