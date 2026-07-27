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

  return (
    <div className="ent">
      <div className="ent__inner">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-cinzel), Georgia, serif', fontSize: '1.4rem', letterSpacing: '.14em', color: 'var(--ink)' }}>IVORY VAULT</div>
          <p style={{ color: 'var(--ink3)', fontSize: '.85rem', marginTop: '.25rem' }}>Competition entrants — read only</p>
        </div>

        <select className="ent__select" value={selected} onChange={e => load(e.target.value)}>
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

        <div className="ent__card">
          {loading ? (
            <div className="ent__empty">Loading…</div>
          ) : !selected ? (
            <div className="ent__empty">Choose a competition above to see who&apos;s entered.</div>
          ) : entrants.length === 0 ? (
            <div className="ent__empty">No entrants yet for this competition.</div>
          ) : (
            <table className="ent__table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Entries</th><th>First entry</th>
                </tr>
              </thead>
              <tbody>
                {entrants.map((e, i) => (
                  <tr key={i}>
                    <td data-label="Name" className="ent__name">{e.name}</td>
                    <td data-label="Email" className="ent__email">{e.email}</td>
                    <td data-label="Entries" className="ent__entries">{e.entries}</td>
                    <td data-label="First entry" className="ent__date">{date(e.first)}</td>
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

      <style>{`
        .ent { min-height: 100vh; background: var(--bg); padding: clamp(1.25rem,4vw,3rem); font-family: var(--font-montserrat), system-ui, sans-serif; }
        .ent__inner { max-width: 820px; margin: 0 auto; }
        .ent__select { width: 100%; max-width: 460px; padding: .75rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: #fff; font-size: .9rem; font-family: inherit; margin-bottom: 1.25rem; }
        .ent__card { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .ent__empty { padding: 3rem; text-align: center; color: var(--ink3); }
        .ent__table { width: 100%; border-collapse: collapse; }
        .ent__table th { text-align: left; padding: .75rem 1rem; font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); border-bottom: 1px solid var(--border); }
        .ent__table td { padding: .75rem 1rem; border-bottom: 1px solid var(--border); font-size: .85rem; }
        .ent__name { color: var(--ink); font-weight: 500; }
        .ent__email { color: var(--ink3); font-family: monospace; font-size: .78rem; word-break: break-all; }
        .ent__entries { color: var(--ink); font-weight: 700; }
        .ent__date { color: var(--ink3); font-size: .78rem; }

        /* Mobile: stack each entrant into a labelled card so nothing is clipped */
        @media (max-width: 620px) {
          .ent__table thead { display: none; }
          .ent__table tbody tr { display: block; padding: .5rem 0; border-bottom: 6px solid var(--bg2); }
          .ent__table td { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: .4rem 1rem; border: none; text-align: right; }
          .ent__table td::before { content: attr(data-label); font-size: .6rem; letter-spacing: .08em; text-transform: uppercase; color: var(--ink3); font-weight: 700; text-align: left; }
          .ent__entries { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  )
}
