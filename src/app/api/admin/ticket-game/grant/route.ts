import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPlays, countUnrevealed } from '@/lib/ticketGame'

export const dynamic = 'force-dynamic'

// Manually grant N ticket-game plays to a member — used to recover a paid order
// whose webhook didn't deliver. Admin-only.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { email?: string; quantity?: number }
    const email = (b.email || '').toLowerCase().trim()
    const qty = Math.max(1, Math.min(100, Math.round(Number(b.quantity) || 0)))
    if (!email) return NextResponse.json({ error: 'Enter the member’s email.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } })
    if (!user) return NextResponse.json({ error: 'No member found with that email.' }, { status: 404 })

    await createPlays(user.id, qty)
    await prisma.notification.create({
      data: { userId: user.id, title: `${qty} Instant Win ticket${qty === 1 ? '' : 's'} added`, body: `We’ve added ${qty} Instant Win ticket${qty === 1 ? '' : 's'} to your account — head to the game to reveal ${qty === 1 ? 'it' : 'them'}.`, icon: 'info' },
    }).catch(() => {})

    const pending = await countUnrevealed(user.id)
    return NextResponse.json({ ok: true, granted: qty, email, pending })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/ticket-game/grant]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
