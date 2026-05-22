'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const navLinks = [
    { href: '/competitions', label: 'Competitions' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/winners', label: 'Winners' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled
          ? 'rgba(253, 246, 239, 0.97)'
          : 'rgba(253, 246, 239, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8d8cc',
        transition: 'all 0.3s ease',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.5rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#1c1a18',
                lineHeight: 1,
              }}
            >
              IVORY VAULT
            </span>
            <div
              style={{
                height: '1px',
                width: '100%',
                background: 'linear-gradient(90deg, #b76e79, #d4959e, #b76e79)',
                marginTop: '3px',
              }}
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
          }}
          className="hidden-mobile"
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
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
        </div>

        {/* Right Side */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          className="hidden-mobile"
        >
          {!loading && (
            <>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#b76e79',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#5c524a',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#5c524a')}
                  >
                    My Account
                  </Link>
                  <button
                    className="btn-outline"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' })
                      setUser(null)
                      window.location.href = '/'
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'none',
          }}
          aria-label="Toggle menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <motion.div
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
              style={{ width: '22px', height: '1.5px', background: '#1c1a18' }}
            />
            <motion.div
              animate={{ opacity: menuOpen ? 0 : 1 }}
              style={{ width: '22px', height: '1.5px', background: '#1c1a18' }}
            />
            <motion.div
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
              style={{ width: '22px', height: '1.5px', background: '#1c1a18' }}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              overflow: 'hidden',
              backgroundColor: 'rgba(253, 246, 239, 0.98)',
              borderBottom: '1px solid #e8d8cc',
            }}
          >
            <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: '#1c1a18',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid #e8d8cc', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                {user ? (
                  <Link href="/account" className="btn-outline" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.75rem', padding: '0.625rem 1.5rem' }}>
                    My Account
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn-outline" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.75rem', padding: '0.625rem 1.5rem' }}>
                      Login
                    </Link>
                    <Link href="/signup" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.75rem', padding: '0.625rem 1.5rem' }}>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  )
}
