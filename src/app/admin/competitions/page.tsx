import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import AdminCompetitionsActions from './AdminCompetitionsActions'
import ReorderList, { type ReorderItem } from './ReorderList'
import { getPublishedGameCards } from '@/lib/instantGames'
import { getListingOrder, sortByListingOrder } from '@/lib/listing'
import { effectiveNow, isCompHidden } from '@/lib/outage'

async function getCompetitions() {
  try {
    return await prisma.competition.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { tickets: true } } },
    })
  } catch {
    return []
  }
}

export default async function AdminCompetitionsPage() {
  const competitions = await getCompetitions()

  // Build the unified, orderable list of everything shown publicly:
  // active/coming-soon competitions + published ticket/instant games.
  const [gameCards, order] = await Promise.all([getPublishedGameCards(), getListingOrder()])
  const compItems: ReorderItem[] = competitions
    .filter(c => !isCompHidden(c.slug) && (c.status === 'active' || c.status === 'coming_soon'))
    .map(c => ({ id: c.id, title: c.title, drawDate: c.drawDate?.toISOString() ?? null, kind: 'comp', status: c.status }))
  const gameItems: ReorderItem[] = gameCards.map(g => ({ id: g.id, title: g.title, drawDate: g.drawDate, kind: 'game', status: 'active' }))
  const orderItems = sortByListingOrder([...gameItems, ...compItems], order, effectiveNow())

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
            Competitions
          </h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {competitions.length} total
          </p>
        </div>
        <Link href="/admin/competitions/new" className="btn-primary" style={{ fontSize: '0.8rem' }}>
          + New Competition
        </Link>
      </div>

      <ReorderList items={orderItems} />

      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
        {competitions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Title', 'Status', 'Price', 'Tickets Sold', 'Draw Date', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '1rem 1.5rem',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink3)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitions.map(comp => (
                <tr key={comp.id}>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '0.9rem' }}>{comp.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', marginTop: '2px' }}>
                      {formatCurrency(comp.prizeValue)} prize
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        backgroundColor: comp.status === 'active' ? 'rgba(37,99,235,0.1)' : comp.status === 'draft' ? 'var(--border)' : '#f5f5f5',
                        color: comp.status === 'active' ? 'var(--gold)' : comp.status === 'draft' ? 'var(--ink3)' : 'var(--ink2)',
                        border: '1px solid',
                        borderColor: comp.status === 'active' ? 'rgba(37,99,235,0.25)' : 'var(--border)',
                      }}
                    >
                      {comp.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink2)' }}>
                    {formatCurrency(comp.ticketPrice)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ink)' }}>
                      {comp.ticketsSold} / {comp.maxTickets}
                    </div>
                    <div style={{ height: '3px', backgroundColor: 'var(--border)', marginTop: '4px', width: '80px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (comp.ticketsSold / comp.maxTickets) * 100)}%`,
                          backgroundColor: 'var(--gold)',
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                    {comp.drawDate ? formatDate(comp.drawDate) : '—'}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <AdminCompetitionsActions competitionId={comp.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink3)' }}>No competitions yet.</p>
            <Link href="/admin/competitions/new" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem', fontSize: '0.8rem' }}>
              Create First Competition
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
