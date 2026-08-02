import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { recordPurchase } from '@/lib/orders'

export const dynamic = 'force-dynamic'

// GET: list recent Stripe checkout sessions + whether they look recorded.
export async function GET() {
  try {
    await requireAdmin()
    const sessions = await stripe.checkout.sessions.list({ limit: 25 })
    const out = []
    for (const s of sessions.data) {
      let items: { id: string; qty: number }[] = []
      try { items = JSON.parse(s.metadata?.items || '[]') } catch { /* ignore */ }
      // Standard-comp tickets store the session id; instant spins do not.
      const ticketCount = await prisma.ticket.count({ where: { stripePaymentId: s.id } })
      out.push({
        id: s.id,
        created: new Date(s.created * 1000).toISOString(),
        payment_status: s.payment_status,
        amount_total: s.amount_total,
        email: s.customer_details?.email || null,
        userId: s.metadata?.userId || null,
        items,
        creditUsed: s.metadata?.creditUsed || null,
        ticketsRecorded: ticketCount,
      })
    }
    return NextResponse.json({ sessions: out })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST { sessionId }: reprocess a paid session's items (recover a failed webhook).
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { sessionId } = await req.json()
    const s = await stripe.checkout.sessions.retrieve(sessionId)
    if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') {
      return NextResponse.json({ error: `Session not paid (${s.payment_status})` }, { status: 400 })
    }
    const userId = s.metadata?.userId || ''
    let items: { id: string; qty: number }[] = []
    try { items = JSON.parse(s.metadata?.items || '[]') } catch { /* ignore */ }
    for (const item of items) {
      await recordPurchase(userId, item.id, item.qty, s.id)
    }
    return NextResponse.json({ ok: true, recorded: items })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
