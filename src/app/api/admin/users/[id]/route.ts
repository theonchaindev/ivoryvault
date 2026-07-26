import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function fail(err: unknown) {
  const e = err as Error
  if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
  }
  console.error('admin user route error:', e)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

// ── Full member detail ──
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, siteCredit: true,
        freeSpins: true, spinsFromTier: true, spinsFromTickets: true, createdAt: true,
        tickets: {
          orderBy: { purchasedAt: 'desc' },
          select: { id: true, quantity: true, stripePaymentId: true, purchasedAt: true,
            competition: { select: { id: true, title: true, ticketPrice: true, slug: true } } },
        },
        instantSpins: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, revealed: true, prizeAmount: true, prizeType: true, createdAt: true,
            competition: { select: { title: true } } },
        },
        winners: {
          orderBy: { drawnAt: 'desc' },
          select: { id: true, prizeTitle: true, prizeValue: true, drawnAt: true, announced: true,
            competition: { select: { title: true } } },
        },
        notifications: {
          orderBy: { createdAt: 'desc' }, take: 25,
          select: { id: true, title: true, body: true, icon: true, read: true, createdAt: true },
        },
      },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const totalEntries = user.tickets.reduce((s, t) => s + t.quantity, 0)
    const totalSpent = user.tickets.reduce((s, t) => s + t.competition.ticketPrice * t.quantity, 0)
    const spinsUnrevealed = user.instantSpins.filter(s => !s.revealed).length
    const spinsWon = user.instantSpins.filter(s => s.revealed && s.prizeAmount > 0)
    const wonTotal = spinsWon.reduce((s, x) => s + x.prizeAmount, 0)

    return NextResponse.json({ user, stats: { totalEntries, totalSpent, spinsUnrevealed, wonCount: spinsWon.length, wonTotal } })
  } catch (err) {
    return fail(err)
  }
}

// ── Actions: add/deduct credit, add/remove entries, reset password ──
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const action = body.action as string

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (action === 'credit') {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount === 0) return NextResponse.json({ error: 'Enter a non-zero amount' }, { status: 400 })
      const updated = await prisma.user.update({ where: { id }, data: { siteCredit: { increment: amount } }, select: { siteCredit: true } })
      await prisma.notification.create({
        data: {
          userId: id,
          title: amount > 0 ? `£${amount.toFixed(2)} site credit added` : `£${Math.abs(amount).toFixed(2)} site credit removed`,
          body: (body.note as string) || (amount > 0 ? 'Site credit has been added to your account.' : 'Your site credit balance was adjusted.'),
          icon: 'win',
        },
      })
      return NextResponse.json({ ok: true, siteCredit: updated.siteCredit })
    }

    if (action === 'deleteEntry') {
      const ticket = await prisma.ticket.findUnique({ where: { id: body.ticketId as string }, select: { id: true, userId: true, competitionId: true, quantity: true } })
      if (!ticket || ticket.userId !== id) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      await prisma.$transaction([
        prisma.ticket.delete({ where: { id: ticket.id } }),
        prisma.competition.update({ where: { id: ticket.competitionId }, data: { ticketsSold: { decrement: ticket.quantity } } }),
      ])
      return NextResponse.json({ ok: true })
    }

    if (action === 'addEntry') {
      const competitionId = body.competitionId as string
      const quantity = Math.max(1, parseInt(String(body.quantity), 10) || 1)
      const comp = await prisma.competition.findUnique({ where: { id: competitionId }, select: { id: true, type: true } })
      if (!comp) return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
      if (comp.type === 'instant') {
        await prisma.instantSpin.createMany({ data: Array.from({ length: quantity }, () => ({ userId: id, competitionId })) })
      } else {
        await prisma.ticket.create({ data: { userId: id, competitionId, quantity, stripePaymentId: 'admin-manual' } })
      }
      await prisma.competition.update({ where: { id: competitionId }, data: { ticketsSold: { increment: quantity } } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'password') {
      const password = String(body.password || '')
      if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      const hashed = await bcrypt.hash(password, 12)
      await prisma.user.update({ where: { id }, data: { password: hashed } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return fail(err)
  }
}
