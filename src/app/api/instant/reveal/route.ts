import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePrizes, prizeStatus, resolveOutcome, formatPrize, prizeKey } from '@/lib/instant'

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

      // Prizes already won across the whole competition, keyed by amount + type
      const wonRows = await tx.instantSpin.groupBy({
        by: ['prizeAmount', 'prizeType'],
        where: { competitionId: comp.id, revealed: true, prizeAmount: { gt: 0 } },
        _count: { _all: true },
      })
      const wonByKey: Record<string, number> = {}
      wonRows.forEach(r => { wonByKey[prizeKey(r.prizeAmount, r.prizeType === 'cash' ? 'cash' : 'credit')] = r._count._all })

      const status = prizeStatus(prizes, wonByKey)
      // Drip the prize pool across every entry in the competition, not just the ones sold so far.
      const revealedCount = await tx.instantSpin.count({ where: { competitionId: comp.id, revealed: true } })
      const remainingEntries = Math.max(1, comp.maxTickets - revealedCount)

      let { win, amount, kind } = resolveOutcome(status, remainingEntries)
      // Guard: never over-award a tier
      if (win) {
        const tier = status.find(s => s.amount === amount && s.kind === kind)
        if (!tier || tier.left <= 0) { win = false; amount = 0 }
      }

      await tx.instantSpin.update({
        where: { id: spin.id },
        data: { revealed: true, prizeAmount: win ? amount : 0, prizeType: win ? kind : 'credit' },
      })

      if (win && amount > 0) {
        if (kind === 'credit') {
          await tx.user.update({ where: { id: session.userId }, data: { siteCredit: { increment: amount } } })
          await tx.notification.create({
            data: {
              userId: session.userId,
              title: `Instant win — ${formatPrize(amount)} credit!`,
              body: `Your ${comp.title} spin won ${formatPrize(amount)} in instant site credit.`,
              icon: 'win',
            },
          })
        } else {
          await tx.notification.create({
            data: {
              userId: session.userId,
              title: `Instant win — ${formatPrize(amount)} cash!`,
              body: `Your ${comp.title} spin won a ${formatPrize(amount)} cash prize. We'll be in touch to arrange payment.`,
              icon: 'win',
            },
          })
        }
      }

      // Recompute status + remaining after this reveal
      if (win && amount > 0) wonByKey[prizeKey(amount, kind)] = (wonByKey[prizeKey(amount, kind)] || 0) + 1
      const newStatus = prizeStatus(prizes, wonByKey)
      const spinsLeft = await tx.instantSpin.count({ where: { userId: session.userId, competitionId: comp.id, revealed: false } })

      return { win, amount, kind, spinsLeft, status: newStatus }
    })

    if ('error' in result) return NextResponse.json(result, { status: 409 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Instant reveal error:', err)
    return NextResponse.json({ error: 'Reveal failed' }, { status: 500 })
  }
}
