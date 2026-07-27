'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EntrantsGate() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/entrants/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Incorrect password'); return }
      router.refresh()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', padding: '1.5rem', fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', letterSpacing: '.24em', color: '#fff' }}>IVORY VAULT</div>
        <div style={{ fontSize: '11px', letterSpacing: '.34em', color: '#c2a24e', marginTop: '6px' }}>— ENTRANTS —</div>
        <div style={{ background: '#0e1526', border: '1px solid rgba(255,255,255,.09)', borderRadius: '16px', padding: '2rem', marginTop: '1.75rem' }}>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', marginBottom: '1.25rem' }}>Enter the access password to view competition entrants.</p>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Access password" autoFocus
            style={{ width: '100%', padding: '.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,.15)', background: '#0a1122', color: '#fff', fontSize: '.9rem', fontFamily: 'inherit' }}
          />
          {error && <p style={{ color: '#ff8a8a', fontSize: '.8rem', marginTop: '.75rem' }}>{error}</p>}
          <button type="submit" disabled={loading || !password}
            style={{ width: '100%', marginTop: '1rem', padding: '.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>
            {loading ? 'Checking…' : 'View Entrants'}
          </button>
        </div>
      </form>
    </div>
  )
}
