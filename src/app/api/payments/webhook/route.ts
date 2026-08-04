import { NextRequest, NextResponse, after } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { recordPurchase, sendOrderConfirmation } from '@/lib/orders'
import { sendGuestCreateAccount } from '@/lib/email'
import Stripe from 'stripe'

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
      const qty = parseInt(quantity, 10)
      await recordPurchase(userId, competitionId, qty, pi.id)
      after(() => sendOrderConfirmation(userId, [{ id: competitionId, qty }], pi.amount))
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

      // Deduct any site credit applied to this order
      const creditUsed = parseFloat(session.metadata?.creditUsed || '0')
      if (creditUsed > 0 && userId) {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { siteCredit: true } })
        const deduct = Math.min(creditUsed, u?.siteCredit ?? 0)
        if (deduct > 0) {
          await prisma.user.update({ where: { id: userId }, data: { siteCredit: { decrement: deduct } } })
          await prisma.notification.create({
            data: { userId, title: `£${deduct.toFixed(2)} site credit used`, body: 'Your site credit was applied to your order.', icon: 'info' },
          })
        }
      }

      // Guest checkout → invite them to create/claim their account
      if (userId) {
        const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, name: true } })
        if (buyer?.role === 'guest' && buyer.email) {
          after(() => sendGuestCreateAccount(buyer.email as string, buyer.name))
        }
      }

      after(() => sendOrderConfirmation(userId, items, session.amount_total))
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
