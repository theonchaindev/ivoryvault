import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePrizes, prizeStatus, resolveOutcome, formatPrize } from '@/lib/instant'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { competitionId } = await request.json()
    const comp = await prisma.competition.findUnique({ where: { id: competitionId } })
    if (!comp || comp.type !== 'instant') return NextResponse.json({ error: 'Not an instant competition' }, { status: 400 })

    const prizes = parsePrizes(comp.instantPrizes)

    const result = await prisma.$transaction(async (tx) => {
      const spin = await tx.instantSpin.findFirst({
        where: { userId: session.userId, competitionId: comp.id, revealed: false },
        orderBy: { createdAt: 'asc' },
      })
      if (!spin) return { error: 'no-spins' as const }

      // Amounts already won across the whole competition
      const wonRows = await tx.instantSpin.groupBy({
        by: ['prizeAmount'],
        where: { competitionId: comp.id, revealed: true, prizeAmount: { gt: 0 } },
        _count: { _all: true },
      })
      const wonByAmount: Record<string, number> = {}
      wonRows.forEach(r => { wonByAmount[String(r.prizeAmount)] = r._count._all })

      const status = prizeStatus(prizes, wonByAmount)
      const unrevealedTotal = await tx.instantSpin.count({ where: { competitionId: comp.id, revealed: false } })

      let { win, amount } = resolveOutcome(status, unrevealedTotal)
      // Guard: never over-award a tier
      if (win) {
        const tier = status.find(s => s.amount === amount)
        if (!tier || tier.left <= 0) { win = false; amount = 0 }
      }

      await tx.instantSpin.update({ where: { id: spin.id }, data: { revealed: true, prizeAmount: amount } })

      if (win && amount > 0) {
        await tx.user.update({ where: { id: session.userId }, data: { siteCredit: { increment: amount } } })
        await tx.notification.create({
          data: {
            userId: session.userId,
            title: `Instant win — ${formatPrize(amount)}!`,
            body: `Your ${comp.title} spin won ${formatPrize(amount)} in instant site credit.`,
            icon: 'win',
          },
        })
      }

      // Recompute status + remaining after this reveal
      if (win && amount > 0) wonByAmount[String(amount)] = (wonByAmount[String(amount)] || 0) + 1
      const newStatus = prizeStatus(prizes, wonByAmount)
      const spinsLeft = await tx.instantSpin.count({ where: { userId: session.userId, competitionId: comp.id, revealed: false } })

      return { win, amount, spinsLeft, status: newStatus }
    })

    if ('error' in result) return NextResponse.json(result, { status: 409 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Instant reveal error:', err)
    return NextResponse.json({ error: 'Reveal failed' }, { status: 500 })
  }
}
