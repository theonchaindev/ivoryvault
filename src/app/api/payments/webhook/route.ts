import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { competitionId, userId, quantity } = paymentIntent.metadata

    try {
      const qty = parseInt(quantity, 10)

      // Create ticket record
      await prisma.ticket.create({
        data: {
          userId,
          competitionId,
          quantity: qty,
          stripePaymentId: paymentIntent.id,
        },
      })

      // Update ticketsSold
      const competition = await prisma.competition.update({
        where: { id: competitionId },
        data: { ticketsSold: { increment: qty } },
      })

      // Auto-draw if sold out
      if (competition.ticketsSold >= competition.maxTickets && competition.status === 'active') {
        // Get all tickets for this competition
        const tickets = await prisma.ticket.findMany({
          where: { competitionId },
        })

        // Build a weighted list: each ticket appears 'quantity' times
        const pool: Array<{ userId: string; ticketIndex: number }> = []
        tickets.forEach(t => {
          for (let i = 0; i < t.quantity; i++) {
            pool.push({ userId: t.userId, ticketIndex: pool.length + 1 })
          }
        })

        if (pool.length > 0) {
          const winnerEntry = pool[Math.floor(Math.random() * pool.length)]

          await prisma.competition.update({
            where: { id: competitionId },
            data: { status: 'completed' },
          })

          // Create winner (skip if already exists)
          const existingWinner = await prisma.winner.findUnique({
            where: { competitionId },
          })

          if (!existingWinner) {
            await prisma.winner.create({
              data: {
                competitionId,
                userId: winnerEntry.userId,
                ticketNumber: winnerEntry.ticketIndex,
                announced: false,
                prizeTitle: competition.title,
                prizeValue: competition.prizeValue,
              },
            })
          }
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
