export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import ClearCartOnMount from './ClearCartOnMount'

const money = (pence: number) => `£${(pence / 100).toFixed(2)}`

interface OrderLine { name: string; qty: number; amount: number }

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string; free?: string }> }) {
  const { session_id, free } = await searchParams
  const auth = await getSession()
  const freeOrder = free === '1'

  let lines: OrderLine[] = []
  let total: number | null = null
  let email: string | null = null
  let paid = freeOrder

  if (session_id) {
    try {
      const cs = await stripe.checkout.sessions.retrieve(session_id, { expand: ['line_items'] })
      paid = cs.payment_status === 'paid'
      // Only reveal order details to the buyer.
      const owned = !cs.metadata?.userId || (auth && cs.metadata.userId === auth.userId)
      if (owned) {
        lines = (cs.line_items?.data || []).map(li => ({
          name: li.description || 'Competition entry',
          qty: li.quantity || 1,
          amount: li.amount_total || 0,
        }))
        total = cs.amount_total ?? null
        email = cs.customer_details?.email ?? null
      }
    } catch {
      /* fall through to a generic thank-you */
    }
  }

  return (
    <div className="cs">
      <ClearCartOnMount />
      <div className="cs__card">
        <div className="cs__check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="cs__eyebrow">{freeOrder ? 'Paid with site credit' : `Payment ${paid ? 'received' : 'processing'}`}</p>
        <h1 className="cs__title">Order confirmed</h1>
        <p className="cs__sub">
          Thank you{auth?.name ? `, ${auth.name.split(' ')[0]}` : ''} — your entries are in the draw.
          {freeOrder ? <> Your site credit covered the full order.</> : email ? <> A confirmation has been sent to <strong>{email}</strong>.</> : <> A confirmation email is on its way.</>}
        </p>

        {lines.length > 0 && (
          <div className="cs__order">
            <p className="cs__order-head">Your order</p>
            <ul className="cs__lines">
              {lines.map((l, i) => (
                <li key={i} className="cs__line">
                  <span className="cs__line-name">{l.name}</span>
                  <span className="cs__line-qty">× {l.qty}</span>
                  <span className="cs__line-amt">{money(l.amount)}</span>
                </li>
              ))}
            </ul>
            {total != null && (
              <div className="cs__total"><span>Total paid</span><span>{money(total)}</span></div>
            )}
          </div>
        )}

        <div className="cs__actions">
          <Link href="/account" className="cs__btn cs__btn--primary">View My Entries</Link>
          <Link href="/competitions" className="cs__btn cs__btn--ghost">Browse Competitions</Link>
        </div>

        <p className="cs__note">Bought instant spins? Head to that competition and tap <strong>Reveal</strong> to spin.</p>
      </div>

      <style>{`
        .cs { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem 5rem; min-height: calc(100vh - 68px); background: var(--off); }
        .cs__card { width: 100%; max-width: 520px; background: #fff; border: 1px solid var(--border); border-radius: var(--r-card); padding: 3rem 2.5rem; text-align: center; box-shadow: var(--shadow-md); }
        .cs__check { width: 64px; height: 64px; margin: 0 auto 1.5rem; border-radius: 50%; background: #16a34a; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(22,163,74,.35); }
        .cs__eyebrow { font-size: .5875rem; letter-spacing: .18em; text-transform: uppercase; color: #16a34a; font-weight: 700; margin-bottom: .75rem; }
        .cs__title { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: .875rem; }
        .cs__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; margin: 0 auto 2rem; max-width: 400px; }
        .cs__order { text-align: left; border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem 1.5rem; margin-bottom: 2rem; background: var(--bg); }
        .cs__order-head { font-size: .5875rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); font-weight: 700; margin-bottom: 1rem; }
        .cs__lines { list-style: none; padding: 0; margin: 0; }
        .cs__line { display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; align-items: center; padding: .625rem 0; border-bottom: 1px solid var(--border); }
        .cs__line:last-child { border-bottom: none; }
        .cs__line-name { font-size: .875rem; color: var(--ink); font-weight: 500; }
        .cs__line-qty { font-size: .8125rem; color: var(--ink3); }
        .cs__line-amt { font-size: .875rem; color: var(--ink); font-weight: 700; }
        .cs__total { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border); font-weight: 800; color: var(--ink); font-size: 1.0625rem; }
        .cs__actions { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; }
        .cs__btn { display: inline-block; padding: .9375rem 1.75rem; border-radius: var(--r-btn); font-size: .75rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; transition: background .2s, border-color .2s, color .2s; }
        .cs__btn--primary { background: var(--gold); color: #fff; }
        .cs__btn--primary:hover { background: var(--gold-d); }
        .cs__btn--ghost { border: 1.5px solid var(--border); color: var(--ink2); }
        .cs__btn--ghost:hover { border-color: var(--ink); color: var(--ink); }
        .cs__note { font-size: .75rem; color: var(--ink3); margin-top: 1.75rem; }
      `}</style>
    </div>
  )
}
