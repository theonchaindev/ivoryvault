'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const
const spring = { type: 'spring', stiffness: 350, damping: 28 } as const

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>✅</div>
        <h1 className="auth-h1">Password updated</h1>
        <p className="auth-sub" style={{ marginBottom: '1.5rem' }}>Your password has been reset. Redirecting you to sign in…</p>
        <Link href="/login" className="auth-foot-link">Sign in now →</Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 className="auth-h1">Invalid link</h1>
        <p className="auth-sub" style={{ marginBottom: '1.5rem' }}>This reset link is missing or malformed. Please request a new one.</p>
        <Link href="/forgot-password" className="auth-foot-link">Request a new link →</Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="auth-h1">Set a New Password</h1>
      <p className="auth-sub">Choose a strong password you haven&apos;t used before</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label htmlFor="password" className="auth-label">New Password</label>
          <input id="password" type="password" className="iv-input" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
        </div>
        <div>
          <label htmlFor="confirm" className="auth-label">Confirm Password</label>
          <input id="confirm" type="password" className="iv-input" placeholder="••••••••" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button type="submit" className="btn-primary auth-btn" disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} transition={spring}
          style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? <span className="auth-spinner-row"><span className="auth-spinner" /> Updating...</span> : 'Update Password'}
        </motion.button>
      </form>

      <div className="auth-divider">
        <p className="auth-foot-text">
          <Link href="/login" className="auth-foot-link">← Back to sign in</Link>
        </p>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <motion.div className="auth-wrap" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease }}>
        <motion.div className="auth-logo" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }}>
          <Link href="/" className="auth-logo__link">IVORY VAULT</Link>
          <div className="auth-logo__rule" />
          <p className="auth-logo__tagline">Secure your account</p>
        </motion.div>

        <motion.div className="auth-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Suspense fallback={<p className="auth-sub">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </motion.div>
      </motion.div>

      <style>{AUTH_CSS}</style>
    </div>
  )
}

const AUTH_CSS = `
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
`
