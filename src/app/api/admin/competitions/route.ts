import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    await requireAdmin()

    const competitions = await prisma.competition.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { tickets: true } } },
    })

    return NextResponse.json({ competitions })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const data = await request.json()
    const {
      title, subtitle, description, prizeValue, ticketPrice,
      maxTickets, images, drawDate, status, featured, sortOrder,
      type, instantPrizes,
    } = data

    if (!title || !description || !prizeValue || !ticketPrice || !maxTickets) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = slugify(title)

    // Ensure unique slug
    let finalSlug = slug
    let counter = 1
    while (await prisma.competition.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`
    }

    const competition = await prisma.competition.create({
      data: {
        slug: finalSlug,
        title,
        subtitle: subtitle || null,
        description,
        prizeValue: parseFloat(prizeValue),
        ticketPrice: parseFloat(ticketPrice),
        maxTickets: parseInt(maxTickets),
        images: images || '[]',
        drawDate: drawDate ? new Date(drawDate) : null,
        status: status || 'draft',
        featured: Boolean(featured),
        sortOrder: parseInt(sortOrder) || 0,
        type: type === 'instant' ? 'instant' : 'standard',
        instantPrizes: type === 'instant' ? (instantPrizes || '[]') : null,
      },
    })

    return NextResponse.json({ competition }, { status: 201 })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Create competition error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
