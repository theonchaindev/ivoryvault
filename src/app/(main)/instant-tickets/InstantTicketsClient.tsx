'use client'

import TicketReveal, { type TicketResult } from '@/components/TicketReveal'

interface Tier { type: 'credit' | 'custom'; amount: number; total: number; name?: string; image?: string }
const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)

export default function InstantTicketsClient({
  price, image, prizes, poolSize, pending, signedIn, creditAvailable,
}: {
  price: number
  image: string
  prizes: Tier[]
  poolSize: number
  pending: number
  signedIn: boolean
  creditAvailable: number
}) {
  const onCheckout = async (qty: number, useCredit: boolean) => {
    const res = await fetch('/api/ticketgame/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty, useCredit }),
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (d.needsLogin) { window.location.href = '/login?from=/instant-tickets'; return }
      throw new Error(d.error || 'Could not start checkout.')
    }
    if (d.url) window.location.href = d.url
  }

  const onRevealNext = async (): Promise<TicketResult | null> => {
    const res = await fetch('/api/ticketgame/reveal', { method: 'POST' })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (d.error === 'no-tickets') return null
      throw new Error(d.error || 'Could not reveal.')
    }
    return d.result as TicketResult
  }

  const shown = [...prizes].sort((a, b) => b.amount - a.amount)
  const totalWinners = prizes.reduce((s, t) => s + t.total, 0)

  return (
    <>
      <TicketReveal
        price={price}
        maxQty={25}
        title="Instant Win Tickets"
        heroImage={image}
        onCheckout={onCheckout}
        onRevealNext={onRevealNext}
        pending={pending}
        signedIn={signedIn}
        creditAvailable={creditAvailable}
      />

      {shown.length > 0 && (
        <div style={{ maxWidth: '900px', margin: '4.5rem auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ display: 'inline-block', fontSize: '.62rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink3)' }}>Prize pool</span>
            <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.9rem', fontWeight: 600, margin: '.35rem 0 .25rem' }}>All available prizes</h2>
            <p style={{ color: 'var(--ink3)', fontSize: '.85rem', margin: 0 }}>{totalWinners} winning ticket{totalWinners === 1 ? '' : 's'} in a pool of {poolSize}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem' }}>
            {shown.map((p, i) => (
              <div key={i} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', background: 'linear-gradient(160deg,#f6f3ea,#efe9da)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.type === 'credit'
                    ? <span style={{ fontSize: '2.4rem' }}>💰</span>
                    : p.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.image} alt="" style={{ display: 'block', maxWidth: '82%', maxHeight: '82%', width: 'auto', height: 'auto', objectFit: 'contain' }} />
                      : <span style={{ fontSize: '2.4rem' }}>🎁</span>}
                  <span style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: '#1b2432', color: '#fff', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.04em', padding: '.2rem .45rem', borderRadius: '999px' }}>×{p.total}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', lineHeight: 1.15 }}>{p.type === 'credit' ? `${money(p.amount)} site credit` : (p.name || 'Prize')}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: '.15rem' }}>{p.type === 'credit' ? 'Added to your account' : (p.amount > 0 ? `Worth ${money(p.amount)}` : 'Instant prize')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
