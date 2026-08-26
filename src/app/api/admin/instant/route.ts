import { NextRequest, NextResponse, after } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePrizes, prizeStatus, prizeKey, type PrizeKind } from '@/lib/instant'
import { sendInstantWinEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function fail(err: unknown) {
  const e = err as Error
  if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
  }
  console.error('admin instant error:', e)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

// GET ?competitionId=… → prize pool status, winners, and every entry by ticket number.
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const competitionId = req.nextUrl.searchParams.get('competitionId')
    if (!competitionId) return NextResponse.json({ pool: [], winners: [], entries: [] })

    const comp = await prisma.competition.findUnique({ where: { id: competitionId } })
    if (!comp || comp.type !== 'instant') return NextResponse.json({ error: 'Not an instant competition' }, { status: 400 })

    const prizes = parsePrizes(comp.instantPrizes)
    const spins = await prisma.instantSpin.findMany({
      where: { competitionId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { user: { select: { name: true, email: true } } },
    })

    const wonByKey: Record<string, number> = {}
    spins.forEach(s => {
      if (s.revealed && s.prizeAmount > 0) {
        const k = prizeKey(s.prizeAmount, s.prizeType === 'cash' ? 'cash' : 'credit')
        wonByKey[k] = (wonByKey[k] || 0) + 1
      }
    })
    const pool = prizeStatus(prizes, wonByKey)

    const entries = spins.map((s, i) => ({
      spinId: s.id,
      ticketNumber: i + 1,
      name: s.user?.name || '(no name)',
      email: s.user?.email || '',
      revealed: s.revealed,
      prizeAmount: s.prizeAmount,
      prizeType: s.prizeType === 'cash' ? 'cash' : 'credit',
    }))
    const winners = entries.filter(e => e.prizeAmount > 0)

    return NextResponse.json({
      title: comp.title, maxTickets: comp.maxTickets, ticketsSold: comp.ticketsSold,
      pool, winners, entries,
    })
  } catch (err) { return fail(err) }
}

// POST → manually award a prize to a specific entry (ticket).
// Body: { spinId, amount, kind }
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { spinId, amount, kind } = await req.json()
    const amt = Number(amount)
    const k: PrizeKind = kind === 'cash' ? 'cash' : 'credit'
    if (!spinId || !(amt > 0)) return NextResponse.json({ error: 'Pick a valid prize to award' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      const spin = await tx.instantSpin.findUnique({ where: { id: spinId } })
      if (!spin) return { error: 'Entry not found' }
      if (spin.prizeAmount > 0) return { error: 'That entry has already won a prize' }

      const comp = await tx.competition.findUnique({ where: { id: spin.competitionId } })
      if (!comp) return { error: 'Competition not found' }

      // Guard the pool: don't over-award a tier.
      const prizes = parsePrizes(comp.instantPrizes)
      const tier = prizes.find(p => p.amount === amt && p.kind === k)
      if (!tier) return { error: 'That prize is not in this competition’s pool' }
      const alreadyWon = await tx.instantSpin.count({ where: { competitionId: comp.id, revealed: true, prizeAmount: amt, prizeType: k } })
      if (alreadyWon >= tier.total) return { error: `No ${k} prizes of that value left to award` }

      await tx.instantSpin.update({ where: { id: spin.id }, data: { revealed: true, prizeAmount: amt, prizeType: k } })

      if (k === 'credit') {
        await tx.user.update({ where: { id: spin.userId }, data: { siteCredit: { increment: amt } } })
      }
      await tx.notification.create({
        data: {
          userId: spin.userId,
          title: `Instant win — ${amt < 1 ? Math.round(amt * 100) + 'p' : '£' + amt} ${k}!`,
          body: k === 'credit'
            ? `You won an instant prize on ${comp.title} — it's been added to your site credit.`
            : `You won an instant cash prize on ${comp.title}. We'll be in touch to arrange payment.`,
          icon: 'win',
        },
      })
      const user = await tx.user.findUnique({ where: { id: spin.userId }, select: { email: true, name: true } })
      return { ok: true, email: user?.email || null, name: user?.name || 'there', amount: amt, kind: k }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })
    if (result.email) after(() => sendInstantWinEmail(result.email as string, result.name, result.amount, result.kind))
    return NextResponse.json({ ok: true })
  } catch (err) { return fail(err) }
}
