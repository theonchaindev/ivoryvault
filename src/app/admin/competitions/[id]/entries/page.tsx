'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'

interface Entrant { userId: string; name: string; email: string; phone: string; entries: number; purchases: number; amount: number; first: string; last: string }
interface Comp { id: string; title: string; slug: string; type: string; ticketPrice: number; ticketsSold: number; maxTickets: number; status: string; drawDate: string | null }

const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const money = (v: number) => `£${v.toFixed(2)}`

export default function CompetitionEntriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [comp, setComp] = useState<Comp | null>(null)
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [totals, setTotals] = useState<{ entrants: number; entries: number; amount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch(`/api/admin/competitions/${id}/entries`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load entries')))
      .then(d => { setComp(d.competition); setEntrants(d.entrants || []); setTotals(d.totals) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const filtered = q.trim()
    ? entrants.filter(e => `${e.name} ${e.email} ${e.phone}`.toLowerCase().includes(q.toLowerCase()))
    : entrants

  const downloadCsv = () => {
    const esc = (s: unknown) => { const v = String(s ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
    const header = ['Name', 'Email', 'Phone', 'Entries', 'Amount (£)', 'Purchases', 'First entry', 'Last entry']
    const rows = entrants.map(e => [e.name, e.email, e.phone, e.entries, e.amount.toFixed(2), e.purchases, fmt(e.first), fmt(e.last)].map(esc).join(','))
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${comp?.slug || 'competition'}-entries.csv`
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const label = comp?.type === 'instant' ? 'Spins' : 'Tickets'

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link href={`/admin/competitions/${id}`} style={{ color: 'var(--ink3)', fontSize: '.8rem', textDecoration: 'none' }}>← Back to competition</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--ink)' }}>Entries</h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{comp ? comp.title : 'Loading…'}</p>
        </div>
        {entrants.length > 0 && (
          <button onClick={downloadCsv} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '9px', padding: '.6rem 1.1rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>⤓ Download CSV</button>
        )}
      </div>

      {totals && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem', maxWidth: '560px' }}>
          {[['Entrants', totals.entrants.toLocaleString()], [label, totals.entries.toLocaleString()], ['Revenue', money(totals.amount)]].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)' }}>{k}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.7rem', fontWeight: 600, marginTop: '.25rem' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email or phone…" style={{ flex: 1, minWidth: '220px', padding: '.6rem .8rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '9px', fontSize: '.85rem' }} />
        {q.trim() && <span style={{ fontSize: '.78rem', color: 'var(--ink3)' }}>{filtered.length} shown</span>}
      </div>

      {err && <p style={{ color: '#b91c1c', fontSize: '.85rem' }}>{err}</p>}

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>{entrants.length === 0 ? 'No entries yet.' : 'No entrants match your search.'}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr>
                  {['Entrant', label, 'Amount', 'Purchases', 'First entry', 'Last entry'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '.85rem 1.25rem', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.userId}>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--ink)' }}>{e.name}</div>
                      <div style={{ fontSize: '.74rem', color: 'var(--ink3)' }}>{e.email}{e.phone ? ` · ${e.phone}` : ''}</div>
                    </td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.95rem', fontWeight: 700, color: 'var(--ink)' }}>{e.entries}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.85rem', color: 'var(--gold,#2563eb)', fontWeight: 600 }}>{money(e.amount)}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink2)' }}>{e.purchases}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.76rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{fmt(e.first)}</td>
                    <td style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '.76rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{fmt(e.last)}</td>
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
