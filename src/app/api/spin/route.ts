import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pickOutcome, formatPrize } from '@/lib/wheel'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.freeSpins < 1) {
      return NextResponse.json({ error: 'no-spins', siteCredit: user.siteCredit, freeSpins: 0 }, { status: 409 })
    }

    const outcome = pickOutcome()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        freeSpins: { decrement: 1 },
        ...(outcome.win ? { siteCredit: { increment: outcome.amount } } : {}),
      },
    })

    if (outcome.win) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `You won ${formatPrize(outcome.amount)}!`,
          body: `Your wheel spin landed a win — ${formatPrize(outcome.amount)} site credit has been added to your account.`,
          icon: 'win',
        },
      })
    }

    return NextResponse.json({
      win: outcome.win,
      amount: outcome.amount,
      index: outcome.index,
      siteCredit: updated.siteCredit,
      freeSpins: updated.freeSpins,
    })
  } catch (err) {
    console.error('Spin error:', err)
    return NextResponse.json({ error: 'Spin failed' }, { status: 500 })
  }
}
