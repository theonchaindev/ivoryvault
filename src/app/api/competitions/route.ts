import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'active'

    const where: Record<string, unknown> = { status }
    if (featured === 'true') where.featured = true

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        prizeValue: true,
        ticketPrice: true,
        maxTickets: true,
        ticketsSold: true,
        images: true,
        drawDate: true,
        status: true,
        featured: true,
        sortOrder: true,
      },
    })

    return NextResponse.json({ competitions })
  } catch (error) {
    console.error('Competitions fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
