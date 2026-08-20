import { NextRequest, NextResponse } from 'next/server'
import { getPaymentJob } from '@/lib/cashflows'
import { setSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Cashflows payment notification. Body: { notifyType, paymentJobReference, paymentReference }.
// We never trust the notification's contents — we re-fetch the authoritative status.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    // Field casing can vary — read defensively.
    const jobRef = (body.paymentJobReference || body.PaymentJobReference || body.paymentjobref) as string | undefined
    const payRef = (body.paymentReference || body.PaymentReference || body.paymentref) as string | undefined

    console.log('[cashflows] webhook received:', JSON.stringify(body))

    if (jobRef) {
      const status = await getPaymentJob(jobRef)
      console.log('[cashflows] verified status:', status.paymentStatus, 'order:', status.orderNumber)

      // Record the latest result so the admin test page can display it.
      await setSetting('cashflows_last_webhook', JSON.stringify({
        time: new Date().toISOString(),
        paymentJobReference: jobRef,
        paymentReference: payRef ?? null,
        orderNumber: status.orderNumber ?? null,
        paymentStatus: status.paymentStatus,
        amount: status.amountToCollect ?? null,
      }))

      // TODO (post-test): if status is Paid and this maps to a real basket/order,
      // call recordPurchase(...) here to grant the competition entries.
    }

    // Always acknowledge so Cashflows stops retrying.
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cashflows] webhook error:', err)
    // Still 200 to avoid infinite retries during testing; real failures are logged.
    return NextResponse.json({ ok: true })
  }
}
