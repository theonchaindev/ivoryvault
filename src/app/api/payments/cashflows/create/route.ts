import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createPaymentJob, cashflowsConfigured } from '@/lib/cashflows'

export const dynamic = 'force-dynamic'

// Admin-only test trigger: creates a Cashflows sandbox payment-job and returns
// the hosted-page URL to redirect to. Kept separate from the live checkout.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    if (!cashflowsConfigured()) {
      return NextResponse.json({ error: 'Cashflows env vars not set' }, { status: 500 })
    }

    const { amount } = await req.json().catch(() => ({}))
    const amt = (typeof amount === 'string' && /^\d+(\.\d{2})?$/.test(amount)) ? amount : '1.00'

    const origin = req.nextUrl.origin
    const orderNumber = `IVV-TEST-${Date.now()}`

    const result = await createPaymentJob({
      amount: amt,
      currency: 'GBP',
      orderNumber,
      email: 'test@ivoryvaultcompetitions.co.uk',
      firstName: 'Test',
      lastName: 'Buyer',
      returnUrlSuccess: `${origin}/admin/cashflows-test?result=success`,
      returnUrlFailed: `${origin}/admin/cashflows-test?result=failed`,
      returnUrlCancelled: `${origin}/admin/cashflows-test?result=cancelled`,
      webhookUrl: `${origin}/api/payments/cashflows/webhook`,
    })

    return NextResponse.json({ ok: true, actionUrl: result.actionUrl, paymentJobReference: result.paymentJobReference, orderNumber })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[cashflows] create error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
