import { NextRequest, NextResponse } from 'next/server'
import { getPaymentJob } from '@/lib/cashflows'
import { setSetting } from '@/lib/settings'
import { claimOrderPaid } from '@/lib/cashflowsOrders'
import { fulfillPaidOrder } from '@/lib/fulfillOrder'

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
      const order = await claimOrderPaid(status.orderNumber) // atomic pending→paid; null if test/duplicate/already granted
      if (order) {
        await fulfillPaidOrder(order, jobRef)
        console.log('[cashflows] entries granted for order', status.orderNumber)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cashflows] webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
