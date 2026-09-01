'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadImage } from '@/lib/uploadImage'

type WinnerType = 'credit' | 'custom'
interface Winner { type: WinnerType; amount: number; name?: string; image?: string }
type Winners = Record<number, Winner>
interface CustomWin { playId: string; userId: string; amount: number; name: string | null; image: string | null; ticketNo: number; userName: string; userEmail: string; claim?: { fullName: string; addressLine1: string; addressLine2: string | null; city: string; postcode: string; phone: string | null } }
interface Order { orderNumber: string; status: string; amount: string; createdAt: string; paidAt: string | null; qty: number; email: string; name: string }

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const toLocalInput = (iso: string) => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const plusDaysLocal = (n: number) => toLocalInput(new Date(Date.now() + n * 86400000).toISOString())
const card: React.CSSProperties = { background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e7ee)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
const label: React.CSSProperties = { display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3,#6b7684)', marginBottom: '.4rem' }
const input: React.CSSProperties = { padding: '.55rem .7rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'inherit', width: '100%', color: 'var(--ink,#1b2432)', background: '#fff' }
const GRID_CAP = 1000

export default function InstantGameAdmin({ gameId }: { gameId: string }) {
  const router = useRouter()
  const base = `/api/admin/instant-win/${gameId}`
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [backHref, setBackHref] = useState('/admin/instant-win')
  const [published, setPublished] = useState(false)
  const [priceP, setPriceP] = useState(50)
  const [poolSize, setPoolSize] = useState(500)
  const [image, setImage] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [winners, setWinners] = useState<Winners>({})
  const [sold, setSold] = useState(0)
  const [won, setWon] = useState(0)
  const [customWins, setCustomWins] = useState<CustomWin[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [grantEmail, setGrantEmail] = useState('')
  const [grantQty, setGrantQty] = useState(1)
  const [granting, setGranting] = useState(false)
  const [grantMsg, setGrantMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyPub, setBusyPub] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileFor = useRef<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const mainFileInput = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const res = await fetch(base)
      if (res.status === 404) { setNotFound(true); return }
      if (!res.ok) throw new Error('load failed')
      const d = await res.json() as { game: { slug: string; name: string; kind?: string; published: boolean; priceP: number; poolSize: number; image: string; endsAt: string | null; winners: Winners }; sold: number; won: number; customWins: CustomWin[]; orders?: Order[] }
      setBackHref(d.game.kind === 'instant' ? '/admin/instant' : '/admin/instant-win')
      setName(d.game.name); setSlug(d.game.slug); setPublished(d.game.published); setPriceP(d.game.priceP); setPoolSize(d.game.poolSize); setImage(d.game.image || ''); setWinners(d.game.winners || {})
      setEndsAt(d.game.endsAt ? toLocalInput(d.game.endsAt) : plusDaysLocal(30))
      setSold(d.sold); setWon(d.won); setCustomWins(d.customWins); setOrders(d.orders || [])
    } catch { setErr('Could not load this game.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (n: number) => setWinners(w => { const next = { ...w }; if (next[n]) delete next[n]; else next[n] = { type: 'credit', amount: 5 }; return next })
  const setPrize = (n: number, patch: Partial<Winner>) => setWinners(w => ({ ...w, [n]: { ...w[n], ...patch } }))
  const changePool = (v: number) => { const size = Math.max(1, v || 1); setPoolSize(size); setWinners(w => { const next: Winners = {}; for (const [k, val] of Object.entries(w)) if (Number(k) <= size) next[Number(k)] = val; return next }) }

  const pickImage = (n: number) => { fileFor.current = n; fileInput.current?.click() }
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; const n = fileFor.current; e.target.value = ''
    if (!f || n == null) return
    setMsg('Uploading image…')
    try { const url = await uploadImage(f); setPrize(n, { image: url }) }
    catch { const reader = new FileReader(); reader.onload = () => setPrize(n, { image: String(reader.result) }); reader.readAsDataURL(f) }
    finally { setMsg('') }
  }
  const onMainFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setMsg('Uploading image…')
    try { const url = await uploadImage(f); setImage(url) }
    catch { const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(f) }
    finally { setMsg('') }
  }

  const save = async () => {
    setSaving(true); setErr(''); setMsg('')
    try {
      const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, priceP, poolSize, image, endsAt: endsAt ? new Date(endsAt).toISOString() : null, winners }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'save failed')
      setMsg('Saved.'); setTimeout(() => setMsg(''), 2500); load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save.') }
    finally { setSaving(false) }
  }

  const togglePublish = async () => {
    const goingLive = !published
    if (goingLive && !confirm('Show this game on the live site? Members will be able to buy and play it for real money.')) return
    setBusyPub(true); setErr('')
    try {
      const res = await fetch(base, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: goingLive }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'failed')
      setPublished(d.game.published); if (d.game.endsAt && !endsAt) setEndsAt(toLocalInput(d.game.endsAt))
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not update.') }
    finally { setBusyPub(false) }
  }

  const grant = async () => {
    setGranting(true); setGrantMsg('')
    try {
      const res = await fetch(`${base}/grant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: grantEmail.trim(), quantity: grantQty }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'failed')
      setGrantMsg(`✓ Added ${d.granted} ticket(s) to ${d.email} (they now hold ${d.pending} unrevealed).`); setGrantEmail(''); load()
    } catch (e) { setGrantMsg(e instanceof Error ? e.message : 'Could not grant.') }
    finally { setGranting(false) }
  }

  const resetGame = async () => {
    if (!confirm('Reset this game to 0 tickets sold? This permanently clears all plays and prize claims. Prize setup + published status are kept.')) return
    setResetting(true)
    try {
      const res = await fetch(`${base}/reset`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'failed')
      load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not reset.') }
    finally { setResetting(false) }
  }

  const deleteGame = async () => {
    if (!confirm(`Delete "${name}" permanently? This removes the game and all its plays. This can't be undone.`)) return
    try {
      const res = await fetch(base, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      router.push(backHref)
    } catch { setErr('Could not delete.') }
  }

  const winnerNums = Object.keys(winners).map(Number).sort((a, b) => a - b)
  const gridCount = Math.min(poolSize, GRID_CAP)

  if (loading) return <p style={{ color: 'var(--ink3)' }}>Loading…</p>
  if (notFound) return <p style={{ color: 'var(--ink3)' }}>Game not found. <Link href="/admin/instant-win" style={{ color: 'var(--gold,#2563eb)' }}>Back to games</Link></p>

  return (
    <div style={{ maxWidth: '960px', color: 'var(--ink,#1b2432)' }}>
      <Link href={backHref} style={{ color: 'var(--ink3)', fontSize: '.8rem', textDecoration: 'none' }}>← All games</Link>
      {err && <div style={{ ...card, marginTop: '1rem', borderColor: '#f3c2bd', background: '#fdf2f1', color: '#b23b2e' }}>{err}</div>}

      {/* Name */}
      <div style={{ ...card, marginTop: '1rem' }}>
        <label style={label}>Game name</label>
        <input style={{ ...input, maxWidth: '420px', fontSize: '1rem' }} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. October Instant Win" />
      </div>

      {/* Publish switch */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderColor: published ? '#a7e0bf' : 'var(--border,#e2e7ee)', background: published ? '#f0fbf4' : 'var(--card,#fff)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: published ? '#16a34a' : '#c0392b' }} />
            <strong style={{ fontSize: '1rem' }}>{published ? 'Live on site' : 'Hidden from site'}</strong>
          </div>
          <p style={{ color: 'var(--ink3)', fontSize: '.82rem', margin: '.35rem 0 0' }}>
            {published ? 'Members can see and play this game right now.' : 'The game is not shown anywhere on the site. Turn this on when you’re ready to go live.'}
          </p>
        </div>
        <button onClick={togglePublish} disabled={busyPub || (!published && winnerNums.length === 0)} style={{ background: published ? '#c0392b' : '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '.85rem 1.8rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: busyPub || (!published && winnerNums.length === 0) ? .6 : 1 }}>
          {busyPub ? '…' : published ? 'Hide from site' : 'Show on site'}
        </button>
      </div>

      {/* Settings */}
      <div style={card}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={label}>Main image (game thumbnail)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => mainFileInput.current?.click()} style={{ width: '180px', height: '120px', border: '1.5px dashed var(--border,#e2e7ee)', borderRadius: '10px', background: image ? 'none' : '#f7f8fa', cursor: 'pointer', overflow: 'hidden', padding: 0, flexShrink: 0 }}>
              {image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '.72rem', color: '#9aa3af' }}>+ Upload image</span>}
            </button>
            <div style={{ fontSize: '.78rem', color: 'var(--ink3)' }}>
              Shown as the game&rsquo;s thumbnail / hero on the site.
              {image && <><br /><button onClick={() => setImage('')} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit', padding: '.3rem 0 0' }}>Remove image</button></>}
            </div>
          </div>
          <input ref={mainFileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onMainFile} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={label}>Ticket price</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ color: 'var(--ink3)' }}>£</span>
              <input type="number" step="0.01" min="0.01" style={{ ...input, width: '120px' }} value={(priceP / 100).toString()} onChange={e => setPriceP(Math.max(1, Math.round((parseFloat(e.target.value) || 0) * 100)))} />
            </div>
          </div>
          <div>
            <label style={label}>Number of tickets in the pool</label>
            <input type="number" min="1" style={{ ...input, width: '140px' }} value={poolSize} onChange={e => changePool(parseInt(e.target.value, 10))} />
            <p style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.4rem' }}>{winnerNums.length} winning ticket{winnerNums.length === 1 ? '' : 's'} · {poolSize - winnerNums.length} non-winning · {sold} sold ({won} won)</p>
          </div>
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <label style={label}>Game ends</label>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="datetime-local" style={{ ...input, width: '230px' }} value={endsAt} onChange={e => setEndsAt(e.target.value)} />
            <button onClick={() => setEndsAt(plusDaysLocal(30))} style={{ background: 'none', border: '1px solid var(--border,#e2e7ee)', borderRadius: '8px', padding: '.5rem .9rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>30 days from now</button>
            {endsAt && <button onClick={() => setEndsAt('')} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>No end date</button>}
          </div>
          <p style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.4rem' }}>Drives the countdown on the game and its tile. After this, buying is closed.</p>
        </div>
      </div>

      {/* Pick winning tickets */}
      <div style={card}>
        <label style={label}>Pick the winning tickets</label>
        <p style={{ fontSize: '.78rem', color: 'var(--ink3)', margin: '0 0 .75rem' }}>Click a ticket number to make it a winner (gold). Tickets are handed out in order as they’re bought, so ticket #5 is the 5th one played.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '300px', overflowY: 'auto', padding: '6px', border: '1px solid var(--border,#eef1f6)', borderRadius: '8px', background: '#fafbfc' }}>
          {Array.from({ length: gridCount }, (_, i) => i + 1).map(n => {
            const isWin = !!winners[n]
            return <button key={n} onClick={() => toggle(n)} title={`Ticket ${n}`} style={{ width: '44px', height: '34px', borderRadius: '6px', cursor: 'pointer', fontSize: '.72rem', fontWeight: 700, fontFamily: 'inherit', border: isWin ? '1px solid #b8912f' : '1px solid var(--border,#e2e7ee)', background: isWin ? '#d9b64a' : '#fff', color: isWin ? '#1b2432' : 'var(--ink3,#6b7684)' }}>{n}</button>
          })}
        </div>
        {poolSize > GRID_CAP && <p style={{ fontSize: '.72rem', color: '#b45309', marginTop: '.5rem' }}>Showing the first {GRID_CAP} tickets. (The full pool is {poolSize}.)</p>}
      </div>

      {/* Prize for each winning ticket */}
      <div style={card}>
        <label style={label}>Prizes for winning tickets</label>
        {winnerNums.length === 0 ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No winning tickets yet — pick some above.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {winnerNums.map(n => {
              const p = winners[n]
              return (
                <div key={n} style={{ padding: '.85rem', border: '1px solid var(--border,#eef1f6)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 800, minWidth: '52px' }}>#{n}</div>
                    <select style={{ ...input, width: '150px' }} value={p.type} onChange={e => setPrize(n, { type: e.target.value as WinnerType })}>
                      <option value="credit">Site credit</option>
                      <option value="custom">Custom prize</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <span style={{ color: 'var(--ink3)', fontSize: '.8rem' }}>{p.type === 'credit' ? 'Amount £' : 'Value £'}</span>
                      <input type="number" step="0.01" min="0" style={{ ...input, width: '100px' }} value={p.amount} onChange={e => setPrize(n, { amount: Math.max(0, parseFloat(e.target.value) || 0) })} />
                    </div>
                    {p.type === 'credit' && <span style={{ fontSize: '.72rem', color: 'var(--ink3)' }}>→ added to balance</span>}
                    <button onClick={() => toggle(n)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c0392b', fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                  </div>
                  {p.type === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: '.75rem', alignItems: 'center', marginTop: '.75rem' }}>
                      <button onClick={() => pickImage(n)} style={{ width: '84px', height: '64px', border: '1.5px dashed var(--border,#e2e7ee)', borderRadius: '8px', background: p.image ? 'none' : '#f7f8fa', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                        {p.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '.66rem', color: '#9aa3af' }}>+ Photo</span>}
                      </button>
                      <input style={input} placeholder="Prize name (e.g. Coach Handbag)" value={p.name || ''} onChange={e => setPrize(n, { name: e.target.value })} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <button onClick={save} disabled={saving} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '.75rem 2rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .6 : 1 }}>{saving ? 'Saving…' : 'Save setup'}</button>
          {msg && <span style={{ color: '#15803d', fontSize: '.85rem' }}>{msg}</span>}
          <a href={`/instant-win/${slug}`} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--gold,#2563eb)', fontSize: '.82rem', fontWeight: 700, textDecoration: 'none' }}>▶ Preview game</a>
        </div>
      </div>

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

      {/* Orders & recovery */}
      <div style={card}>
        <label style={label}>Orders &amp; recovery</label>
        <p style={{ fontSize: '.78rem', color: 'var(--ink3)', margin: '0 0 .9rem' }}>Recent ticket purchases for this game. If a member paid but a card order shows <b>paid</b> yet they didn&rsquo;t get their tickets, grant them below.</p>
        {orders.length === 0
          ? <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No ticket orders yet.</p>
          : (
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--ink3)', fontSize: '.64rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    <th style={{ padding: '.4rem .5rem' }}>When</th><th style={{ padding: '.4rem .5rem' }}>Member</th><th style={{ padding: '.4rem .5rem' }}>Qty</th><th style={{ padding: '.4rem .5rem' }}>Amount</th><th style={{ padding: '.4rem .5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.orderNumber} style={{ borderTop: '1px solid var(--border,#eef1f6)' }}>
                      <td style={{ padding: '.5rem .5rem', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '.5rem .5rem' }}>{o.email || o.name || '—'}</td>
                      <td style={{ padding: '.5rem .5rem' }}>{o.qty}</td>
                      <td style={{ padding: '.5rem .5rem' }}>£{o.amount}</td>
                      <td style={{ padding: '.5rem .5rem' }}><span style={{ color: o.status === 'paid' ? '#15803d' : '#b45309', fontWeight: 700 }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '.5rem', borderTop: '1px solid var(--border,#eef1f6)' }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)' }}>Manually grant:</span>
          <input style={{ ...input, width: '260px' }} placeholder="member email" value={grantEmail} onChange={e => setGrantEmail(e.target.value)} />
          <input type="number" min={1} max={100} style={{ ...input, width: '80px' }} value={grantQty} onChange={e => setGrantQty(Math.max(1, parseInt(e.target.value, 10) || 1))} />
          <button onClick={grant} disabled={granting || !grantEmail.trim()} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '.6rem 1.2rem', fontSize: '.72rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: granting || !grantEmail.trim() ? .6 : 1 }}>{granting ? '…' : 'Grant tickets'}</button>
          {grantMsg && <span style={{ fontSize: '.8rem', color: grantMsg.startsWith('✓') ? '#15803d' : '#c0392b' }}>{grantMsg}</span>}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...card, borderColor: '#f3c2bd' }}>
        <label style={label}>Reset &amp; delete</label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <p style={{ fontSize: '.82rem', color: 'var(--ink3)', margin: 0, maxWidth: '520px' }}>Clears all tickets sold and prize claims, back to <b>0 sold</b>. Your prize setup, image and published status are kept.</p>
          <button onClick={resetGame} disabled={resetting} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', padding: '.75rem 1.6rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: resetting ? .6 : 1 }}>{resetting ? 'Resetting…' : 'Reset to 0 sold'}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border,#eef1f6)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '.82rem', color: 'var(--ink3)', margin: 0, maxWidth: '520px' }}>Permanently delete this game and everything in it.</p>
          <button onClick={deleteGame} style={{ background: 'none', color: '#c0392b', border: '1px solid #c0392b', borderRadius: '10px', padding: '.7rem 1.4rem', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Delete game</button>
        </div>
      </div>
    </div>
  )
}
