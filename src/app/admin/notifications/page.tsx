'use client'

import { useEffect, useState } from 'react'

interface WinNotification { id: string; type: 'draw' | 'instant' | 'spin'; when: string; name: string; email: string; prize: string; source: string }

const SEEN_KEY = 'ivv-admin-wins-seen'

const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function typeBadge(t: WinNotification['type']) {
  const map = {
    draw: { bg: '#fef3c7', c: '#92400e', label: 'Draw winner', icon: '🏆' },
    instant: { bg: '#dcfce7', c: '#15803d', label: 'Instant win', icon: '🎟' },
    spin: { bg: '#eef2ff', c: '#4338ca', label: 'Spin win', icon: '🎡' },
  } as const
  const s = map[t]
  return <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', padding: '.2rem .5rem', borderRadius: '999px', background: s.bg, color: s.c, whiteSpace: 'nowrap' }}>{s.icon} {s.label}</span>
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<WinNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [seen, setSeen] = useState<string>('')

  useEffect(() => {
    // read previous "seen" marker before marking now as seen
    try { setSeen(localStorage.getItem(SEEN_KEY) || '') } catch { /* ignore */ }
    fetch('/api/admin/notifications')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load')))
      .then(d => {
        setItems(d.items || [])
        // mark everything up to the latest as seen now
        try { if (d.latest) localStorage.setItem(SEEN_KEY, d.latest) } catch { /* ignore */ }
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  const newCount = seen ? items.filter(i => i.when > seen).length : 0

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
          Notifications{newCount > 0 && <span style={{ marginLeft: '.6rem', fontSize: '.8rem', fontWeight: 700, color: '#fff', background: '#dc2626', borderRadius: '999px', padding: '.15rem .55rem', verticalAlign: 'middle' }}>{newCount} new</span>}
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
          Everyone who&apos;s won something — competition draws, instant-win tickets and spin wins. Newest first.
        </p>
      </div>

      {err && <p style={{ color: '#b91c1c', fontSize: '.85rem' }}>{err}</p>}

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>No wins yet. When someone wins a prize it&apos;ll appear here.</div>
        ) : (
          <div>
            {items.map(i => {
              const isNew = !!seen && i.when > seen
              return (
                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: isNew ? 'rgba(220,38,38,.035)' : 'transparent' }}>
                  {isNew && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} aria-label="new" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.9rem', color: 'var(--ink)' }}>
                      <b>{i.name}</b> won <b style={{ color: 'var(--gold,#2563eb)' }}>{i.prize}</b>
                    </div>
                    <div style={{ fontSize: '.74rem', color: 'var(--ink3)', marginTop: '.15rem' }}>
                      {i.source}{i.email ? ` · ${i.email}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.35rem', flexShrink: 0 }}>
                    {typeBadge(i.type)}
                    <span title={fmt(i.when)} style={{ fontSize: '.72rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{ago(i.when)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
