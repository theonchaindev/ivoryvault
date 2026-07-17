import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePrizes, prizeStatus, prizeKey } from '@/lib/instant'
import InstantReveal from './InstantReveal'

export const dynamic = 'force-dynamic'

export default async function InstantRevealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect(`/login?from=/instant/${slug}`)

  const comp = await prisma.competition.findUnique({ where: { slug } })
  if (!comp || comp.type !== 'instant') notFound()

  const [spinsLeft, wonRows] = await Promise.all([
    prisma.instantSpin.count({ where: { userId: session.userId, competitionId: comp.id, revealed: false } }),
    prisma.instantSpin.groupBy({
      by: ['prizeAmount', 'prizeType'],
      where: { competitionId: comp.id, revealed: true, prizeAmount: { gt: 0 } },
      _count: { _all: true },
    }),
  ])
  const wonByKey: Record<string, number> = {}
  wonRows.forEach(r => { wonByKey[prizeKey(r.prizeAmount, r.prizeType === 'cash' ? 'cash' : 'credit')] = r._count._all })

  const status = prizeStatus(parsePrizes(comp.instantPrizes), wonByKey)

  return (
    <InstantReveal
      competitionId={comp.id}
      slug={comp.slug}
      title={comp.title}
      spinsLeft={spinsLeft}
      status={status}
    />
  )
}
