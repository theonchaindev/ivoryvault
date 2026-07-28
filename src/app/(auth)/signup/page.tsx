'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const
const spring = { type: 'spring', stiffness: 350, damping: 28 } as const

// Only allow internal redirects (e.g. /basket), never external URLs.
function safeFrom(): string {
  if (typeof window === 'undefined') return '/'
  const from = new URLSearchParams(window.location.search).get('from')
  return from && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

const fields = [
  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', key: 'name' as const },
  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', key: 'email' as const },
  { id: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '07123 456789', key: 'phone' as const },
  { id: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', key: 'password' as const },
  { id: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password', key: 'confirm' as const },
]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [fromQuery, setFromQuery] = useState('')

  // Preserve ?from across the "Sign in" link so the basket flow survives switching pages.
  useEffect(() => {
    const dest = safeFrom()
    if (dest !== '/') setFromQuery(`?from=${encodeURIComponent(dest)}`)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!agreed) { setError('Please confirm you are 18 or over and agree to the Terms and Privacy Policy'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Signup failed'); return }
      // Land back where they came from (e.g. their basket), else the homepage
      router.push(safeFrom()); router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-wrap"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease }}
      >
        {/* Logo */}
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          <Link href="/" className="auth-logo__link">IVORY VAULT</Link>
          <div className="auth-logo__rule" />
          <p className="auth-logo__tagline">Join the vault</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h1 className="auth-h1">Create Account</h1>
          <p className="auth-sub">Join thousands entering for luxury prizes</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {fields.map((field, i) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.35 + i * 0.07 }}
              >
                <label htmlFor={field.id} className="auth-label">{field.label}</label>
                <input
                  id={field.id}
                  type={field.type}
                  className="iv-input"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  required={field.key !== 'confirm'}
                />
              </motion.div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.7 }}
            >
              <label className="auth-agree">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>I confirm I am 18 or over and agree to the{' '}
                  <Link href="/terms" className="auth-terms-link">Terms &amp; Conditions</Link> and{' '}
                  <Link href="/privacy" className="auth-terms-link">Privacy Policy</Link>.
                </span>
              </label>
              <motion.button
                type="submit"
                className="btn-primary auth-btn"
                disabled={loading || !agreed}
                whileHover={!loading && agreed ? { scale: 1.02 } : {}}
                whileTap={!loading && agreed ? { scale: 0.98 } : {}}
                transition={spring}
                style={{ opacity: loading || !agreed ? 0.6 : 1, transitionProperty: 'opacity' }}
              >
                {loading ? (
                  <span className="auth-spinner-row"><span className="auth-spinner" /> Creating Account...</span>
                ) : 'Create Account'}
              </motion.button>
            </motion.div>
          </form>

          <div className="auth-divider">
            <p className="auth-foot-text">
              Already have an account?{' '}
              <Link href={`/login${fromQuery}`} className="auth-foot-link">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .auth-page { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem; min-height: calc(100vh - 68px); background: var(--off); }
        .auth-wrap { width: 100%; max-width: 440px; }
        .auth-logo { text-align: center; margin-bottom: 2.5rem; }
        .auth-logo__link { font-family: var(--font-cinzel), serif; font-size: 1.75rem; font-weight: 600; letter-spacing: .18em; color: var(--ink); text-decoration: none; }
        .auth-logo__rule { height: 1px; width: 80px; margin: .5rem auto 0; background: linear-gradient(90deg, transparent, var(--rg), transparent); }
        .auth-logo__tagline { font-family: var(--font-cormorant,serif); font-size: 1.0625rem; font-style: italic; color: var(--ink3); margin-top: .75rem; }
        .auth-card { background: #fff; border: 1px solid var(--border); padding: 2.5rem; }
        .auth-h1 { font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 400; color: var(--ink); margin-bottom: .375rem; }
        .auth-sub { font-size: .85rem; color: var(--ink3); margin-bottom: 2rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .auth-label { display: block; font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2); margin-bottom: .5rem; }
        .auth-error { padding: .75rem 1rem; background: rgba(184,104,122,.08); border: 1px solid rgba(184,104,122,.2); color: #8a4f58; font-size: .85rem; overflow: hidden; }
        .auth-btn { width: 100%; }
        .auth-terms-link { color: var(--rg); text-decoration: none; }
        .auth-terms-link:hover { text-decoration: underline; }
        .auth-agree { display: flex; align-items: flex-start; gap: .6rem; font-size: .78rem; color: var(--ink3); line-height: 1.5; margin-bottom: 1rem; cursor: pointer; }
        .auth-agree input { margin-top: .15rem; width: 16px; height: 16px; flex-shrink: 0; accent-color: var(--gold); cursor: pointer; }
        .auth-spinner-row { display: flex; align-items: center; justify-content: center; gap: .5rem; }
        .auth-spinner { display: inline-block; width: 14px; height: 14px; border: 1.5px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: auth-spin .6s linear infinite; }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-divider { border-top: 1px solid var(--border); margin-top: 2rem; padding-top: 1.5rem; text-align: center; }
        .auth-foot-text { font-size: .85rem; color: var(--ink3); }
        .auth-foot-link { color: var(--rg); text-decoration: none; font-weight: 500; }
        .auth-foot-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
