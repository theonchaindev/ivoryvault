'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        minHeight: 'calc(100vh - 72px)',
        backgroundColor: '#fdf6ef',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#1c1a18',
              }}
            >
              IVORY VAULT
            </span>
          </Link>
          <div
            style={{
              height: '1px',
              width: '80px',
              margin: '6px auto 0',
              background: 'linear-gradient(90deg, transparent, #b76e79, transparent)',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: '#9a8878',
              marginTop: '0.75rem',
            }}
          >
            Join the vault
          </p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#fffcf9', border: '1px solid #e8d8cc', padding: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.875rem',
              fontWeight: 600,
              color: '#1c1a18',
              marginBottom: '0.375rem',
            }}
          >
            Create Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9a8878', marginBottom: '2rem' }}>
            Join thousands entering for luxury prizes
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5c524a',
                  marginBottom: '0.5rem',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                className="iv-input"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5c524a',
                  marginBottom: '0.5rem',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                className="iv-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5c524a',
                  marginBottom: '0.5rem',
                }}
              >
                Password
              </label>
              <input
                type="password"
                className="iv-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5c524a',
                  marginBottom: '0.5rem',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="iv-input"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(183,110,121,0.08)',
                  border: '1px solid rgba(183,110,121,0.2)',
                  color: '#8a4f58',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{ fontSize: '0.75rem', color: '#9a8878', textAlign: 'center' }}>
              By signing up you agree to our{' '}
              <Link href="/terms" style={{ color: '#b76e79', textDecoration: 'none' }}>
                Terms & Conditions
              </Link>
            </p>
          </form>

          <div style={{ borderTop: '1px solid #e8d8cc', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#9a8878' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#b76e79', textDecoration: 'none', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
