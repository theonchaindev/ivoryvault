'use client'

import { useEffect, useState, useCallback } from 'react'

interface Comp { id: string; title: string; type: string; ticketsSold: number; status: string }
interface Entrant { name: string; email: string; entries: number; first: string }

const date = (s: string) => new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function EntrantsViewer() {
  const [comps, setComps] = useState<Comp[]>([])
  const [selected, setSelected] = useState('')
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [summary, setSummary] = useState<{ entrantCount: number; totalEntries: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/entrants/data').then(r => r.json()).then(d => { if (d.competitions) setComps(d.competitions) }).catch(() => {})
  }, [])

  const load = useCallback((id: string) => {
    setSelected(id); setEntrants([]); setSummary(null)
    if (!id) return
    setLoading(true)
    fetch(`/api/entrants/data?competitionId=${id}`)
      .then(r => r.json())
      .then(d => { setEntrants(d.entrants || []); setSummary({ entrantCount: d.entrantCount || 0, totalEntries: d.totalEntries || 0 }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const th: React.CSSProperties = { textAlign: 'left', padding: '.75rem 1rem', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)' }
  const td: React.CSSProperties = { padding: '.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 'clamp(1.5rem,4vw,3rem)', fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-cinzel), Georgia, serif', fontSize: '1.4rem', letterSpacing: '.14em', color: 'var(--ink)' }}>IVORY VAULT</div>
          <p style={{ color: 'var(--ink3)', fontSize: '.85rem', marginTop: '.25rem' }}>Competition entrants — read only</p>
        </div>

        <select value={selected} onChange={e => load(e.target.value)}
          style={{ width: '100%', maxWidth: '460px', padding: '.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', fontSize: '.9rem', fontFamily: 'inherit', marginBottom: '1.25rem' }}>
          <option value="">Select a competition…</option>
          {comps.map(c => (
            <option key={c.id} value={c.id}>{c.title}{c.status !== 'active' ? ` (${c.status})` : ''}</option>
          ))}
        </select>

        {summary && (
          <p style={{ color: 'var(--ink2)', fontSize: '.85rem', marginBottom: '.75rem' }}>
            <b>{summary.entrantCount}</b> entrant{summary.entrantCount === 1 ? '' : 's'} · <b>{summary.totalEntries}</b> total entries
          </p>
        )}

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</div>
          ) : !selected ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>Choose a competition above to see who&apos;s entered.</div>
          ) : entrants.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>No entrants yet for this competition.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Entries</th>
                  <th style={th}>First entry</th>
                </tr>
              </thead>
              <tbody>
                {entrants.map((e, i) => (
                  <tr key={i}>
                    <td style={{ ...td, color: 'var(--ink)', fontWeight: 500 }}>{e.name}</td>
                    <td style={{ ...td, color: 'var(--ink3)', fontFamily: 'monospace', fontSize: '.78rem' }}>{e.email}</td>
                    <td style={{ ...td, color: 'var(--ink)', fontWeight: 600 }}>{e.entries}</td>
                    <td style={{ ...td, color: 'var(--ink3)', fontSize: '.78rem' }}>{date(e.first)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ color: 'var(--ink3)', fontSize: '.7rem', marginTop: '1.25rem' }}>
          Emails are partially masked for privacy. This page is read-only and shared under a separate access password.
        </p>
      </div>
    </div>
  )
}
