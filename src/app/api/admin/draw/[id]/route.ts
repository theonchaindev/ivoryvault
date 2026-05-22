import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: { tickets: true },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    if (competition.tickets.length === 0) {
      return NextResponse.json({ error: 'No tickets sold for this competition' }, { status: 400 })
    }

    // Check if winner already drawn
    const existingWinner = await prisma.winner.findUnique({
      where: { competitionId: id },
    })
    if (existingWinner) {
      return NextResponse.json({ error: 'Winner already drawn for this competition' }, { status: 400 })
    }

    // Build weighted pool
    const pool: Array<{ userId: string; ticketIndex: number }> = []
    competition.tickets.forEach(t => {
      for (let i = 0; i < t.quantity; i++) {
        pool.push({ userId: t.userId, ticketIndex: pool.length + 1 })
      }
    })

    const winnerEntry = pool[Math.floor(Math.random() * pool.length)]

    // Update competition status and create winner
    const [, winner] = await prisma.$transaction([
      prisma.competition.update({
        where: { id },
        data: { status: 'completed' },
      }),
      prisma.winner.create({
        data: {
          competitionId: id,
          userId: winnerEntry.userId,
          ticketNumber: winnerEntry.ticketIndex,
          announced: false,
          prizeTitle: competition.title,
          prizeValue: competition.prizeValue,
        },
      }),
    ])

    const fullWinner = await prisma.winner.findUnique({
      where: { id: winner.id },
      include: {
        user: { select: { name: true, email: true } },
        competition: { select: { title: true } },
      },
    })

    return NextResponse.json({ winner: fullWinner })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Draw error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
