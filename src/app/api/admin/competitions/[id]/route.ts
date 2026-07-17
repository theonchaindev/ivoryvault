import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: { _count: { select: { tickets: true } }, winner: true },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ competition })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const data = await request.json()

    const competition = await prisma.competition.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        prizeValue: data.prizeValue !== undefined ? parseFloat(data.prizeValue) : undefined,
        ticketPrice: data.ticketPrice !== undefined ? parseFloat(data.ticketPrice) : undefined,
        maxTickets: data.maxTickets !== undefined ? parseInt(data.maxTickets) : undefined,
        images: data.images,
        drawDate: data.drawDate ? new Date(data.drawDate) : null,
        status: data.status,
        featured: data.featured !== undefined ? Boolean(data.featured) : undefined,
        sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : undefined,
        type: data.type !== undefined ? (data.type === 'instant' ? 'instant' : 'standard') : undefined,
        instantPrizes: data.type !== undefined ? (data.type === 'instant' ? (data.instantPrizes || '[]') : null) : undefined,
      },
    })

    return NextResponse.json({ competition })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.competition.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
