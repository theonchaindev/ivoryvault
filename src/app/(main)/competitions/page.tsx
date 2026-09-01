export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { CLOSED_WINDOW_MS, isCompClosed, isCompUpcoming } from '@/lib/compState'
import { effectiveNow } from '@/lib/outage'
import CompetitionsClient from './CompetitionsClient'
import { getTicketGameCard } from '@/lib/ticketGame'

async function getCompetitions() {
  // Closed standard comps linger for 16h after their draw date, then drop off.
  const cutoff = new Date(effectiveNow() - CLOSED_WINDOW_MS)
  try {
    return await prisma.competition.findMany({
      where: {
        OR: [
          { status: 'coming_soon' },
          { status: 'active', type: 'instant' },
          // Standard active comps: open, dateless, or closed within the 16h window
          { status: 'active', type: { not: 'instant' }, OR: [{ drawDate: null }, { drawDate: { gt: cutoff } }] },
          // Drawn comps stay on for the same 16h window
          { status: 'completed', drawDate: { gt: cutoff } },
        ],
      },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  } catch { return [] }
}

export const metadata = {
  title: 'Competitions',
  description: 'Browse all live luxury prize competitions.',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const now = effectiveNow()
  const serialized = competitions.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
    closed: isCompClosed(c, now),
    upcoming: isCompUpcoming(c, now),
  }))
  // Order: live (enter now) → enter soon → coming soon → closed.
  // Within each group, the soonest draw date first (comps ending soon lead).
  const rank = (c: typeof serialized[number]) =>
    c.closed ? 4 : c.status === 'coming_soon' ? 3 : c.upcoming ? 2 : 1
  const drawTs = (c: typeof serialized[number]) => c.drawDate ? new Date(c.drawDate).getTime() : Infinity
  serialized.sort((a, b) =>
    rank(a) - rank(b) || drawTs(a) - drawTs(b) || Number(b.featured) - Number(a.featured))
  // Prepend the ticket game tile (links to /instant-tickets) when it's published.
  const ticketCard = await getTicketGameCard()
  const list = ticketCard ? [ticketCard, ...serialized] : serialized
  return <CompetitionsClient competitions={list} />
}
