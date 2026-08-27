'use client'

import { useState } from 'react'

export interface Win {
  id: string; competitionTitle: string; competitionSlug: string
  prizeTitle: string | null; prizeValue: number | null; drawnAt: string; claimed: boolean
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1b2432 0%, #131a26 100%)',
  border: '1px solid rgba(194,162,78,0.5)', borderRadius: '14px', padding: '1.1rem 1.25rem',
  boxShadow: '0 10px 30px rgba(19,26,38,0.25)',
}
const input: React.CSSProperties = { width: '100%', padding: '.6rem .7rem', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'inherit', color: '#fff', background: 'rgba(255,255,255,0.06)' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '.3rem' }

export default function WinClaim({ win }: { win: Win }) {
  const [claimed, setClaimed] = useState(win.claimed)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ fullName: '', addressLine1: '', addressLine2: '', city: '', postcode: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async () => {
    setErr('')
    if (!f.fullName.trim() || !f.addressLine1.trim() || !f.city.trim() || !f.postcode.trim()) { setErr('Please fill in your name and full address.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/account/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId: win.id, ...f }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to submit'); return }
      setClaimed(true); setOpen(false)
    } catch { setErr('Something went wrong') }
    finally { setBusy(false) }
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>🏆</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c2a24e', marginBottom: '0.2rem' }}>You&rsquo;re a winner!</p>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{win.prizeTitle || win.competitionTitle}</p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>
            Won {new Date(win.drawnAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            {win.prizeValue ? ` · worth £${win.prizeValue.toLocaleString()}` : ''}
          </p>
        </div>
        {claimed
          ? <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Claimed</span>
          : <button onClick={() => setOpen(o => !o)} style={{ background: '#c2a24e', color: '#1b2432', border: 'none', borderRadius: '8px', padding: '.55rem 1rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.04em', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Claim prize →</button>}
      </div>

      {claimed && !open && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
          Delivery details received — our team will be in touch to arrange your prize. 🎁
        </p>
      )}

      {open && !claimed && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Enter your delivery address to claim your prize.</p>
          <div><span style={lbl}>Full name</span><input style={input} value={f.fullName} onChange={set('fullName')} placeholder="Your full name" /></div>
          <div><span style={lbl}>Address line 1</span><input style={input} value={f.addressLine1} onChange={set('addressLine1')} placeholder="House number and street" /></div>
          <div><span style={lbl}>Address line 2 (optional)</span><input style={input} value={f.addressLine2} onChange={set('addressLine2')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div><span style={lbl}>Town / city</span><input style={input} value={f.city} onChange={set('city')} /></div>
            <div><span style={lbl}>Postcode</span><input style={input} value={f.postcode} onChange={set('postcode')} /></div>
          </div>
          <div><span style={lbl}>Phone (optional)</span><input style={input} value={f.phone} onChange={set('phone')} type="tel" /></div>
          {err && <p style={{ color: '#fca5a5', fontSize: '.8rem' }}>{err}</p>}
          <div>
            <button onClick={submit} disabled={busy} style={{ background: '#c2a24e', color: '#1b2432', border: 'none', borderRadius: '8px', padding: '.65rem 1.4rem', fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: busy ? .7 : 1 }}>
              {busy ? 'Submitting…' : 'Submit & claim'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
