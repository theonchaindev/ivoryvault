export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import CompetitionsClient from './CompetitionsClient'
import CompetitionsHero from './CompetitionsHero'

async function getCompetitions() {
  try {
    return await prisma.competition.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Competitions — Ivory Vault',
  description: 'Browse all live luxury prize competitions. Enter for your chance to win watches, cash, and extraordinary prizes.',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()

  const serialized = competitions.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate ? c.drawDate.toISOString() : null,
  }))

  return (
    <div className="cpage">
      <CompetitionsHero count={competitions.length} />
      <CompetitionsClient competitions={serialized} />

      <style>{`
        .cpage { background: var(--off); min-height: calc(100vh - 68px); }
      `}</style>
    </div>
  )
}
