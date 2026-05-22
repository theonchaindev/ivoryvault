import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { competitionId, quantity } = await request.json()

    if (!competitionId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Competition ID and quantity are required' }, { status: 400 })
    }

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    if (competition.status !== 'active') {
      return NextResponse.json({ error: 'Competition is not active' }, { status: 400 })
    }

    const remaining = competition.maxTickets - competition.ticketsSold
    if (quantity > remaining) {
      return NextResponse.json({ error: `Only ${remaining} tickets remaining` }, { status: 400 })
    }

    if (quantity > 50) {
      return NextResponse.json({ error: 'Maximum 50 tickets per transaction' }, { status: 400 })
    }

    const amount = Math.round(competition.ticketPrice * quantity * 100) // pence

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      metadata: {
        competitionId,
        userId: session.userId,
        quantity: String(quantity),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
