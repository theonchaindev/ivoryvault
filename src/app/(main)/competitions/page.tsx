export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { CLOSED_WINDOW_MS, isCompClosed, isCompUpcoming } from '@/lib/compState'
import { effectiveNow, isCompHidden } from '@/lib/outage'
import CompetitionsClient from './CompetitionsClient'
import { getPublishedGameCards } from '@/lib/instantGames'
import { getListingOrder, sortByListingOrder } from '@/lib/listing'

async function getCompetitions() {
  // Closed standard comps linger for 16h after their draw date, then drop off.
  const cutoff = new Date(effectiveNow() - CLOSED_WINDOW_MS)
  try {
    const rows = await prisma.competition.findMany({
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
    return rows.filter(c => !isCompHidden(c.slug))
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
  // Everything (comps + ticket/instant games) in one list, ordered by the saved
  // manual order first, then earliest finishing first.
  const [gameCards, order] = await Promise.all([getPublishedGameCards(), getListingOrder()])
  const list = sortByListingOrder([...gameCards, ...serialized], order, now)
  return <CompetitionsClient competitions={list} />
}
