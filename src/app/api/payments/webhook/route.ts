import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { syncEarnedSpins } from '@/lib/spins'
import Stripe from 'stripe'

/** Record a single competition purchase: create ticket, bump count, auto-draw if sold out. */
async function recordPurchase(userId: string, competitionId: string, qty: number, paymentRef: string) {
  if (!userId || !competitionId || !qty) return

  await prisma.ticket.create({
    data: { userId, competitionId, quantity: qty, stripePaymentId: paymentRef },
  })

  // Award any free spins earned from new ticket total (tier-up / every 50 tickets)
  await syncEarnedSpins(userId)

  const competition = await prisma.competition.update({
    where: { id: competitionId },
    data: { ticketsSold: { increment: qty } },
  })

  // Auto-draw if sold out
  if (competition.ticketsSold >= competition.maxTickets && competition.status === 'active') {
    const tickets = await prisma.ticket.findMany({ where: { competitionId } })
    const pool: Array<{ userId: string; ticketIndex: number }> = []
    tickets.forEach(t => {
      for (let i = 0; i < t.quantity; i++) pool.push({ userId: t.userId, ticketIndex: pool.length + 1 })
    })
    if (pool.length > 0) {
      const winnerEntry = pool[Math.floor(Math.random() * pool.length)]
      await prisma.competition.update({ where: { id: competitionId }, data: { status: 'completed' } })
      const existingWinner = await prisma.winner.findUnique({ where: { competitionId } })
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
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Single-competition direct intent (legacy)
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const { competitionId, userId, quantity } = pi.metadata
      await recordPurchase(userId, competitionId, parseInt(quantity, 10), pi.id)
    }

    // Multi-item basket checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId || ''
      let items: { id: string; qty: number }[] = []
      try { items = JSON.parse(session.metadata?.items || '[]') } catch { /* ignore */ }
      for (const item of items) {
        await recordPurchase(userId, item.id, item.qty, session.id)
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
