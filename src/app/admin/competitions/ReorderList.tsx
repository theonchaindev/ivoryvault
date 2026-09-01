'use client'

import { useState } from 'react'

export interface ReorderItem { id: string; title: string; drawDate: string | null; kind: 'comp' | 'game'; status: string }

export default function ReorderList({ items: initial }: { items: ReorderItem[] }) {
  const [items, setItems] = useState<ReorderItem[]>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [dirty, setDirty] = useState(false)

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    setItems(a => { const n = [...a];[n[i], n[j]] = [n[j], n[i]]; return n })
    setDirty(true); setMsg('')
  }

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/admin/listing-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: items.map(i => i.id) }) })
      if (!res.ok) throw new Error('failed')
      setMsg('Saved — the homepage and competitions page now use this order.'); setDirty(false); setTimeout(() => setMsg(''), 4000)
    } catch { setMsg('Could not save the order.') }
    finally { setSaving(false) }
  }

  const resetToTime = async () => {
    if (!confirm('Reset to automatic time order (earliest finishing first)?')) return
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/admin/listing-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [] }) })
      if (!res.ok) throw new Error('failed')
      setMsg('Reset — back to automatic time order.'); setDirty(false); setTimeout(() => { location.reload() }, 900)
    } catch { setMsg('Could not reset.') }
    finally { setSaving(false) }
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'No end date'

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0', padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)' }}>Homepage &amp; listing order</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '.8rem', marginTop: '.2rem', maxWidth: '640px' }}>Drag with the arrows to set the order competitions, ticket-win and instant-win games appear on the homepage and competitions page. Anything you don&rsquo;t move stays in time order (earliest finishing first).</p>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <button onClick={resetToTime} disabled={saving} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '.6rem 1rem', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink3)' }}>Reset to time order</button>
          <button onClick={save} disabled={saving || !dirty} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '.6rem 1.4rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: saving || !dirty ? .5 : 1 }}>{saving ? 'Saving…' : 'Save order'}</button>
        </div>
      </div>
      {msg && <p style={{ fontSize: '.8rem', color: '#15803d', marginBottom: '.75rem' }}>{msg}</p>}
      {items.length === 0
        ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>Nothing is currently shown on the site to order.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {items.map((it, i) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', border: '1px solid var(--border)', borderRadius: '8px', padding: '.5rem .75rem' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink3)', fontSize: '.8rem', width: '22px' }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '.88rem' }}>{it.title}</span>
                    <span style={{ fontSize: '.55rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.15rem .45rem', borderRadius: '999px', background: it.kind === 'game' ? '#eef2ff' : '#f1f5f9', color: it.kind === 'game' ? '#4338ca' : '#64748b' }}>{it.kind === 'game' ? 'Game' : 'Comp'}</span>
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '1px' }}>Ends {fmt(it.drawDate)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} style={{ width: '30px', height: '22px', border: '1px solid var(--border)', borderRadius: '6px', background: '#fff', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? .4 : 1, fontFamily: 'inherit', lineHeight: 1 }}>▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={{ width: '30px', height: '22px', border: '1px solid var(--border)', borderRadius: '6px', background: '#fff', cursor: i === items.length - 1 ? 'default' : 'pointer', opacity: i === items.length - 1 ? .4 : 1, fontFamily: 'inherit', lineHeight: 1 }}>▼</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
