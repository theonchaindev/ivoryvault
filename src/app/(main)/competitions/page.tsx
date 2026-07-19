export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import CompetitionsClient from './CompetitionsClient'

async function getCompetitions() {
  try {
    return await prisma.competition.findMany({ where: { status: { in: ['active', 'coming_soon'] } }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] })
  } catch { return [] }
}

export const metadata = {
  title: 'Competitions — Ivory Vault',
  description: 'Browse all live luxury prize competitions.',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()
  const serialized = competitions.map(c => ({ ...c, subtitle: c.subtitle ?? null, drawDate: c.drawDate?.toISOString() ?? null }))
  return <CompetitionsClient competitions={serialized} />
}
