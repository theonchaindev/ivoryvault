'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Ticket { id: string; quantity: number; stripePaymentId: string | null; purchasedAt: string; title: string; value: number }
interface Spin { id: string; revealed: boolean; prizeAmount: number; prizeType: string; createdAt: string; title: string }
interface Winner { id: string; prizeTitle: string | null; prizeValue: number | null; drawnAt: string; announced: boolean; title: string }
interface Notif { id: string; title: string; body: string; read: boolean; createdAt: string }
interface UserData {
  id: string; name: string; email: string; phone: string | null; role: string; siteCredit: number; freeSpins: number
  createdAt: string; tier: string
  tickets: Ticket[]; spins: Spin[]; winners: Winner[]; notifications: Notif[]
  stats: { totalEntries: number; totalSpent: number; spinsUnrevealed: number; wonCount: number; wonTotal: number }
}
interface Comp { id: string; title: string; type: string }

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
const cardTitle: React.CSSProperties = { fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 700, marginBottom: '1rem' }
const input: React.CSSProperties = { padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit' }
const btn: React.CSSProperties = { padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'inherit' }
const money = (v: number) => `£${v.toFixed(2)}`
const date = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default function UserDetail({ user, comps }: { user: UserData; comps: Comp[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const [credit, setCredit] = useState('')
  const [note, setNote] = useState('')
  const [newPw, setNewPw] = useState('')
  const [addComp, setAddComp] = useState(comps[0]?.id || '')
  const [addQty, setAddQty] = useState('1')

  async function post(payload: Record<string, unknown>, okMsg: string) {
    setBusy(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Something went wrong'); return }
      setMsg(okMsg)
      router.refresh()
    } catch { setMsg('Something went wrong') }
    finally { setBusy(false) }
  }

  const adjustCredit = (sign: number) => {
    const amt = parseFloat(credit)
    if (!Number.isFinite(amt) || amt <= 0) { setMsg('Enter an amount'); return }
    post({ action: 'credit', amount: sign * amt, note: note || undefined }, `${sign > 0 ? 'Added' : 'Deducted'} ${money(amt)}`)
    setCredit(''); setNote('')
  }

  const stat = (label: string, value: string, accent?: boolean) => (
    <div style={{ background: 'var(--bg2)', borderRadius: '10px', padding: '1rem 1.25rem', flex: '1 1 140px' }}>
      <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent ? 'var(--gold)' : 'var(--ink)', marginTop: '0.25rem' }}>{value}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: '900px' }}>
      <Link href="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--ink3)', textDecoration: 'none' }}>← All members</Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.75rem 0 1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{user.name}</h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem' }}>{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
        </div>
        <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '999px', padding: '3px 10px' }}>{user.tier} tier</span>
        {user.role === 'admin' && <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b45309', border: '1px solid #f59e0b', borderRadius: '999px', padding: '3px 10px' }}>Admin</span>}
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--ink3)' }}>Joined {date(user.createdAt)}</span>
      </div>

      {msg && <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold)', color: 'var(--gold-d)', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {stat('Site Credit', money(user.siteCredit), true)}
        {stat('Entries', String(user.stats.totalEntries))}
        {stat('Total Spent', money(user.stats.totalSpent))}
        {stat('Spins Left', String(user.stats.spinsUnrevealed))}
        {stat('Won', `${money(user.stats.wonTotal)} · ${user.stats.wonCount}`)}
      </div>

      {/* Add credit */}
      <div style={card}>
        <p style={cardTitle}>Site Credit</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', marginBottom: '1rem' }}>Current balance: <b style={{ color: 'var(--gold)' }}>{money(user.siteCredit)}</b></p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink3)' }}>£</span>
          <input style={{ ...input, width: '110px' }} type="number" step="0.01" min="0" placeholder="0.00" value={credit} onChange={e => setCredit(e.target.value)} />
          <input style={{ ...input, flex: 1, minWidth: '180px' }} placeholder="Note (optional, shown to member)" value={note} onChange={e => setNote(e.target.value)} />
          <button style={{ ...btn, background: 'var(--gold)', color: '#fff' }} disabled={busy} onClick={() => adjustCredit(1)}>Add</button>
          <button style={{ ...btn, background: 'var(--bg2)', color: 'var(--ink2)', border: '1px solid var(--border)' }} disabled={busy} onClick={() => adjustCredit(-1)}>Deduct</button>
        </div>
      </div>

      {/* Entries / orders */}
      <div style={card}>
        <p style={cardTitle}>Entries &amp; Orders</p>
        {user.tickets.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink3)' }}>No entries yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <tbody>
              {user.tickets.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--ink)' }}>{t.title}</td>
                  <td style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>×{t.quantity}</td>
                  <td style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>{money(t.value)}</td>
                  <td style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--ink3)' }}>{t.stripePaymentId === 'admin-manual' ? 'manual' : 'paid'} · {date(t.purchasedAt)}</td>
                  <td style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <button onClick={() => { if (confirm('Remove this entry? It will decrement the competition ticket count.')) post({ action: 'deleteEntry', ticketId: t.id }, 'Entry removed') }}
                      style={{ ...btn, background: 'transparent', color: '#c0392b', padding: '0.3rem 0.6rem', fontSize: '0.65rem' }} disabled={busy}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Add entry */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>Add entry:</span>
          <select style={{ ...input, minWidth: '220px' }} value={addComp} onChange={e => setAddComp(e.target.value)}>
            {comps.map(c => <option key={c.id} value={c.id}>{c.title}{c.type === 'instant' ? ' (spins)' : ''}</option>)}
          </select>
          <input style={{ ...input, width: '70px' }} type="number" min="1" value={addQty} onChange={e => setAddQty(e.target.value)} />
          <button style={{ ...btn, background: 'var(--ink)', color: '#fff' }} disabled={busy || !addComp} onClick={() => post({ action: 'addEntry', competitionId: addComp, quantity: parseInt(addQty, 10) || 1 }, 'Entry added')}>Add</button>
        </div>
      </div>

      {/* Instant spins */}
      {user.spins.length > 0 && (
        <div style={card}>
          <p style={cardTitle}>Instant Spins ({user.spins.length} shown)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {user.spins.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--ink2)' }}>{s.title}</span>
                <span style={{ color: !s.revealed ? 'var(--ink3)' : s.prizeAmount > 0 ? 'var(--gold)' : 'var(--ink3)' }}>
                  {!s.revealed ? 'Unrevealed' : s.prizeAmount > 0 ? `Won ${money(s.prizeAmount)} ${s.prizeType}` : 'No win'} · {date(s.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winners */}
      {user.winners.length > 0 && (
        <div style={card}>
          <p style={cardTitle}>Wins</p>
          {user.winners.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--ink)' }}>{w.prizeTitle || w.title}</span>
              <span style={{ color: 'var(--gold)' }}>{w.prizeValue ? money(w.prizeValue) : ''} · {w.announced ? 'announced' : 'pending'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reset password */}
      <div style={card}>
        <p style={cardTitle}>Reset Password</p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...input, flex: 1, minWidth: '220px' }} type="text" placeholder="New password (min 8 chars)" value={newPw} onChange={e => setNewPw(e.target.value)} />
          <button style={{ ...btn, background: 'var(--ink)', color: '#fff' }} disabled={busy || newPw.length < 8}
            onClick={() => { post({ action: 'password', password: newPw }, 'Password updated'); setNewPw('') }}>Set Password</button>
        </div>
      </div>

      {/* Notifications */}
      {user.notifications.length > 0 && (
        <div style={card}>
          <p style={cardTitle}>Recent Notifications</p>
          {user.notifications.map(n => (
            <div key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{n.body} · {date(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
