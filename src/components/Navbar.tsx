'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'

interface User { id: string; name: string; role: string }

const NAV = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/winners', label: 'Winners' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d?.user && setUser(d.user)).catch(() => {})
  }, [])

  return (
    <>
      <header className={`nav${scrolled ? ' nav--shadow' : ''}`}>
        <div className="nav__inner">

          <Link href="/" className="nav__logo">
            <Image src="/logo.png" alt="Ivory Vault" width={40} height={40} className="nav__logo-img" priority />
            <span className="nav__logo-text">IVORY VAULT</span>
          </Link>

          <nav className="nav__links">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className="nav__link">{l.label}</Link>
            ))}
          </nav>

          <div className="nav__right">
            {user ? (
              <>
                {user.role === 'admin' && <Link href="/admin" className="nav__link nav__link--gold">Admin</Link>}
                <Link href="/account" className="nav__link">Account</Link>
                <button className="nav__btn-ghost" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav__link">Sign In</Link>
                <Link href="/signup" className="nav__btn-gold">Join Free</Link>
              </>
            )}
          </div>

          <button className="nav__burger" onClick={() => setOpen(!open)} aria-label="Menu">
            <span className={open ? 'open' : ''} />
            <span className={open ? 'open' : ''} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="nav__drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: .3, ease: [.4, 0, .2, 1] }}
            >
              <button className="nav__drawer-close" onClick={() => setOpen(false)}>✕</button>
              <div className="nav__drawer-logo">
                <Image src="/logo.png" alt="Ivory Vault" width={52} height={52} />
              </div>
              <nav>
                {NAV.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="nav__drawer-link">{l.label}</Link>
                  </motion.div>
                ))}
              </nav>
              <div className="nav__drawer-footer">
                {user
                  ? <Link href="/account" className="btn-dark" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>My Account</Link>
                  : <>
                      <Link href="/signup" className="btn-rg" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Join Free</Link>
                      <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Sign In</Link>
                    </>
                }
              </div>
            </motion.div>
            <motion.div className="nav__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          </>
        )}
      </AnimatePresence>

      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: #fff;
          border-bottom: 1px solid var(--border);
          transition: box-shadow .25s;
        }
        .nav--shadow { box-shadow: 0 2px 20px rgba(0,0,0,.07); }
        .nav__inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 clamp(1.25rem,3vw,3rem); height: 68px;
          display: flex; align-items: center; gap: 2rem; justify-content: space-between;
        }
        .nav__logo { display: flex; align-items: center; gap: .625rem; text-decoration: none; flex-shrink: 0; }
        .nav__logo-img { width: 40px; height: 40px; object-fit: contain; }
        .nav__logo-text { font-family: var(--font-inter,sans-serif); font-size: .5625rem; font-weight: 700; letter-spacing: .26em; color: var(--ink); }
        .nav__links { display: flex; align-items: center; gap: 2rem; position: absolute; left: 50%; transform: translateX(-50%); }
        .nav__link { font-size: .6875rem; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; color: var(--ink2); text-decoration: none; transition: color .2s; }
        .nav__link:hover, .nav__link--gold { color: var(--rg); }
        .nav__right { display: flex; align-items: center; gap: 1rem; }
        .nav__btn-gold { background: var(--rg); color: #fff; font-size: .625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: .5625rem 1.25rem; text-decoration: none; transition: background .2s; white-space: nowrap; }
        .nav__btn-gold:hover { background: var(--rg-dark); }
        .nav__btn-ghost { background: none; border: 1px solid var(--border); color: var(--ink2); font-size: .625rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; padding: .5rem 1.125rem; cursor: pointer; transition: border-color .2s, color .2s; white-space: nowrap; }
        .nav__btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
        .nav__burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: .5rem; }
        .nav__burger span { display: block; width: 22px; height: 1.5px; background: var(--ink); transition: transform .25s, opacity .25s; transform-origin: center; }
        .nav__burger span.open:nth-child(1) { transform: rotate(45deg) translate(3px, 5px); }
        .nav__burger span.open:nth-child(2) { transform: rotate(-45deg) translate(3px, -5px); }
        .nav__drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(360px,90vw); background: #fff; z-index: 200; display: flex; flex-direction: column; padding: 5rem 2.5rem 3rem; border-left: 1px solid var(--border); }
        .nav__drawer-close { position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; cursor: pointer; font-size: 1.125rem; color: var(--ink2); }
        .nav__drawer-logo { display: flex; justify-content: center; margin-bottom: 2rem; }
        .nav__drawer-link { display: block; padding: 1rem 0; font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 300; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--border); transition: color .2s; }
        .nav__drawer-link:hover { color: var(--rg); }
        .nav__drawer-footer { margin-top: auto; display: flex; flex-direction: column; gap: .75rem; }
        .nav__overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 199; }
        @media (max-width: 900px) { .nav__links, .nav__right { display: none !important; } .nav__burger { display: flex !important; } }
      `}</style>
    </>
  )
}
