'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SOCIAL } from '@/lib/social'

const ease = [0.22, 1, 0.36, 1] as const
const spring = { type: 'spring', stiffness: 350, damping: 28 } as const

const INFO = [
  { icon: '✉', label: 'Email', value: 'support@ivoryvaultcompetitions.co.uk' },
  { icon: '⏱', label: 'Response Time', value: 'Within 24 hours' },
  { icon: '📍', label: 'Address', value: '68 Laburnum Crescent, Northampton, NN3 2LF' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to send message')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="cp">
      {/* Hero */}
      <section className="cp__hero">
        <div className="cp__inner">
          <motion.p className="cp__label" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }}>
            Get in Touch
          </motion.p>
          <motion.h1 className="cp__title" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease, delay: 0.2 }}>
            Contact Us
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <div className="cp__body">
        <div className="cp__grid">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
          >
            <h2 className="cp__info-title">We&apos;d love to hear from you</h2>
            <p className="cp__info-body">
              Whether you have a question about a competition, need help with your account, or just want to say hello — our team is here to help.
            </p>
            <div className="cp__contacts">
              {INFO.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="cp__contact-item"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.4 + i * 0.1 }}
                >
                  <span className="cp__contact-icon">{item.icon}</span>
                  <div>
                    <p className="cp__contact-label">{item.label}</p>
                    <p className="cp__contact-val">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="cp__social">
              <p className="cp__social-label">Follow Us</p>
              <div className="cp__social-icons">
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Ivory Vault on Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.53-1.5H16.7V4.7c-.3 0-1.32-.1-2.5-.1-2.47 0-4.16 1.5-4.16 4.28v2.02H7.3V14h2.74v8h3.46Z"/></svg>
                </a>
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Ivory Vault on Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            <div className="cp__form-card">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    className="cp__success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <motion.div
                      className="cp__success-icon"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.15 }}
                    >
                      ✓
                    </motion.div>
                    <h3 className="cp__success-title">Message Sent</h3>
                    <p className="cp__success-sub">Thank you for reaching out. We&apos;ll be in touch within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="cp__form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="cp__form-2col">
                      <div>
                        <label className="cp__field-label">Name</label>
                        <input type="text" className="iv-input" placeholder="Your name" value={form.name} onChange={set('name')} required />
                      </div>
                      <div>
                        <label className="cp__field-label">Email</label>
                        <input type="email" className="iv-input" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
                      </div>
                    </div>
                    <div>
                      <label className="cp__field-label">Subject</label>
                      <input type="text" className="iv-input" placeholder="What is this about?" value={form.subject} onChange={set('subject')} />
                    </div>
                    <div>
                      <label className="cp__field-label">Message</label>
                      <textarea className="iv-input" placeholder="Your message..." rows={6} value={form.message} onChange={set('message')} required style={{ resize: 'vertical' }} />
                    </div>

                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          className="cp__error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      className="btn-primary cp__submit"
                      disabled={status === 'loading'}
                      whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                      whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                      transition={spring}
                      style={{ opacity: status === 'loading' ? 0.7 : 1 }}
                    >
                      {status === 'loading' ? (
                        <span className="cp__spinner-row"><span className="cp__spinner" /> Sending...</span>
                      ) : 'Send Message'}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .cp { background: var(--off); min-height: calc(100vh - 68px); }
        .cp__hero { background: #fff; border-bottom: 1px solid var(--border); padding: clamp(5rem,8vw,8rem) 2rem clamp(3rem,5vw,4rem); }
        .cp__inner { max-width: 1280px; margin: 0 auto; }
        .cp__label { font-size: .5875rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .875rem; }
        .cp__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5rem); font-weight: 700; color: var(--ink); line-height: .95; letter-spacing: -.02em; }
        .cp__body { max-width: 1280px; margin: 0 auto; padding: clamp(3rem,6vw,5rem) 2rem clamp(4rem,8vw,7rem); }
        .cp__grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.6fr); gap: clamp(3rem,5vw,5rem); align-items: start; }
        .cp__info-title { font-family: var(--font-cormorant,serif); font-size: clamp(1.5rem,3vw,2rem); font-weight: 400; color: var(--ink); margin-bottom: 1.25rem; }
        .cp__info-body { font-size: .9rem; color: var(--ink2); line-height: 1.8; margin-bottom: 2.5rem; }
        .cp__social { margin-top: 2.5rem; }
        .cp__social-label { font-size: .5875rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink3); font-weight: 700; margin-bottom: .875rem; }
        .cp__social-icons { display: flex; gap: .75rem; }
        .cp__social-icons a { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 50%; color: var(--ink2); transition: background .2s, border-color .2s, color .2s, transform .15s; }
        .cp__social-icons a:hover { background: var(--gold); border-color: var(--gold); color: #fff; transform: translateY(-2px); }
        .cp__contacts { display: flex; flex-direction: column; gap: 1.75rem; }
        .cp__contact-item { display: flex; gap: 1rem; align-items: flex-start; }
        .cp__contact-icon { font-size: 1.25rem; margin-top: 2px; flex-shrink: 0; }
        .cp__contact-label { font-size: .625rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); margin-bottom: .2rem; }
        .cp__contact-val { font-size: .9375rem; color: var(--ink); }
        .cp__form-card { background: #fff; border: 1px solid var(--border); padding: 2.5rem; }
        .cp__form { display: flex; flex-direction: column; gap: 1.25rem; }
        .cp__form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .cp__field-label { display: block; font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2); margin-bottom: .5rem; }
        .cp__error { padding: .75rem 1rem; background: rgba(184,104,122,.08); border: 1px solid rgba(184,104,122,.2); color: #8a4f58; font-size: .85rem; overflow: hidden; }
        .cp__submit { width: 100%; }
        .cp__spinner-row { display: flex; align-items: center; justify-content: center; gap: .5rem; }
        .cp__spinner { display: inline-block; width: 14px; height: 14px; border: 1.5px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: cp-spin .6s linear infinite; }
        @keyframes cp-spin { to { transform: rotate(360deg); } }
        .cp__success { padding: 2rem; text-align: center; }
        .cp__success-icon { width: 52px; height: 52px; border: 1px solid var(--rg); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--rg); font-size: 1.5rem; }
        .cp__success-title { font-family: var(--font-cormorant,serif); font-size: 1.625rem; color: var(--ink); margin-bottom: .5rem; }
        .cp__success-sub { font-size: .875rem; color: var(--ink3); line-height: 1.6; }
        @media (max-width: 800px) { .cp__grid { grid-template-columns: 1fr; } .cp__form-2col { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
