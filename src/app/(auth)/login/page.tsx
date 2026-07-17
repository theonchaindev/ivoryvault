'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const
const spring = { type: 'spring', stiffness: 350, damping: 28 } as const

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      router.push('/'); router.refresh()
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
          <p className="auth-logo__tagline">Welcome back</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h1 className="auth-h1">Sign In</h1>
          <p className="auth-sub">Enter your details to access your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {[
              { id: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', key: 'email' as const },
              { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', key: 'password' as const },
            ].map((field, i) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.35 + i * 0.08 }}
              >
                <label htmlFor={field.id} className="auth-label">{field.label}</label>
                <input
                  id={field.id}
                  type={field.type}
                  className="iv-input"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  required
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

            <motion.button
              type="submit"
              className="btn-primary auth-btn"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={spring}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ opacity: loading ? 0.7 : 1, transitionProperty: 'opacity' }}
            >
              {loading ? (
                <span className="auth-spinner-row"><span className="auth-spinner" /> Signing In...</span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <div className="auth-divider">
            <p className="auth-foot-text">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="auth-foot-link">Sign up</Link>
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
        .auth-btn { width: 100%; margin-top: .25rem; }
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
