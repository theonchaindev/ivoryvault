export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { CLOSED_WINDOW_MS, isCompClosed } from '@/lib/compState'
import CompetitionsClient from './CompetitionsClient'

async function getCompetitions() {
  // Closed standard comps linger for 16h after their draw date, then drop off.
  const cutoff = new Date(Date.now() - CLOSED_WINDOW_MS)
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
  title: 'Competitions — Ivory Vault',
  description: 'Browse all live luxury prize competitions.',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const serialized = competitions.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
    closed: isCompClosed(c),
  }))
  // Open competitions first, closed ones sink to the bottom.
  serialized.sort((a, b) => Number(a.closed) - Number(b.closed))
  return <CompetitionsClient competitions={serialized} />
}
