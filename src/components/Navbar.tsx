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
            <Image src="/logo.png" alt="Ivory Vault" width={68} height={68} className="nav__logo-img" priority />
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

          {/* Basket — always visible (sits outside the burger menu on mobile) */}
          <Link href="/account" className="nav__basket" aria-label="Basket">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18l-1.5 12.5a2 2 0 0 1-2 1.75H6.5a2 2 0 0 1-2-1.75L3 6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M8.5 9V5.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Link>

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
                {[{ href: '/', label: 'Home' }, ...NAV].map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="nav__drawer-link">{l.label}</Link>
                  </motion.div>
                ))}
              </nav>
              <div className="nav__drawer-footer">
                {user
                  ? <Link href="/account" className="btn-dark" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>My Account</Link>
                  : <>
                      <Link href="/signup" className="btn-gold" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Join Free</Link>
                      <Link href="/btn-outline" className="btn-outline" onClick={() => setOpen(false)} style={{ textAlign: 'center' }}>Sign In</Link>
                    </>
                }
              </div>
            </motion.div>
            <motion.div className="nav__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
