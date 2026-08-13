import { NextRequest, NextResponse, after } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { applyCredit } from '@/lib/credit'
import { recordPurchase, sendOrderConfirmation } from '@/lib/orders'
import { isCompClosed } from '@/lib/compState'

interface BasketLine { competitionId: string; quantity: number }
interface GuestDetails { name?: string; email?: string; phone?: string }

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const { items, useCredit, guest } = await request.json() as { items: BasketLine[]; useCredit?: boolean; guest?: GuestDetails }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your basket is empty' }, { status: 400 })
    }

    // Resolve the buyer: logged-in user, or a guest (find-or-create by email)
    let userId: string
    if (session) {
      userId = session.userId
    } else {
      const name = (guest?.name || '').trim()
      const email = (guest?.email || '').toLowerCase().trim()
      const phone = (guest?.phone || '').trim()
      if (!name || !email) {
        return NextResponse.json({ error: 'Please enter your name and email, or log in.' }, { status: 400 })
      }
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.role !== 'guest') {
        return NextResponse.json({ error: 'An account with this email already exists — please log in to continue.', needsLogin: true }, { status: 409 })
      }
      if (existing) {
        await prisma.user.update({ where: { id: existing.id }, data: { name, phone: phone || existing.phone } })
        userId = existing.id
      } else {
        const randomPw = await bcrypt.hash(crypto.randomUUID(), 12)
        const created = await prisma.user.create({ data: { name, email, phone: phone || null, password: randomPw, role: 'guest' } })
        userId = created.id
      }
    }

    // Validate every line against the DB (never trust client prices)
    const lineItems = []
    const metaItems: { id: string; qty: number }[] = []
    let orderTotal = 0

    for (const line of items) {
      if (!line.competitionId || !line.quantity || line.quantity < 1) {
        return NextResponse.json({ error: 'Invalid basket item' }, { status: 400 })
      }
      const comp = await prisma.competition.findUnique({ where: { id: line.competitionId } })
      if (!comp) return NextResponse.json({ error: 'A competition in your basket no longer exists' }, { status: 404 })
      if (comp.status !== 'active') return NextResponse.json({ error: `${comp.title} is no longer active` }, { status: 400 })
      if (isCompClosed(comp)) return NextResponse.json({ error: `${comp.title} has closed — entries are no longer available` }, { status: 400 })

      const remaining = comp.maxTickets - comp.ticketsSold
      if (line.quantity > remaining) {
        return NextResponse.json({ error: `Only ${remaining} tickets left for ${comp.title}` }, { status: 400 })
      }

      let images: string[] = []
      try { images = JSON.parse(comp.images) } catch { /* ignore */ }

      lineItems.push({
        quantity: line.quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(comp.ticketPrice * 100),
          product_data: {
            name: comp.title,
            ...(images[0] ? { images: [images[0]] } : {}),
          },
        },
      })
      metaItems.push({ id: comp.id, qty: line.quantity })
      orderTotal += comp.ticketPrice * line.quantity
    }

    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_BASE_URL
      || 'https://www.ivoryvaultcompetitions.co.uk'

    // Apply site credit, if requested and available
    let creditUsed = 0
    const discounts: { coupon: string }[] = []
    if (useCredit) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { siteCredit: true } })
      const balance = user?.siteCredit ?? 0
      if (balance > 0) {
        const applied = applyCredit(orderTotal, balance)
        creditUsed = applied.creditUsed

        // Credit covers the whole order → process directly, no Stripe transaction
        if (creditUsed > 0 && applied.toPay <= 0) {
          const deduct = Math.min(creditUsed, balance)
          await prisma.user.update({ where: { id: userId }, data: { siteCredit: { decrement: deduct } } })
          for (const item of metaItems) {
            await recordPurchase(userId, item.id, item.qty, `credit-${Date.now()}`)
          }
          await prisma.notification.create({
            data: { userId: userId, title: `£${deduct.toFixed(2)} site credit used`, body: 'Your site credit covered your whole order — no payment needed.', icon: 'info' },
          })
          after(() => sendOrderConfirmation(userId, metaItems, 0))
          return NextResponse.json({ url: `${origin}/checkout/success?free=1` })
        }

        // Partial credit → apply the remainder as a Stripe discount
        if (creditUsed > 0) {
          const coupon = await stripe.coupons.create({
            amount_off: Math.round(creditUsed * 100),
            currency: 'gbp',
            duration: 'once',
            max_redemptions: 1,
            name: 'Site credit',
          })
          discounts.push({ coupon: coupon.id })
        }
      }
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(discounts.length ? { discounts } : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/basket`,
      metadata: {
        userId: userId,
        items: JSON.stringify(metaItems),
        creditUsed: String(creditUsed),
      },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
