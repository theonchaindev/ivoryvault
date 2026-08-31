import { NextRequest, NextResponse, after } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyCredit } from '@/lib/credit'
import { recordPurchase, sendOrderConfirmation } from '@/lib/orders'
import { isCompClosed, isCompUpcoming } from '@/lib/compState'
import { PAYMENTS_PAUSED } from '@/lib/outage'
import { createPaymentJob, cashflowsConfigured } from '@/lib/cashflows'
import { createOrder } from '@/lib/cashflowsOrders'
import { REFERRAL_RATE, validateReferral, setReferredBy, rewardReferrer } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

interface BasketLine { competitionId: string; quantity: number }
interface GuestDetails { name?: string; email?: string; phone?: string }

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // While the outage is on, only admins can run checkout (for testing the real flow).
    if (PAYMENTS_PAUSED && session?.role !== 'admin') {
      return NextResponse.json({ error: 'Payments are temporarily unavailable. Please check back soon.', paused: true }, { status: 503 })
    }

    const { items, useCredit, guest, referralCode } = await request.json() as { items: BasketLine[]; useCredit?: boolean; guest?: GuestDetails; referralCode?: string }
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
    const metaItems: { id: string; qty: number }[] = []
    let orderTotal = 0
    let buyerEmail = ''
    let buyerFirst = 'Customer'
    let buyerLast = ''

    for (const line of items) {
      if (!line.competitionId || !line.quantity || line.quantity < 1) {
        return NextResponse.json({ error: 'Invalid basket item' }, { status: 400 })
      }
      const comp = await prisma.competition.findUnique({ where: { id: line.competitionId } })
      if (!comp) return NextResponse.json({ error: 'A competition in your basket no longer exists' }, { status: 404 })
      if (comp.status !== 'active') return NextResponse.json({ error: `${comp.title} is no longer active` }, { status: 400 })
      if (isCompClosed(comp)) return NextResponse.json({ error: `${comp.title} has closed — entries are no longer available` }, { status: 400 })
      if (isCompUpcoming(comp)) return NextResponse.json({ error: `Entries for ${comp.title} haven't opened yet` }, { status: 400 })
      const remaining = comp.maxTickets - comp.ticketsSold
      if (line.quantity > remaining) {
        return NextResponse.json({ error: `Only ${remaining} tickets left for ${comp.title}` }, { status: 400 })
      }
      metaItems.push({ id: comp.id, qty: line.quantity })
      orderTotal += comp.ticketPrice * line.quantity
    }

    const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, siteCredit: true } })
    buyerEmail = buyer?.email || ''
    const nameParts = (buyer?.name || '').trim().split(/\s+/)
    buyerFirst = nameParts[0] || 'Customer'
    buyerLast = nameParts.slice(1).join(' ')

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ivoryvaultcompetitions.co.uk'

    // Referral: 10% off the buyer's first order; referrer earns 10% of the order value.
    let referralDiscount = 0
    let referralApplied = false
    if (referralCode && referralCode.trim() && session) {
      const v = await validateReferral(userId, referralCode.trim())
      if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
      referralDiscount = Math.round(orderTotal * REFERRAL_RATE * 100) / 100
      await setReferredBy(userId, v.referrerUserId, Math.round(orderTotal * 100 * REFERRAL_RATE))
      referralApplied = true
    }
    const discountedTotal = Math.max(0, Math.round((orderTotal - referralDiscount) * 100) / 100)

    // Apply site credit if requested
    let creditUsed = 0
    if (useCredit) {
      const balance = buyer?.siteCredit ?? 0
      if (balance > 0) {
        const applied = applyCredit(discountedTotal, balance)
        creditUsed = applied.creditUsed

        // Credit covers the whole order → grant directly, no card payment
        if (creditUsed > 0 && applied.toPay <= 0) {
          const deduct = Math.min(creditUsed, balance)
          await prisma.user.update({ where: { id: userId }, data: { siteCredit: { decrement: deduct } } })
          for (const item of metaItems) await recordPurchase(userId, item.id, item.qty, `credit-${Date.now()}`)
          await prisma.notification.create({
            data: { userId, title: `£${deduct.toFixed(2)} site credit used`, body: 'Your site credit covered your whole order — no payment needed.', icon: 'info' },
          })
          if (referralApplied) await rewardReferrer(userId) // referred user's first order complete
          after(() => sendOrderConfirmation(userId, metaItems, 0))
          return NextResponse.json({ url: `${origin}/checkout/success?free=1` })
        }
      }
    }

    // Beyond this point a card payment is required.
    if (!cashflowsConfigured()) {
      return NextResponse.json({ error: 'Payments are not configured.' }, { status: 500 })
    }

    const toPay = applyCredit(discountedTotal, creditUsed).toPay
    const amount = toPay.toFixed(2)
    const orderNumber = `IVV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Persist the order so the webhook can grant entries once Paid
    await createOrder({ orderNumber, userId, items: metaItems, creditUsed, amount })

    const { actionUrl } = await createPaymentJob({
      amount,
      currency: 'GBP',
      orderNumber,
      email: buyerEmail || undefined,
      firstName: buyerFirst,
      lastName: buyerLast || undefined,
      returnUrlSuccess: `${origin}/checkout/success?cf=1`,
      returnUrlFailed: `${origin}/basket?cf=failed`,
      returnUrlCancelled: `${origin}/basket?cf=cancelled`,
      webhookUrl: `${origin}/api/payments/cashflows/webhook`,
      // paymentMethods omitted → all methods enabled in the portal (cards + wallets + PayPal)
    })

    return NextResponse.json({ url: actionUrl })
  } catch (error) {
    console.error('[cashflows] checkout error:', error)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
