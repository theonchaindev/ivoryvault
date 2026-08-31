'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import { applyCredit } from '@/lib/credit'
import { PAYMENTS_PAUSED } from '@/lib/outage'

const ease = [0.22, 1, 0.36, 1] as const

export default function BasketPage() {
  const { items, total, count, updateQty, removeItem, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credit, setCredit] = useState(0)
  const [useCredit, setUseCredit] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' })
  const [guestAgree, setGuestAgree] = useState(false)
  const [refInput, setRefInput] = useState('')
  const [refCode, setRefCode] = useState('')      // applied code
  const [refErr, setRefErr] = useState('')
  const [refBusy, setRefBusy] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) { setLoggedIn(true); setCredit(d.user.siteCredit || 0); setIsAdmin(d.user.role === 'admin') } else setLoggedIn(false) })
      .catch(() => setLoggedIn(false))
  }, [])

  const referralDiscount = refCode ? Math.round(total * 10) / 100 : 0
  const discountedTotal = Math.max(0, Math.round((total - referralDiscount) * 100) / 100)
  const applied = applyCredit(discountedTotal, loggedIn && useCredit ? credit : 0)

  const applyReferral = async () => {
    setRefErr('')
    const code = refInput.trim()
    if (!code) return
    setRefBusy(true)
    try {
      const res = await fetch('/api/referral/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const data = await res.json()
      if (!res.ok || !data.ok) { setRefErr(data.error || 'Invalid code'); return }
      setRefCode(code)
    } catch { setRefErr('Could not check that code') }
    finally { setRefBusy(false) }
  }

  const handleCheckout = async () => {
    setError('')
    if (loggedIn === false) {
      if (!guest.name.trim() || !guest.email.trim()) { setError('Please enter your name and email.'); return }
      if (!/^\S+@\S+\.\S+$/.test(guest.email.trim())) { setError('Please enter a valid email address.'); return }
      if (!guestAgree) { setError('Please confirm you are 18 or over and agree to the Terms & Privacy Policy.'); return }
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/cashflows/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ competitionId: i.competitionId, quantity: i.quantity })),
          useCredit: loggedIn ? useCredit : false,
          ...(loggedIn && refCode ? { referralCode: refCode } : {}),
          ...(loggedIn === false ? { guest } : {}),
        }),
      })
      const data = await res.json()
      if (res.status === 401) { window.location.href = '/login?from=/basket'; return }
      if (!res.ok) { setError(data.error || 'Checkout failed'); return }
      if (data.url) { window.location.href = data.url; return }
      setError('Could not start checkout — please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bk">
      <div className="bk__inner">
        <motion.div
          className="bk__head"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="bk__label">Your Basket</p>
          <h1 className="bk__title">Basket{count > 0 ? ` (${count})` : ''}</h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            className="bk__empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 1.25rem', opacity: .4 }}>
              <path d="M3 6h18l-1.5 12.5a2 2 0 0 1-2 1.75H6.5a2 2 0 0 1-2-1.75L3 6Z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M8.5 9V5.5a3.5 3.5 0 0 1 7 0V9" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="bk__empty-title">Your basket is empty</p>
            <p className="bk__empty-sub">Browse our live competitions and add some tickets.</p>
            <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.5rem' }}>Browse Competitions</Link>
          </motion.div>
        ) : (
          <div className="bk__grid">
            {/* Items */}
            <div className="bk__items">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <motion.div
                    key={item.competitionId}
                    layout
                    className="bk__item"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease, delay: i * 0.05 }}
                  >
                    <Link href={`/competitions/${item.slug}`} className="bk__item-img">
                      {item.image
                        ? <img src={item.image} alt={item.title} />
                        : <div className="bk__item-img-ph" />}
                    </Link>

                    <div className="bk__item-info">
                      <Link href={`/competitions/${item.slug}`} className="bk__item-title">{item.title}</Link>
                      <p className="bk__item-price">{formatCurrency(item.ticketPrice)} <span>per ticket</span></p>

                      <div className="bk__item-controls">
                        <div className="bk__stepper">
                          <button onClick={() => updateQty(item.competitionId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease">−</button>
                          <input
                            className="bk__qty-input"
                            type="text"
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, '')
                              updateQty(item.competitionId, raw === '' ? 1 : Math.min(item.maxAvailable, Math.max(1, parseInt(raw, 10))))
                            }}
                            onFocus={e => e.target.select()}
                            aria-label={`Quantity for ${item.title}`}
                          />
                          <button onClick={() => updateQty(item.competitionId, item.quantity + 1)} disabled={item.quantity >= item.maxAvailable} aria-label="Increase">+</button>
                        </div>
                        <button className="bk__remove" onClick={() => removeItem(item.competitionId)}>Remove</button>
                      </div>
                    </div>

                    <div className="bk__item-total">{formatCurrency(item.ticketPrice * item.quantity)}</div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button className="bk__clear" onClick={clear}>Clear basket</button>
            </div>

            {/* Summary */}
            <motion.div
              className="bk__summary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 }}
            >
              <h2 className="bk__summary-title">Order Summary</h2>
              <div className="bk__summary-row">
                <span>Tickets</span>
                <span>{count}</span>
              </div>
              <div className="bk__summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {/* Referral code (logged-in only) */}
              {loggedIn && (
                refCode ? (
                  <div className="bk__summary-row" style={{ color: '#16a34a' }}>
                    <span>Referral <b>({refCode})</b> · 10% off</span>
                    <span>−{formatCurrency(referralDiscount)} <button onClick={() => { setRefCode(''); setRefInput('') }} style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: '.7rem', textDecoration: 'underline' }}>remove</button></span>
                  </div>
                ) : (
                  <div style={{ margin: '.5rem 0' }}>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <input className="bk__guest-input" style={{ margin: 0 }} placeholder="Referral code (optional)" value={refInput} onChange={e => setRefInput(e.target.value.toUpperCase())} />
                      <button onClick={applyReferral} disabled={refBusy || !refInput.trim()} style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 1rem', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{refBusy ? '…' : 'Apply'}</button>
                    </div>
                    {refErr && <p style={{ color: '#c0392b', fontSize: '.72rem', marginTop: '.3rem' }}>{refErr}</p>}
                  </div>
                )
              )}

              {loggedIn && credit > 0 && (
                <label className="bk__credit">
                  <input type="checkbox" checked={useCredit} onChange={e => setUseCredit(e.target.checked)} />
                  <span>Use site credit <b>({formatCurrency(credit)} available)</b></span>
                </label>
              )}
              {applied.creditUsed > 0 && (
                <div className="bk__summary-row" style={{ color: '#16a34a' }}>
                  <span>Site credit</span>
                  <span>−{formatCurrency(applied.creditUsed)}</span>
                </div>
              )}

              <div className="bk__summary-total">
                <span>Total</span>
                <span>{formatCurrency(applied.toPay)}</span>
              </div>

              {/* Guest details (shown when not logged in) */}
              {loggedIn === false && (
                <div className="bk__guest">
                  <p className="bk__guest-title">Checkout as guest</p>
                  <input className="bk__guest-input" placeholder="Full name" value={guest.name} onChange={e => setGuest(g => ({ ...g, name: e.target.value }))} />
                  <input className="bk__guest-input" type="email" placeholder="Email address" value={guest.email} onChange={e => setGuest(g => ({ ...g, email: e.target.value }))} />
                  <input className="bk__guest-input" type="tel" placeholder="Mobile number" value={guest.phone} onChange={e => setGuest(g => ({ ...g, phone: e.target.value }))} />
                  <label className="bk__guest-agree">
                    <input type="checkbox" checked={guestAgree} onChange={e => setGuestAgree(e.target.checked)} />
                    <span>I confirm I am 18 or over and agree to the <Link href="/terms">Terms</Link> &amp; <Link href="/privacy">Privacy Policy</Link>.</span>
                  </label>
                  <p className="bk__guest-login">Have an account? <Link href="/login?from=/basket">Log in</Link></p>
                </div>
              )}

              {error && <p className="bk__error">{error}</p>}

              {PAYMENTS_PAUSED ? (
                <>
                  <div className="bk__paused">
                    <strong>Payments temporarily unavailable</strong>
                    <span>We&rsquo;re really sorry — we&rsquo;re working to fix this as quickly as we can. Your basket is saved. Please check back soon to enter.</span>
                  </div>
                  {isAdmin ? (
                    <button className="bk__checkout" onClick={handleCheckout} disabled={loading}>
                      {loading ? 'Starting…' : 'Admin test — Pay with Cashflows'}
                    </button>
                  ) : (
                    <button className="bk__checkout" disabled aria-disabled="true">Checkout unavailable</button>
                  )}
                </>
              ) : (
                <button className="bk__checkout" onClick={handleCheckout} disabled={loading || loggedIn === null}>
                  {loading ? 'Starting checkout…'
                    : loggedIn && applied.toPay <= 0 ? 'Complete Order — Free with Credit'
                    : loggedIn === false ? 'Checkout as Guest'
                    : 'Proceed to Checkout'}
                </button>
              )}
              <Link href="/competitions" className="bk__continue">← Continue shopping</Link>
              {!PAYMENTS_PAUSED && <p className="bk__note">🔒 Secure checkout. Free entry route available.</p>}
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        .bk { background: var(--bg); min-height: calc(100vh - 80px); }
        .bk__inner { max-width: 1100px; margin: 0 auto; padding: clamp(2.5rem,5vw,4rem) clamp(1.25rem,3vw,3rem) 5rem; }
        .bk__head { margin-bottom: 2rem; }
        .bk__label { font-size: .5375rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: .5rem; font-weight: 700; }
        .bk__title { font-size: clamp(2rem,4vw,3rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); }

        .bk__empty { text-align: center; padding: 4rem 2rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); }
        .bk__empty-title { font-size: 1.5rem; font-weight: 700; color: var(--ink); margin-bottom: .375rem; }
        .bk__empty-sub { font-size: .875rem; color: var(--ink3); }

        .bk__grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
        @media (max-width: 800px) { .bk__grid { grid-template-columns: 1fr; } }

        /* Items */
        .bk__items { display: flex; flex-direction: column; gap: 1rem; }
        .bk__item {
          display: grid; grid-template-columns: 88px 1fr auto; gap: 1rem; align-items: center;
          background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card);
          padding: 1rem; box-shadow: var(--shadow-sm);
        }
        .bk__item-img { width: 88px; height: 88px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: var(--bg2); }
        .bk__item-img img { width: 100%; height: 100%; object-fit: cover; }
        .bk__item-img-ph { width: 100%; height: 100%; background: linear-gradient(145deg,var(--bg2),var(--border)); }
        .bk__item-info { min-width: 0; }
        .bk__item-title { display: block; font-size: 1rem; font-weight: 700; color: var(--ink); text-decoration: none; line-height: 1.2; margin-bottom: .25rem; }
        .bk__item-title:hover { color: var(--gold); }
        .bk__item-price { font-size: .75rem; color: var(--ink3); margin-bottom: .75rem; }
        .bk__item-price span { opacity: .8; }
        .bk__item-controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .bk__stepper { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden; }
        .bk__stepper button { width: 34px; height: 34px; background: none; border: none; cursor: pointer; font-size: 1.125rem; color: var(--ink2); font-family: inherit; transition: background .15s, color .15s; }
        .bk__stepper button:hover:not(:disabled) { background: var(--bg2); color: var(--gold); }
        .bk__stepper button:disabled { opacity: .3; cursor: not-allowed; }
        .bk__stepper span { min-width: 36px; text-align: center; font-weight: 700; font-size: .9375rem; color: var(--ink); }
        .bk__qty-input { width: 46px; text-align: center; font-weight: 700; font-size: .9375rem; color: var(--ink); background: none; border: none; outline: none; padding: 0; -moz-appearance: textfield; }
        .bk__qty-input::-webkit-outer-spin-button, .bk__qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .bk__qty-input:focus { color: var(--gold); }
        .bk__remove { background: none; border: none; cursor: pointer; font-size: .6875rem; letter-spacing: .06em; text-transform: uppercase; color: var(--ink3); font-family: inherit; transition: color .2s; }
        .bk__remove:hover { color: #c0392b; }
        .bk__item-total { font-size: 1.125rem; font-weight: 800; color: var(--ink); white-space: nowrap; }
        @media (max-width: 480px) {
          .bk__item { grid-template-columns: 72px 1fr; grid-template-areas: 'img info' 'total total'; }
          .bk__item-img { width: 72px; height: 72px; }
          .bk__item-total { grid-area: total; text-align: right; padding-top: .25rem; border-top: 1px solid var(--border); }
        }
        .bk__clear { align-self: flex-start; margin-top: .25rem; background: none; border: none; cursor: pointer; font-size: .6875rem; letter-spacing: .06em; text-transform: uppercase; color: var(--ink3); font-family: inherit; transition: color .2s; }
        .bk__clear:hover { color: var(--ink); }

        /* Summary */
        .bk__summary { background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.5rem; box-shadow: var(--shadow-sm); position: sticky; top: 96px; }
        @media (max-width: 800px) { .bk__summary { position: static; } }
        .bk__summary-title { font-size: 1.125rem; font-weight: 800; color: var(--ink); margin-bottom: 1.25rem; }
        .bk__summary-row { display: flex; justify-content: space-between; font-size: .875rem; color: var(--ink2); padding: .5rem 0; }
        .bk__summary-total { display: flex; justify-content: space-between; align-items: baseline; padding: 1rem 0; margin-top: .25rem; border-top: 1px solid var(--border); font-weight: 800; }
        .bk__summary-total span:last-child { font-size: 1.5rem; color: var(--ink); }
        .bk__summary-total span:first-child { font-size: .875rem; text-transform: uppercase; letter-spacing: .06em; }
        .bk__credit { display: flex; align-items: center; gap: .5rem; margin: .5rem 0; padding: .625rem .75rem; background: var(--gold-pale); border: 1px solid var(--gold); border-radius: 8px; cursor: pointer; font-size: .8rem; color: var(--ink2); }
        .bk__credit input { width: 16px; height: 16px; accent-color: var(--gold); cursor: pointer; flex-shrink: 0; }
        .bk__credit b { color: var(--gold-d); }
        .bk__guest { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: .6rem; }
        .bk__guest-title { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); font-weight: 700; }
        .bk__guest-input { width: 100%; padding: .7rem .85rem; border: 1px solid var(--border); border-radius: 8px; font-size: .875rem; font-family: inherit; color: var(--ink); }
        .bk__guest-input:focus { outline: none; border-color: var(--gold); }
        .bk__guest-agree { display: flex; align-items: flex-start; gap: .5rem; font-size: .72rem; color: var(--ink3); line-height: 1.4; }
        .bk__guest-agree input { margin-top: .1rem; width: 15px; height: 15px; accent-color: var(--gold); flex-shrink: 0; }
        .bk__guest-agree a { color: var(--gold); text-decoration: none; }
        .bk__guest-login { font-size: .75rem; color: var(--ink3); }
        .bk__guest-login a { color: var(--gold); text-decoration: none; font-weight: 600; }
        .bk__error { font-size: .8125rem; color: #c0392b; margin: .5rem 0; }
        .bk__checkout { width: 100%; margin-top: .5rem; padding: 1rem; border-radius: var(--r-btn); background: var(--gold); color: #fff; font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; border: none; cursor: pointer; font-family: inherit; transition: background .2s; }
        .bk__checkout:hover:not(:disabled) { background: var(--gold-d); }
        .bk__checkout:disabled { opacity: .7; cursor: not-allowed; }
        .bk__continue { display: block; text-align: center; margin-top: .875rem; font-size: .75rem; color: var(--ink3); text-decoration: none; transition: color .2s; }
        .bk__continue:hover { color: var(--gold); }
        .bk__note { font-size: .625rem; color: var(--ink3); text-align: center; margin-top: 1rem; line-height: 1.5; }
        .bk__paused { display: flex; flex-direction: column; gap: .35rem; background: #fdecea; border: 1px solid #f3b6ae; border-radius: 12px; padding: .9rem 1rem; margin-bottom: .75rem; }
        .bk__paused strong { color: #c0261c; font-size: .8rem; letter-spacing: .02em; }
        .bk__paused span { color: #7a2a22; font-size: .72rem; line-height: 1.5; }
      `}</style>
    </div>
  )
}
