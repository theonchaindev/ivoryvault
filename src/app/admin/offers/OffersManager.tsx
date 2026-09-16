'use client'

import { useEffect, useState } from 'react'

interface Offer {
  id: string; kind: 'bundle' | 'percent'; scope: 'site' | 'comp'
  targetType: 'raffle' | 'game' | null; targetId: string | null; targetTitle: string
  buyQty: number; freeQty: number; percentOff: number; active: boolean; createdAt: string
}
interface CompOpt { id: string; title: string; kind?: string }
interface Comps { raffle: CompOpt[]; game: CompOpt[] }

const card: React.CSSProperties = { background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e7ee)', borderRadius: '14px', padding: '1.25rem 1.5rem' }
const gold = 'var(--gold,#2563eb)'
const label: React.CSSProperties = { display: 'block', fontSize: '.7rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '.4rem' }
const input: React.CSSProperties = { width: '100%', padding: '.6rem .75rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '9px', fontSize: '.9rem', background: '#fff', color: 'var(--ink)' }

export default function OffersManager() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [comps, setComps] = useState<Comps>({ raffle: [], game: [] })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  // form state
  const [kind, setKind] = useState<'bundle' | 'percent'>('bundle')
  const [scope, setScope] = useState<'site' | 'comp'>('comp')
  const [target, setTarget] = useState('') // "raffle:<id>" | "game:<id>"
  const [buyQty, setBuyQty] = useState(10)
  const [freeQty, setFreeQty] = useState(2)
  const [percentOff, setPercentOff] = useState(20)

  const load = async () => {
    setLoading(true); setErr('')
    try {
      const res = await fetch('/api/admin/offers')
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to load')
      setOffers(d.offers || [])
      setComps(d.comps || { raffle: [], game: [] })
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    setSaving(true); setErr('')
    try {
      let targetType: string | undefined, targetId: string | undefined, targetTitle = ''
      if (scope === 'comp') {
        if (!target) throw new Error('Pick a competition or choose site-wide.')
        const [tt, id] = target.split(':')
        targetType = tt; targetId = id
        const opt = (tt === 'game' ? comps.game : comps.raffle).find(c => c.id === id)
        targetTitle = opt?.title || ''
      }
      const body = { kind, scope, targetType, targetId, targetTitle, buyQty, freeQty, percentOff, active: true }
      const res = await fetch('/api/admin/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to create')
      setTarget('')
      await load()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed to create') }
    finally { setSaving(false) }
  }

  const toggle = async (o: Offer) => {
    setOffers(prev => prev.map(x => x.id === o.id ? { ...x, active: !x.active } : x))
    await fetch(`/api/admin/offers/${o.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !o.active }) })
    load()
  }
  const remove = async (o: Offer) => {
    if (!confirm('Delete this offer?')) return
    await fetch(`/api/admin/offers/${o.id}`, { method: 'DELETE' })
    load()
  }

  const describe = (o: Offer) => {
    const where = o.scope === 'site' ? 'Site-wide' : (o.targetTitle || 'Competition')
    if (o.kind === 'bundle') return `Buy ${o.buyQty}, get ${o.freeQty} free — ${where}`
    return `${o.percentOff}% off — ${where}`
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '760px' }}>
      {err && <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '10px', padding: '.7rem 1rem', fontSize: '.85rem' }}>{err}</div>}

      {/* Create */}
      <div style={card}>
        <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 600, margin: '0 0 1rem' }}>New offer</h2>

        {/* kind */}
        <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
          {(['bundle', 'percent'] as const).map(k => (
            <button key={k} type="button" onClick={() => setKind(k)}
              style={{ flex: 1, minWidth: '180px', padding: '.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                border: `1.5px solid ${kind === k ? gold : 'var(--border,#e2e7ee)'}`, background: kind === k ? 'rgba(37,99,235,.06)' : '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{k === 'bundle' ? 'Buy X get Y free' : '% off (homepage popup)'}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--ink3)', marginTop: '.15rem' }}>{k === 'bundle' ? 'Free entries on the same comp' : 'Toggleable discount popup'}</div>
            </button>
          ))}
        </div>

        {/* scope */}
        <div style={{ marginBottom: '1.1rem' }}>
          <span style={label}>Applies to</span>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            {(['comp', 'site'] as const).map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', cursor: 'pointer', padding: '.4rem .7rem', border: `1.5px solid ${scope === s ? gold : 'var(--border,#e2e7ee)'}`, borderRadius: '9px' }}>
                <input type="radio" name="scope" checked={scope === s} onChange={() => setScope(s)} style={{ accentColor: gold }} />
                {s === 'comp' ? 'Specific competition' : 'Site-wide'}
              </label>
            ))}
          </div>
        </div>

        {scope === 'comp' && (
          <div style={{ marginBottom: '1.1rem' }}>
            <span style={label}>Competition</span>
            <select value={target} onChange={e => setTarget(e.target.value)} style={input}>
              <option value="">Select a competition…</option>
              {comps.raffle.length > 0 && (
                <optgroup label="Raffle competitions">
                  {comps.raffle.map(c => <option key={c.id} value={`raffle:${c.id}`}>{c.title}</option>)}
                </optgroup>
              )}
              {comps.game.length > 0 && (
                <optgroup label="Instant-win games">
                  {comps.game.map(c => <option key={c.id} value={`game:${c.id}`}>{c.title}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        )}

        {kind === 'bundle' ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <span style={label}>Buy quantity</span>
              <input type="number" min={1} value={buyQty} onChange={e => setBuyQty(Math.max(1, Number(e.target.value)))} style={input} />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <span style={label}>Free tickets</span>
              <input type="number" min={1} value={freeQty} onChange={e => setFreeQty(Math.max(1, Number(e.target.value)))} style={input} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '1.1rem', maxWidth: '200px' }}>
            <span style={label}>Discount %</span>
            <input type="number" min={1} max={100} value={percentOff} onChange={e => setPercentOff(Math.min(100, Math.max(1, Number(e.target.value))))} style={input} />
          </div>
        )}

        <p style={{ fontSize: '.8rem', color: 'var(--ink3)', margin: '0 0 1rem' }}>
          {kind === 'bundle'
            ? `Customers who buy ${buyQty}+ on ${scope === 'site' ? 'any competition' : 'this competition'} get ${freeQty} extra entries free (once per order, same competition).`
            : `A homepage popup announces ${percentOff}% off ${scope === 'site' ? 'site-wide' : 'this competition'}. Switch it on or off any time from the list below.`}
        </p>

        <button onClick={create} disabled={saving} style={{ background: gold, color: '#fff', border: 'none', borderRadius: '10px', padding: '.8rem 1.5rem', fontWeight: 800, fontSize: '.85rem', letterSpacing: '.03em', cursor: 'pointer', opacity: saving ? .6 : 1 }}>
          {saving ? 'Creating…' : 'Create offer'}
        </button>
      </div>

      {/* List */}
      <div style={card}>
        <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 600, margin: '0 0 1rem' }}>Live & saved offers</h2>
        {loading ? (
          <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>Loading…</p>
        ) : offers.length === 0 ? (
          <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No offers yet — create one above.</p>
        ) : (
          <div style={{ display: 'grid', gap: '.7rem' }}>
            {offers.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem 1rem', border: '1px solid var(--border,#e2e7ee)', borderRadius: '11px', background: o.active ? 'rgba(37,99,235,.03)' : '#fafafa' }}>
                <span style={{ fontSize: '.55rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.25rem .5rem', borderRadius: '999px', background: o.kind === 'bundle' ? '#eef2ff' : '#fff7ed', color: o.kind === 'bundle' ? '#4338ca' : '#c2410c', flexShrink: 0 }}>
                  {o.kind === 'bundle' ? 'Bundle' : '% off'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ink)' }}>{describe(o)}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.1rem' }}>{o.active ? 'Live now' : 'Switched off'}</div>
                </div>
                <button onClick={() => toggle(o)} style={{ fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${o.active ? gold : 'var(--border,#e2e7ee)'}`, color: o.active ? gold : 'var(--ink3)', background: '#fff', borderRadius: '999px', padding: '.35rem .8rem', whiteSpace: 'nowrap' }}>
                  {o.active ? 'On' : 'Off'}
                </button>
                <button onClick={() => remove(o)} title="Delete" style={{ fontSize: '.9rem', cursor: 'pointer', border: 'none', background: 'none', color: 'var(--ink3)' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
