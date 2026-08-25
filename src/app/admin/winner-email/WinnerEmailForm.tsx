'use client'

import { useState } from 'react'

interface Comp { id: string; title: string; ticketsSold: number }
interface Entrant { ticketNumber: number; userId: string; name: string; email: string }

const label: React.CSSProperties = { display: 'block', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: '.4rem' }
const input: React.CSSProperties = { width: '100%', padding: '.7rem .8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', fontFamily: 'inherit', color: 'var(--ink)', background: '#fff' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.75rem', maxWidth: '620px' }

export default function WinnerEmailForm({ competitions }: { competitions: Comp[] }) {
  const [compId, setCompId] = useState('')
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [loadingEntrants, setLoadingEntrants] = useState(false)
  const [pick, setPick] = useState('') // index into entrants
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [ticket, setTicket] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const comp = competitions.find(c => c.id === compId)

  const onComp = async (id: string) => {
    setCompId(id); setEntrants([]); setPick(''); setName(''); setEmail(''); setTicket(null); setErr(''); setMsg('')
    if (!id) return
    setLoadingEntrants(true)
    try {
      const res = await fetch(`/api/admin/winner-email?competitionId=${id}`)
      const data = await res.json()
      setEntrants(data.entrants || [])
    } catch { setErr('Could not load entries') }
    finally { setLoadingEntrants(false) }
  }

  const onPick = (idx: string) => {
    setPick(idx)
    const e = entrants[Number(idx)]
    if (e) { setName(e.name === '(no name)' ? '' : e.name); setEmail(e.email); setTicket(e.ticketNumber) }
  }

  const send = async () => {
    setErr(''); setMsg('')
    if (!comp) { setErr('Select a competition'); return }
    if (!name.trim()) { setErr('Enter the winner’s name'); return }
    if (!email.trim()) { setErr('Select or enter the recipient email'); return }
    if (!confirm(`Send a winner email to ${name} <${email}> for "${comp.title}"?`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/winner-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, competitionTitle: comp.title, ticketNumber: ticket }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to send'); return }
      setMsg(`Winner email sent to ${email}.`)
    } catch { setErr('Something went wrong') }
    finally { setBusy(false) }
  }

  return (
    <div style={card}>
      {/* Competition */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={label}>Competition</span>
        <select style={input} value={compId} onChange={e => onComp(e.target.value)}>
          <option value="">Select a competition…</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title} ({c.ticketsSold} sold)</option>)}
        </select>
      </div>

      {/* Winner (name — ticket number) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={label}>Winner — ticket number</span>
        <select style={input} value={pick} onChange={e => onPick(e.target.value)} disabled={!compId || loadingEntrants}>
          <option value="">
            {loadingEntrants ? 'Loading entries…' : !compId ? 'Select a competition first' : entrants.length ? 'Select the winning entry…' : 'No entries for this competition'}
          </option>
          {entrants.map((e, i) => (
            <option key={i} value={i}>#{e.ticketNumber} — {e.name}</option>
          ))}
        </select>
      </div>

      {/* Winner name (editable) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={label}>Winner&rsquo;s name</span>
        <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jessica" />
      </div>

      {/* Recipient email (auto-filled from the pick, editable) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={label}>Send to (recipient email)</span>
        <input style={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="winner@email.com" type="email" />
        {ticket !== null && <p style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.4rem' }}>Winning ticket <b style={{ color: 'var(--ink2)' }}>#{ticket}</b> · this email will be included in the message.</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={send} disabled={busy} className="btn-primary" style={{ padding: '.8rem 1.8rem', opacity: busy ? .7 : 1 }}>
          {busy ? 'Sending…' : 'Send winner email'}
        </button>
        {msg && <span style={{ color: '#15803d', fontSize: '.85rem' }}>{msg}</span>}
        {err && <span style={{ color: '#c0392b', fontSize: '.85rem' }}>{err}</span>}
      </div>
    </div>
  )
}
