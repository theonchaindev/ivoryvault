'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
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
            Welcome back
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#fffcf9',
            border: '1px solid #e8d8cc',
            padding: '2.5rem',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.875rem',
              fontWeight: 600,
              color: '#1c1a18',
              marginBottom: '0.375rem',
            }}
          >
            Sign In
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9a8878', marginBottom: '2rem' }}>
            Enter your details to access your account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="email"
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
                id="email"
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
                htmlFor="password"
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
                id="password"
                type="password"
                className="iv-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #e8d8cc', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#9a8878' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#b76e79', textDecoration: 'none', fontWeight: 500 }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
