'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface GameRow { id: string; slug: string; name: string; published: boolean; priceP: number; poolSize: number; image: string; endsAt: string | null; winners: number; sold: number; won: number }

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)

export default function InstantWinIndex() {
  const router = useRouter()
  const [games, setGames] = useState<GameRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/admin/instant-win')
      if (!res.ok) throw new Error('load failed')
      setGames((await res.json()).games || [])
    } catch { setErr('Could not load games.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    const name = prompt('Name your new instant win game (e.g. October Instant Win)')
    if (name === null) return
    setCreating(true); setErr('')
    try {
      const res = await fetch('/api/admin/instant-win', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() || 'New Instant Win' }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'failed')
      router.push(`/admin/instant-win/${d.id}`)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create.'); setCreating(false) }
  }

  if (loading) return <p style={{ color: 'var(--ink3)' }}>Loading…</p>

  return (
    <div style={{ maxWidth: '900px' }}>
      {err && <div style={{ background: '#fdf2f1', color: '#b23b2e', border: '1px solid #f3c2bd', borderRadius: '10px', padding: '.8rem 1rem', marginBottom: '1rem', fontSize: '.85rem' }}>{err}</div>}

      <button onClick={create} disabled={creating} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '10px', padding: '.85rem 1.8rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem', opacity: creating ? .6 : 1 }}>
        {creating ? 'Creating…' : '+ Create new game'}
      </button>

      {games.length === 0
        ? <p style={{ color: 'var(--ink3)' }}>No games yet — create your first one.</p>
        : (
          <div style={{ display: 'grid', gap: '.85rem' }}>
            {games.map(g => (
              <Link key={g.id} href={`/admin/instant-win/${g.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e7ee)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <div style={{ width: '64px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(160deg,#f6f3ea,#efe9da)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {g.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={g.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.3rem' }}>🎟</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <strong style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem' }}>{g.name}</strong>
                      <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.2rem .5rem', borderRadius: '999px', background: g.published ? '#dcfce7' : '#f1f5f9', color: g.published ? '#15803d' : '#64748b' }}>{g.published ? 'Live' : 'Hidden'}</span>
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--ink3)', marginTop: '.2rem' }}>{money(g.priceP / 100)}/ticket · {g.winners} winning of {g.poolSize} · {g.sold} sold ({g.won} won)</div>
                  </div>
                  <span style={{ color: 'var(--gold,#2563eb)', fontSize: '.8rem', fontWeight: 700 }}>Manage →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
