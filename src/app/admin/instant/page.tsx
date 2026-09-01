import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import InstantWinIndex from '../instant-win/InstantWinIndex'

export const dynamic = 'force-dynamic'

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const firstImg = (raw: string) => { try { return (JSON.parse(raw) as string[])[0] || '' } catch { return '' } }

export default async function AdminInstantPage() {
  // Legacy spin-based instant-win games are stored as competitions (type 'instant').
  const spinGames = await prisma.competition.findMany({
    where: { type: 'instant' },
    orderBy: [{ createdAt: 'desc' }],
    select: { id: true, title: true, status: true, images: true, ticketPrice: true, ticketsSold: true, maxTickets: true },
  }).catch(() => [])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Instant Wins</h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
          Create and manage instant-win games. Each game has its own prizes (pick the winning ticket numbers),
          ticket price, pool, image and countdown, and stays hidden until you switch it on. Click a game to manage it.
        </p>
      </div>

      <InstantWinIndex kind="instant" label="instant win" />

      {spinGames.length > 0 && (
        <div style={{ maxWidth: '900px', marginTop: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.4rem' }}>Existing spin games</h2>
          <p style={{ color: 'var(--ink3)', fontSize: '.8rem', marginBottom: '1rem' }}>Older instant-win games built on the spin-wheel mechanic. These are managed as competitions — click to edit.</p>
          <div style={{ display: 'grid', gap: '.85rem' }}>
            {spinGames.map(c => {
              const img = firstImg(c.images)
              return (
                <Link key={c.id} href={`/admin/competitions/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e7ee)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                    <div style={{ width: '64px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(160deg,#f6f3ea,#efe9da)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {img
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.3rem' }}>🎡</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                        <strong style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem' }}>{c.title}</strong>
                        <span style={{ fontSize: '.55rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.2rem .5rem', borderRadius: '999px', background: '#eef2ff', color: '#4338ca' }}>Spin game</span>
                        <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.2rem .5rem', borderRadius: '999px', background: c.status === 'active' ? '#dcfce7' : '#f1f5f9', color: c.status === 'active' ? '#15803d' : '#64748b' }}>{c.status === 'active' ? 'Live' : c.status}</span>
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--ink3)', marginTop: '.2rem' }}>{money(c.ticketPrice)}/spin · {c.ticketsSold} of {c.maxTickets} sold</div>
                    </div>
                    <span style={{ color: 'var(--gold,#2563eb)', fontSize: '.8rem', fontWeight: 700 }}>Manage →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
