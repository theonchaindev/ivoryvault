'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'

type TierType = 'credit' | 'custom'
interface Tier { type: TierType; amount: number; total: number; name?: string; image?: string }
interface Config { published: boolean; priceP: number; poolSize: number; prizes: Tier[] }
interface PoolRow extends Tier { key: string; won: number; left: number }
interface CustomWin { playId: string; userId: string; amount: number; name: string | null; image: string | null; ticketNo: number; userName: string; userEmail: string; claim?: { fullName: string; addressLine1: string; addressLine2: string | null; city: string; postcode: string; phone: string | null } }

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const card: React.CSSProperties = { background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e7ee)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
const label: React.CSSProperties = { display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3,#6b7684)', marginBottom: '.4rem' }
const input: React.CSSProperties = { padding: '.55rem .7rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'inherit', width: '100%', color: 'var(--ink,#1b2432)', background: '#fff' }

export default function TicketGameAdmin() {
  const [loading, setLoading] = useState(true)
  const [published, setPublished] = useState(false)
  const [priceP, setPriceP] = useState(10)
  const [poolSize, setPoolSize] = useState(500)
  const [prizes, setPrizes] = useState<Tier[]>([])
  const [pool, setPool] = useState<PoolRow[]>([])
  const [sold, setSold] = useState(0)
  const [customWins, setCustomWins] = useState<CustomWin[]>([])
  const [saving, setSaving] = useState(false)
  const [busyPub, setBusyPub] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileFor = useRef<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/ticket-game')
      if (!res.ok) throw new Error('load failed')
      const d = await res.json() as { config: Config; sold: number; pool: PoolRow[]; customWins: CustomWin[] }
      setPublished(d.config.published); setPriceP(d.config.priceP); setPoolSize(d.config.poolSize); setPrizes(d.config.prizes)
      setPool(d.pool); setSold(d.sold); setCustomWins(d.customWins)
    } catch { setErr('Could not load the ticket game config.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const setTier = (i: number, patch: Partial<Tier>) => setPrizes(p => p.map((t, idx) => idx === i ? { ...t, ...patch } : t))
  const addTier = () => setPrizes(p => [...p, { type: 'credit', amount: 5, total: 1 }])
  const removeTier = (i: number) => setPrizes(p => p.filter((_, idx) => idx !== i))

  const pickImage = (i: number) => { fileFor.current = i; fileInput.current?.click() }
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; const i = fileFor.current; e.target.value = ''
    if (!f || i == null) return
    setMsg('Uploading image…')
    try {
      const url = await uploadImage(f)
      setTier(i, { image: url })
    } catch {
      // Fall back to a local data URL (e.g. Cloudinary not configured locally)
      const reader = new FileReader(); reader.onload = () => setTier(i, { image: String(reader.result) }); reader.readAsDataURL(f)
    } finally { setMsg('') }
  }

  const save = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      const res = await fetch('/api/admin/ticket-game', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceP, poolSize, prizes }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'save failed')
      setMsg('Saved.'); setTimeout(() => setMsg(''), 2500); load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save.') }
    finally { setSaving(false) }
  }

  const togglePublish = async () => {
    const goingLive = !published
    if (goingLive && !confirm('Show the ticket game on the live site? Members will be able to buy and play it for real money.')) return
    setBusyPub(true); setErr('')
    try {
      const res = await fetch('/api/admin/ticket-game', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: goingLive }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'failed')
      setPublished(d.config.published)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not update.') }
    finally { setBusyPub(false) }
  }

  const totalWinners = prizes.reduce((s, t) => s + (Number(t.total) || 0), 0)

  if (loading) return <p style={{ color: 'var(--ink3)' }}>Loading…</p>

  return (
    <div style={{ maxWidth: '920px', color: 'var(--ink,#1b2432)' }}>
      {err && <div style={{ ...card, borderColor: '#f3c2bd', background: '#fdf2f1', color: '#b23b2e' }}>{err}</div>}

      {/* Publish switch */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderColor: published ? '#a7e0bf' : 'var(--border,#e2e7ee)', background: published ? '#f0fbf4' : 'var(--card,#fff)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: published ? '#16a34a' : '#c0392b' }} />
            <strong style={{ fontSize: '1rem' }}>{published ? 'Live on site' : 'Hidden from site'}</strong>
          </div>
          <p style={{ color: 'var(--ink3)', fontSize: '.82rem', margin: '.35rem 0 0' }}>
            {published
              ? 'Members can see and play the ticket game right now.'
              : 'The game is not shown anywhere on the site. Turn this on when you’re ready to go live.'}
          </p>
        </div>
        <button onClick={togglePublish} disabled={busyPub || (!published && prizes.length === 0)} style={{ background: published ? '#c0392b' : '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '.85rem 1.8rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: busyPub || (!published && prizes.length === 0) ? .6 : 1 }}>
          {busyPub ? '…' : published ? 'Hide from site' : 'Show on site'}
        </button>
      </div>

      {/* Settings */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={label}>Ticket price</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ color: 'var(--ink3)' }}>£</span>
              <input type="number" step="0.01" min="0.01" style={{ ...input, width: '120px' }} value={(priceP / 100).toString()} onChange={e => setPriceP(Math.max(1, Math.round((parseFloat(e.target.value) || 0) * 100)))} />
            </div>
          </div>
          <div>
            <label style={label}>Ticket pool size</label>
            <input type="number" min="1" style={{ ...input, width: '140px' }} value={poolSize} onChange={e => setPoolSize(Math.max(1, parseInt(e.target.value, 10) || 1))} />
            <p style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.4rem' }}>{totalWinners} winning ticket{totalWinners === 1 ? '' : 's'} across {poolSize} · {sold} sold so far</p>
          </div>
        </div>
      </div>

      {/* Prize tiers */}
      <div style={card}>
        <label style={label}>Prizes</label>
        {prizes.length === 0 && <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No prizes yet — add your first below.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {prizes.map((t, i) => (
            <div key={i} style={{ padding: '.85rem', border: '1px solid var(--border,#eef1f6)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select style={{ ...input, width: '150px' }} value={t.type} onChange={e => setTier(i, { type: e.target.value as TierType })}>
                  <option value="credit">Site credit</option>
                  <option value="custom">Custom prize</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <span style={{ color: 'var(--ink3)', fontSize: '.8rem' }}>Qty</span>
                  <input type="number" min="1" style={{ ...input, width: '80px' }} value={t.total} onChange={e => setTier(i, { total: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <span style={{ color: 'var(--ink3)', fontSize: '.8rem' }}>{t.type === 'credit' ? 'Amount £' : 'Value £'}</span>
                  <input type="number" step="0.01" min="0" style={{ ...input, width: '100px' }} value={t.amount} onChange={e => setTier(i, { amount: Math.max(0, parseFloat(e.target.value) || 0) })} />
                </div>
                {t.type === 'credit' && <span style={{ fontSize: '.72rem', color: 'var(--ink3)' }}>→ added to balance</span>}
                <button onClick={() => removeTier(i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c0392b', fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
              </div>
              {t.type === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: '.75rem', alignItems: 'center', marginTop: '.75rem' }}>
                  <button onClick={() => pickImage(i)} style={{ width: '84px', height: '64px', border: '1.5px dashed var(--border,#e2e7ee)', borderRadius: '8px', background: t.image ? 'none' : '#f7f8fa', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                    {t.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '.66rem', color: '#9aa3af' }}>+ Photo</span>}
                  </button>
                  <input style={input} placeholder="Prize name (e.g. Coach Handbag)" value={t.name || ''} onChange={e => setTier(i, { name: e.target.value })} />
                </div>
              )}
            </div>
          ))}
        </div>
        <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={addTier} style={{ background: 'none', border: '1.5px solid var(--border,#e2e7ee)', borderRadius: '8px', padding: '.6rem 1.1rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>+ Add prize</button>
          <button onClick={save} disabled={saving} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '.75rem 2rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .6 : 1 }}>{saving ? 'Saving…' : 'Save setup'}</button>
          {msg && <span style={{ color: '#15803d', fontSize: '.85rem' }}>{msg}</span>}
          <a href="/instant-tickets" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--gold,#2563eb)', fontSize: '.82rem', fontWeight: 700, textDecoration: 'none' }}>▶ Preview game</a>
        </div>
      </div>

      {/* Live pool status */}
      {pool.some(p => p.won > 0) && (
        <div style={card}>
          <label style={label}>Prizes won so far</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {pool.map(p => (
              <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                <span>{p.type === 'credit' ? `${money(p.amount)} site credit` : (p.name || 'Prize')}</span>
                <span style={{ color: 'var(--ink3)' }}>{p.won} won · {p.left} left of {p.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom prize fulfilment */}
      <div style={card}>
        <label style={label}>Custom prize winners (fulfilment)</label>
        {customWins.length === 0
          ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No custom prizes have been won yet.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--ink3)', fontSize: '.66rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    <th style={{ padding: '.5rem .5rem' }}>Ticket</th><th style={{ padding: '.5rem .5rem' }}>Member</th><th style={{ padding: '.5rem .5rem' }}>Prize</th><th style={{ padding: '.5rem .5rem' }}>Delivery address</th>
                  </tr>
                </thead>
                <tbody>
                  {customWins.map(w => (
                    <tr key={w.playId} style={{ borderTop: '1px solid var(--border,#eef1f6)', verticalAlign: 'top' }}>
                      <td style={{ padding: '.6rem .5rem', fontVariantNumeric: 'tabular-nums' }}>Nº {String(w.ticketNo).padStart(4, '0')}</td>
                      <td style={{ padding: '.6rem .5rem' }}>{w.userName}<br /><span style={{ color: 'var(--ink3)', fontSize: '.72rem' }}>{w.userEmail}</span></td>
                      <td style={{ padding: '.6rem .5rem' }}>{w.name}{w.amount > 0 ? <><br /><span style={{ color: 'var(--ink3)', fontSize: '.72rem' }}>worth {money(w.amount)}</span></> : null}</td>
                      <td style={{ padding: '.6rem .5rem' }}>
                        {w.claim
                          ? <span>{w.claim.fullName}<br />{w.claim.addressLine1}{w.claim.addressLine2 ? <>, {w.claim.addressLine2}</> : null}<br />{w.claim.city}, {w.claim.postcode}{w.claim.phone ? <><br />{w.claim.phone}</> : null}</span>
                          : <span style={{ color: '#b45309' }}>Awaiting claim</span>}
                      </td>
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
