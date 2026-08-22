import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentJob } from '@/lib/cashflows'
import { setSetting } from '@/lib/settings'
import { claimOrderPaid } from '@/lib/cashflowsOrders'
import { recordPurchase, sendOrderConfirmation } from '@/lib/orders'
import { sendGuestCreateAccount } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Cashflows payment notification. Body: { notifyType, paymentJobReference, paymentReference }.
// We never trust the notification's contents — we re-fetch the authoritative status,
// then grant entries once (idempotently) when the payment is confirmed Paid.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const jobRef = (body.paymentJobReference || body.PaymentJobReference || body.paymentjobref) as string | undefined
    const payRef = (body.paymentReference || body.PaymentReference || body.paymentref) as string | undefined
    console.log('[cashflows] webhook received:', JSON.stringify(body))

    if (!jobRef) return NextResponse.json({ ok: true })

    const status = await getPaymentJob(jobRef)
    console.log('[cashflows] verified status:', status.paymentStatus, 'order:', status.orderNumber)

    // Record latest result for the admin test page
    await setSetting('cashflows_last_webhook', JSON.stringify({
      time: new Date().toISOString(),
      paymentJobReference: jobRef,
      paymentReference: payRef ?? null,
      orderNumber: status.orderNumber ?? null,
      paymentStatus: status.paymentStatus,
      amount: status.amountToCollect ?? null,
    }))

    // Grant entries only for a real order that is confirmed Paid.
    if (status.paymentStatus === 'Paid' && status.orderNumber) {
      const order = await claimOrderPaid(status.orderNumber) // atomic pending→paid; null if test/duplicate
      if (order) {
        for (const item of order.items) {
          await recordPurchase(order.userId, item.id, item.qty, jobRef)
        }
        if (order.creditUsed > 0) {
          const u = await prisma.user.findUnique({ where: { id: order.userId }, select: { siteCredit: true } })
          const deduct = Math.min(order.creditUsed, u?.siteCredit ?? 0)
          if (deduct > 0) {
            await prisma.user.update({ where: { id: order.userId }, data: { siteCredit: { decrement: deduct } } })
            await prisma.notification.create({
              data: { userId: order.userId, title: `£${deduct.toFixed(2)} site credit used`, body: 'Your site credit was applied to your order.', icon: 'info' },
            })
          }
        }
        const buyer = await prisma.user.findUnique({ where: { id: order.userId }, select: { role: true, email: true, name: true } })
        if (buyer?.role === 'guest' && buyer.email) {
          after(() => sendGuestCreateAccount(buyer.email as string, buyer.name))
        }
        after(() => sendOrderConfirmation(order.userId, order.items, Math.round(parseFloat(order.amount) * 100)))
        console.log('[cashflows] entries granted for order', status.orderNumber)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cashflows] webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
