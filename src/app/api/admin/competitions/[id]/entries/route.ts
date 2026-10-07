import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Entrant { userId: string; name: string; email: string; phone: string; entries: number; purchases: number; amount: number; first: string; last: string }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const comp = await prisma.competition.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, type: true, ticketPrice: true, ticketsSold: true, maxTickets: true, status: true, drawDate: true },
    })
    if (!comp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const byUser = new Map<string, Entrant>()
    const add = (userId: string, name: string, email: string, phone: string, count: number, when: Date, amount: number) => {
      const cur = byUser.get(userId)
      if (cur) {
        cur.entries += count; cur.purchases += 1; cur.amount += amount
        const w = when.toISOString()
        if (w < cur.first) cur.first = w
        if (w > cur.last) cur.last = w
      } else {
        const w = when.toISOString()
        byUser.set(userId, { userId, name: name || '(no name)', email, phone: phone || '', entries: count, purchases: 1, amount, first: w, last: w })
      }
    }

    if (comp.type === 'instant') {
      const spins = await prisma.instantSpin.findMany({
        where: { competitionId: id },
        select: { userId: true, createdAt: true, user: { select: { name: true, email: true, phone: true } } },
      })
      spins.forEach(s => add(s.userId, s.user.name, s.user.email, s.user.phone || '', 1, s.createdAt, comp.ticketPrice))
    } else {
      const tickets = await prisma.ticket.findMany({
        where: { competitionId: id },
        select: { userId: true, quantity: true, purchasedAt: true, user: { select: { name: true, email: true, phone: true } } },
      })
      tickets.forEach(t => add(t.userId, t.user.name, t.user.email, t.user.phone || '', t.quantity, t.purchasedAt, comp.ticketPrice * t.quantity))
    }

    const entrants = [...byUser.values()].sort((a, b) => b.entries - a.entries)
    const totalEntries = entrants.reduce((s, e) => s + e.entries, 0)
    const totalAmount = entrants.reduce((s, e) => s + e.amount, 0)
    return NextResponse.json({ competition: comp, entrants, totals: { entrants: entrants.length, entries: totalEntries, amount: totalAmount } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/competitions/entries]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
