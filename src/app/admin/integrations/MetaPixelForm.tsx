'use client'

import { useState } from 'react'

export default function MetaPixelForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const save = async () => {
    setBusy(true); setMsg(''); setErr('')
    try {
      const res = await fetch('/api/admin/settings/meta-pixel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Save failed'); return }
      setSaved(data.pixelId || '')
      setValue(data.pixelId || '')
      setMsg(data.pixelId ? `Saved — pixel ${data.pixelId} is now live (after cookie consent).` : 'Meta Pixel cleared / disabled.')
    } catch { setErr('Something went wrong') }
    finally { setBusy(false) }
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Paste your Meta Pixel ID (e.g. 123456789012345) or the full Meta base code…"
        rows={4}
        style={{ width: '100%', padding: '.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.78rem', fontFamily: 'monospace', resize: 'vertical', color: 'var(--ink)' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={save}
          disabled={busy}
          style={{ padding: '.6rem 1.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--gold)', color: '#fff', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'inherit', opacity: busy ? .7 : 1 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <span style={{ fontSize: '.75rem', color: 'var(--ink3)' }}>
          Current: {saved ? <b style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{saved}</b> : 'none'}
        </span>
      </div>
      {msg && <p style={{ color: '#15803d', fontSize: '.78rem', marginTop: '.6rem' }}>{msg}</p>}
      {err && <p style={{ color: '#c0392b', fontSize: '.78rem', marginTop: '.6rem' }}>{err}</p>}
      <p style={{ fontSize: '.7rem', color: 'var(--ink3)', marginTop: '.75rem', lineHeight: 1.5 }}>
        The pixel loads site-wide only after a visitor accepts analytics cookies. Clear the box and Save to disable it.
      </p>
    </div>
  )
}
