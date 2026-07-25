import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// One-time full ticket reset: zero every comp's sold count and wipe all
// entry records (tickets + instant spins). Leaves users, site credit and
// the competitions themselves intact; resets tier-spin tracking so future
// purchases award correctly from zero.
export async function POST() {
  try {
    await requireAdmin()

    const result = await prisma.$transaction(async (tx) => {
      const spins = await tx.instantSpin.deleteMany({})
      const tickets = await tx.ticket.deleteMany({})
      const comps = await tx.competition.updateMany({ data: { ticketsSold: 0 } })
      const users = await tx.user.updateMany({ data: { spinsFromTier: 0, spinsFromTickets: 0 } })
      return {
        instantSpinsDeleted: spins.count,
        ticketsDeleted: tickets.count,
        competitionsReset: comps.count,
        usersReset: users.count,
      }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('reset-tickets error:', e)
    return NextResponse.json({ error: e.message || 'Reset failed' }, { status: 500 })
  }
}
