'use client'

import { useState } from 'react'

export default function CashflowsTestButton() {
  const [amount, setAmount] = useState('1.00')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const start = async () => {
    setBusy(true); setErr('')
    try {
      const res = await fetch('/api/payments/cashflows/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (!res.ok || !data.actionUrl) { setErr(data.error || 'Failed to create payment'); setBusy(false); return }
      window.location.href = data.actionUrl // → Cashflows hosted page
    } catch { setErr('Something went wrong'); setBusy(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
      <label style={{ fontSize: '.8rem', color: 'var(--ink2)' }}>
        Amount £
        <input value={amount} onChange={e => setAmount(e.target.value)}
          style={{ width: '80px', marginLeft: '.4rem', padding: '.5rem .6rem', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit' }} />
      </label>
      <button onClick={start} disabled={busy} className="btn-primary" style={{ padding: '.7rem 1.4rem', opacity: busy ? .7 : 1 }}>
        {busy ? 'Starting…' : 'Start test payment →'}
      </button>
      {err && <span style={{ color: '#c0392b', fontSize: '.82rem' }}>{err}</span>}
    </div>
  )
}
