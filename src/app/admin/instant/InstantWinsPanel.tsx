'use client'

import { useState } from 'react'
import { formatPrize } from '@/lib/instant'

interface Comp { id: string; title: string }
interface PoolTier { amount: number; total: number; won: number; left: number; kind: 'credit' | 'cash' }
interface Entry { spinId: string; ticketNumber: number; name: string; email: string; revealed: boolean; prizeAmount: number; prizeType: 'credit' | 'cash' }
interface Data { title: string; maxTickets: number; ticketsSold: number; pool: PoolTier[]; winners: Entry[]; entries: Entry[] }

const label: React.CSSProperties = { display: 'block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: '.4rem' }
const input: React.CSSProperties = { width: '100%', padding: '.7rem .8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', fontFamily: 'inherit', color: 'var(--ink)', background: '#fff' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '.5rem .75rem', fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: '#fff' }
const td: React.CSSProperties = { padding: '.5rem .75rem', fontSize: '.82rem', color: 'var(--ink2)', borderBottom: '1px solid var(--border)' }
const chip = (bg: string, c: string): React.CSSProperties => ({ display: 'inline-block', padding: '.15rem .5rem', borderRadius: '5px', fontSize: '.68rem', fontWeight: 700, background: bg, color: c })

export default function InstantWinsPanel({ competitions }: { competitions: Comp[] }) {
  const [compId, setCompId] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [awardSpin, setAwardSpin] = useState('')
  const [awardPrize, setAwardPrize] = useState('') // "amount:kind"
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = async (id: string) => {
    setCompId(id); setData(null); setAwardSpin(''); setAwardPrize(''); setMsg(''); setErr('')
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/instant?competitionId=${id}`)
      const d = await res.json()
      if (!res.ok) { setErr(d.error || 'Failed to load'); return }
      setData(d)
    } catch { setErr('Failed to load') }
    finally { setLoading(false) }
  }

  const award = async () => {
    setErr(''); setMsg('')
    if (!awardSpin) { setErr('Choose an entry to award'); return }
    if (!awardPrize) { setErr('Choose a prize to award'); return }
    const [amount, kind] = awardPrize.split(':')
    const entry = data?.entries.find(e => e.spinId === awardSpin)
    if (!confirm(`Award ${formatPrize(Number(amount))} ${kind} to ticket #${entry?.ticketNumber} (${entry?.name})?`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/instant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spinId: awardSpin, amount: Number(amount), kind }),
      })
      const d = await res.json()
      if (!res.ok) { setErr(d.error || 'Failed to award'); return }
      setMsg('Prize awarded and the winner has been notified.')
      setAwardSpin(''); setAwardPrize('')
      await load(compId) // refresh
    } catch { setErr('Something went wrong') }
    finally { setBusy(false) }
  }

  const eligible = data?.entries.filter(e => e.prizeAmount === 0) ?? []
  const remainingTiers = data?.pool.filter(p => p.left > 0) ?? []

  return (
    <div>
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <span style={label}>Instant-win competition</span>
        <select style={input} value={compId} onChange={e => load(e.target.value)}>
          <option value="">Select an instant-win game…</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: 'var(--ink3)' }}>Loading…</p>}
      {err && !data && <p style={{ color: '#c0392b' }}>{err}</p>}

      {data && (
        <>
          {/* Prize pool */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.25rem' }}>Prize pool</h2>
            <p style={{ color: 'var(--ink3)', fontSize: '.78rem', marginBottom: '1rem' }}>{data.ticketsSold} entries so far · pool drips across {data.maxTickets} tickets</p>
            {data.pool.length === 0 ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No prize pool configured on this competition.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Prize', 'Type', 'Total', 'Won', 'Left'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.pool.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 700, color: 'var(--ink)' }}>{formatPrize(p.amount)}</td>
                      <td style={td}>{p.kind}</td>
                      <td style={td}>{p.total}</td>
                      <td style={td}>{p.won}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{p.left > 0 ? <span style={chip('#dcfce7', '#166534')}>{p.left} left</span> : <span style={chip('#e2e8f0', '#475569')}>all won</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Dish out a prize */}
          <div style={{ ...card, border: '1px solid #d8b4fe', background: '#faf5ff' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.25rem' }}>Dish out a prize</h2>
            <p style={{ color: 'var(--ink3)', fontSize: '.78rem', marginBottom: '1rem' }}>Manually award any remaining prize to an entry before the competition ends. The winner is credited/notified instantly.</p>
            {remainingTiers.length === 0 ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>All prizes have been won — nothing left to award.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '.75rem', alignItems: 'end' }}>
                <div>
                  <span style={label}>Entry (ticket #)</span>
                  <select style={input} value={awardSpin} onChange={e => setAwardSpin(e.target.value)}>
                    <option value="">Select an entry…</option>
                    {eligible.map(e => <option key={e.spinId} value={e.spinId}>#{e.ticketNumber} — {e.name}{e.revealed ? ' (revealed, no prize)' : ' (not revealed)'}</option>)}
                  </select>
                </div>
                <div>
                  <span style={label}>Prize</span>
                  <select style={input} value={awardPrize} onChange={e => setAwardPrize(e.target.value)}>
                    <option value="">Select a prize…</option>
                    {remainingTiers.map((p, i) => <option key={i} value={`${p.amount}:${p.kind}`}>{formatPrize(p.amount)} {p.kind} ({p.left} left)</option>)}
                  </select>
                </div>
                <button onClick={award} disabled={busy} className="btn-primary" style={{ padding: '.7rem 1.3rem', opacity: busy ? .7 : 1 }}>{busy ? 'Awarding…' : 'Award'}</button>
              </div>
            )}
            {(msg || err) && <p style={{ marginTop: '.75rem', fontSize: '.82rem', color: msg ? '#15803d' : '#c0392b' }}>{msg || err}</p>}
          </div>

          {/* Winners so far */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Who&rsquo;s won what ({data.winners.length})</h2>
            {data.winners.length === 0 ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No prizes won yet.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Ticket #', 'Winner', 'Email', 'Prize'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.winners.map(w => (
                    <tr key={w.spinId}>
                      <td style={{ ...td, fontWeight: 700, color: 'var(--ink)' }}>#{w.ticketNumber}</td>
                      <td style={td}>{w.name}</td>
                      <td style={{ ...td, color: 'var(--ink3)' }}>{w.email}</td>
                      <td style={td}><span style={chip('#dcfce7', '#166534')}>{formatPrize(w.prizeAmount)} {w.prizeType}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* All entries by ticket number */}
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>All entries by ticket number ({data.entries.length})</h2>
            <div style={{ maxHeight: '460px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Ticket #', 'Entrant', 'Status', 'Prize'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.entries.map(e => (
                    <tr key={e.spinId}>
                      <td style={{ ...td, fontWeight: 700, color: 'var(--ink)' }}>#{e.ticketNumber}</td>
                      <td style={td}>{e.name}</td>
                      <td style={td}>{e.revealed ? <span style={chip('#e2e8f0', '#475569')}>revealed</span> : <span style={chip('#fef3c7', '#92400e')}>not revealed</span>}</td>
                      <td style={td}>{e.prizeAmount > 0 ? <span style={chip('#dcfce7', '#166534')}>{formatPrize(e.prizeAmount)} {e.prizeType}</span> : <span style={{ color: 'var(--ink3)' }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
