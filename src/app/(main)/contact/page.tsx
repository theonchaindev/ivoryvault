'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
    <div style={{ backgroundColor: '#fdf6ef', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid #e8d8cc', backgroundColor: '#fffcf9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b76e79', marginBottom: '0.75rem' }}>
            Get in Touch
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 600,
              color: '#1c1a18',
            }}
          >
            Contact Us
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '5rem', alignItems: 'start' }}>
          {/* Info */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#1c1a18',
                marginBottom: '1.5rem',
              }}
            >
              We&apos;d love to hear from you
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#5c524a', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Whether you have a question about a competition, need help with your account, or just want to say hello — our team is here to help.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                {
                  icon: '✉',
                  label: 'Email',
                  value: 'hello@ivoryvault.co.uk',
                },
                {
                  icon: '⏱',
                  label: 'Response Time',
                  value: 'Within 24 hours',
                },
                {
                  icon: '📍',
                  label: 'Location',
                  value: 'United Kingdom',
                },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', marginTop: '2px' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', marginBottom: '0.25rem' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#1c1a18' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ backgroundColor: '#fffcf9', border: '1px solid #e8d8cc', padding: '2.5rem' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', border: '1px solid #b76e79', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#b76e79', fontSize: '1.5rem' }}>
                  ✓
                </div>
                <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: '#1c1a18', marginBottom: '0.5rem' }}>
                  Message Sent
                </h3>
                <p style={{ color: '#9a8878', fontSize: '0.9rem' }}>
                  Thank you for reaching out. We&apos;ll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                      Name
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
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                      Email
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="iv-input"
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                    Message
                  </label>
                  <textarea
                    className="iv-input"
                    placeholder="Your message..."
                    rows={6}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {status === 'error' && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)', color: '#8a4f58', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'loading'}
                  style={{ opacity: status === 'loading' ? 0.7 : 1 }}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
