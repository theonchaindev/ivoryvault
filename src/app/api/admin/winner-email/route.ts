import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWinnerEmail } from '@/lib/email'
import { listGameWinners } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

function fail(err: unknown) {
  const e = err as Error
  if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
  }
  console.error('winner-email error:', e)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

// GET ?competitionId=… → the entry pool for that competition as
// [{ ticketNumber, userId, name, email }] (each ticket expanded to a numbered entry).
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    // Instant/ticket game: return its actual winners (each won prize).
    const gameId = req.nextUrl.searchParams.get('gameId')
    if (gameId) {
      const winners = await listGameWinners(gameId)
      return NextResponse.json({ entrants: winners })
    }

    const competitionId = req.nextUrl.searchParams.get('competitionId')
    if (!competitionId) return NextResponse.json({ entrants: [] })

    const tickets = await prisma.ticket.findMany({
      where: { competitionId },
      orderBy: [{ purchasedAt: 'asc' }, { id: 'asc' }],
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    const entrants: { ticketNumber: number; userId: string; name: string; email: string }[] = []
    for (const t of tickets) {
      for (let i = 0; i < t.quantity; i++) {
        entrants.push({
          ticketNumber: entrants.length + 1,
          userId: t.userId,
          name: t.user?.name || '(no name)',
          email: t.user?.email || '',
        })
      }
    }
    return NextResponse.json({ entrants })
  } catch (err) { return fail(err) }
}

// POST → send the winner email.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { name, email, competitionTitle, ticketNumber, prizeTitle } = await req.json()
    if (!name?.trim() || !email?.trim() || !competitionTitle?.trim()) {
      return NextResponse.json({ error: 'Winner name, email and competition are required' }, { status: 400 })
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ error: 'That email address looks invalid' }, { status: 400 })
    }
    await sendWinnerEmail(email.trim(), {
      name: name.trim(),
      competitionTitle: competitionTitle.trim(),
      ticketNumber: ticketNumber ?? null,
      prizeTitle: prizeTitle?.trim() || null,
    })
    return NextResponse.json({ ok: true })
  } catch (err) { return fail(err) }
}
