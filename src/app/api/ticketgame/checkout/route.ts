import { NextRequest, NextResponse, after } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyCredit } from '@/lib/credit'
import { createPlays, getConfig, countSold } from '@/lib/ticketGame'
import { sendOrderConfirmation, TICKET_GAME_ITEM } from '@/lib/orders'
import { PAYMENTS_PAUSED } from '@/lib/outage'
import { createPaymentJob, cashflowsConfigured } from '@/lib/cashflows'
import { createOrder } from '@/lib/cashflowsOrders'

export const dynamic = 'force-dynamic'

const MAX_QTY = 25

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Please log in to play.', needsLogin: true }, { status: 401 })
    }
    const isAdmin = session.role === 'admin'

    if (PAYMENTS_PAUSED && !isAdmin) {
      return NextResponse.json({ error: 'Payments are temporarily unavailable. Please check back soon.', paused: true }, { status: 503 })
    }

    const cfg = await getConfig()
    // Hidden until published — only admins can buy while it's off (for testing).
    if (!cfg.published && !isAdmin) {
      return NextResponse.json({ error: 'This game is not available yet.' }, { status: 404 })
    }
    if (Object.keys(cfg.winners).length === 0) {
      return NextResponse.json({ error: 'This game is not set up yet.' }, { status: 400 })
    }

    const { quantity, useCredit } = await request.json() as { quantity?: number; useCredit?: boolean }
    const qty = Math.max(1, Math.min(MAX_QTY, Math.round(Number(quantity) || 0)))

    // Cap by remaining pool so we never sell more plays than the pool holds.
    const sold = await countSold()
    const remaining = cfg.poolSize - sold
    if (remaining <= 0) return NextResponse.json({ error: 'All tickets have been sold.' }, { status: 400 })
    if (qty > remaining) return NextResponse.json({ error: `Only ${remaining} ticket${remaining === 1 ? '' : 's'} left.` }, { status: 400 })

    const userId = session.userId
    const price = cfg.priceP / 100
    const orderTotal = Math.round(price * qty * 100) / 100

    const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, siteCredit: true } })
    const buyerEmail = buyer?.email || ''
    const nameParts = (buyer?.name || '').trim().split(/\s+/)
    const buyerFirst = nameParts[0] || 'Customer'
    const buyerLast = nameParts.slice(1).join(' ')

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ivoryvaultcompetitions.co.uk'
    const successUrl = `${origin}/instant-tickets?paid=1`

    // Site credit
    let creditUsed = 0
    if (useCredit) {
      const balance = buyer?.siteCredit ?? 0
      if (balance > 0) {
        const applied = applyCredit(orderTotal, balance)
        creditUsed = applied.creditUsed
        if (creditUsed > 0 && applied.toPay <= 0) {
          const deduct = Math.min(creditUsed, balance)
          await prisma.user.update({ where: { id: userId }, data: { siteCredit: { decrement: deduct } } })
          await createPlays(userId, qty)
          await prisma.notification.create({
            data: { userId, title: `£${deduct.toFixed(2)} site credit used`, body: `Your site credit covered ${qty} Instant Win ticket${qty === 1 ? '' : 's'}.`, icon: 'info' },
          }).catch(() => {})
          after(() => sendOrderConfirmation(userId, [{ id: TICKET_GAME_ITEM, qty }], 0))
          return NextResponse.json({ url: `${successUrl}&free=1` })
        }
      }
    }

    if (!cashflowsConfigured()) {
      return NextResponse.json({ error: 'Payments are not configured.' }, { status: 500 })
    }

    const toPay = applyCredit(orderTotal, creditUsed).toPay
    const amount = toPay.toFixed(2)
    const orderNumber = `IVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    await createOrder({ orderNumber, userId, items: [{ id: TICKET_GAME_ITEM, qty }], creditUsed, amount })

    const { actionUrl } = await createPaymentJob({
      amount,
      currency: 'GBP',
      orderNumber,
      email: buyerEmail || undefined,
      firstName: buyerFirst,
      lastName: buyerLast || undefined,
      returnUrlSuccess: successUrl,
      returnUrlFailed: `${origin}/instant-tickets?cf=failed`,
      returnUrlCancelled: `${origin}/instant-tickets?cf=cancelled`,
      webhookUrl: `${origin}/api/payments/cashflows/webhook`,
    })

    return NextResponse.json({ url: actionUrl })
  } catch (error) {
    console.error('[ticketgame] checkout error:', error)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
