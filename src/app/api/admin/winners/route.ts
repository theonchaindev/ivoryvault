import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const winners = await prisma.winner.findMany({
      orderBy: { drawnAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        competition: { select: { id: true, title: true, prizeValue: true, slug: true } },
      },
    })

    return NextResponse.json({ winners })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const { id, announced } = await request.json()

    const winner = await prisma.winner.update({
      where: { id },
      data: { announced: Boolean(announced) },
    })

    return NextResponse.json({ winner })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
