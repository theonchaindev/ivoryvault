'use client'

import { useEffect, useState } from 'react'

interface SentEmail {
  id: string; toAddr: string; subject: string; kind: string
  status: string; resendId: string | null; error: string | null; createdAt: string
}

const fmt = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusPill(status: string) {
  const map: Record<string, { bg: string; c: string; label: string }> = {
    sent: { bg: '#dcfce7', c: '#15803d', label: 'Sent' },
    error: { bg: '#fee2e2', c: '#b91c1c', label: 'Failed' },
    skipped: { bg: '#f1f5f9', c: '#64748b', label: 'Skipped' },
  }
  const s = map[status] || { bg: '#eef2ff', c: '#4338ca', label: status }
  return <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.2rem .5rem', borderRadius: '999px', background: s.bg, color: s.c, whiteSpace: 'nowrap' }}>{s.label}</span>
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<SentEmail[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/emails')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load')))
      .then(d => { setEmails(d.emails || []); setTotal(d.total || 0) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = q.trim()
    ? emails.filter(e => `${e.toAddr} ${e.subject} ${e.kind}`.toLowerCase().includes(q.toLowerCase()))
    : emails

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Emails</h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
            Every email the site has sent through Resend — order confirmations, winner emails, referrals and more. Newest first.
          </p>
        </div>
        <button onClick={load} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '9px', padding: '.6rem 1.1rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Refresh</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search recipient or subject…"
          style={{ flex: 1, minWidth: '220px', padding: '.6rem .8rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '9px', fontSize: '.85rem' }}
        />
        <span style={{ fontSize: '.78rem', color: 'var(--ink3)' }}>{total.toLocaleString()} total{q.trim() ? ` · ${filtered.length} shown` : ''}</span>
      </div>

      {err && <p style={{ color: '#b91c1c', fontSize: '.85rem' }}>{err}</p>}

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>
            {emails.length === 0 ? 'No emails logged yet. Emails sent from now on will appear here.' : 'No emails match your search.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <thead>
                <tr>
                  {['Recipient', 'Subject', 'Status', 'Sent'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '.85rem 1.25rem', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{e.toAddr || '—'}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink2)' }}>
                      {e.subject || '—'}
                      {e.error && <div style={{ fontSize: '.68rem', color: '#b91c1c', marginTop: '.2rem' }}>{e.error}</div>}
                    </td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>{statusPill(e.status)}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{fmt(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
