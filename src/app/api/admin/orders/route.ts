import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const tickets = await prisma.ticket.findMany({
      orderBy: { purchasedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        competition: { select: { id: true, title: true, ticketPrice: true } },
      },
    })

    return NextResponse.json({ tickets })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
