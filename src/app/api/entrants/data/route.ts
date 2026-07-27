import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyEntrantsToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '•••'
  const first = local[0] || ''
  return `${first}${'•'.repeat(Math.max(3, local.length - 1))}@${domain}`
}

export async function GET(request: NextRequest) {
  const token = (await cookies()).get('iv-entrants')?.value
  if (!(await verifyEntrantsToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const competitions = await prisma.competition.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, type: true, ticketsSold: true, status: true },
  })

  const compId = request.nextUrl.searchParams.get('competitionId')
  if (!compId) return NextResponse.json({ competitions })

  const comp = competitions.find(c => c.id === compId)
  if (!comp) return NextResponse.json({ competitions, entrants: [] })

  // Aggregate entries per user (tickets for standard comps, spins for instant)
  const byUser = new Map<string, { name: string; email: string; entries: number; first: Date }>()
  const add = (userId: string, name: string, email: string, count: number, when: Date) => {
    const cur = byUser.get(userId)
    if (cur) { cur.entries += count; if (when < cur.first) cur.first = when }
    else byUser.set(userId, { name, email, entries: count, first: when })
  }

  if (comp.type === 'instant') {
    const spins = await prisma.instantSpin.findMany({
      where: { competitionId: compId },
      select: { userId: true, createdAt: true, user: { select: { name: true, email: true } } },
    })
    spins.forEach(s => add(s.userId, s.user.name, s.user.email, 1, s.createdAt))
  } else {
    const tickets = await prisma.ticket.findMany({
      where: { competitionId: compId },
      select: { userId: true, quantity: true, purchasedAt: true, user: { select: { name: true, email: true } } },
    })
    tickets.forEach(t => add(t.userId, t.user.name, t.user.email, t.quantity, t.purchasedAt))
  }

  const entrants = Array.from(byUser.values())
    .sort((a, b) => b.entries - a.entries)
    .map(e => ({ name: e.name, email: maskEmail(e.email), entries: e.entries, first: e.first.toISOString() }))

  const totalEntries = entrants.reduce((s, e) => s + e.entries, 0)
  return NextResponse.json({ competitions, entrants, totalEntries, entrantCount: entrants.length })
}
