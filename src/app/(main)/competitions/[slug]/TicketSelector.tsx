'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  competition: {
    id: string; title: string; ticketPrice: number
    maxTickets: number; ticketsSold: number; status: string
  }
}

const spring = { type: 'spring', stiffness: 400, damping: 28 } as const
const ease = [0.22, 1, 0.36, 1] as const

export default function TicketSelector({ competition }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remaining = competition.maxTickets - competition.ticketsSold
  const maxSelect = Math.min(remaining, 50)
  const total = competition.ticketPrice * quantity

  const setQty = (n: number) => setQuantity(Math.min(maxSelect, Math.max(1, n)))

  const handleCheckout = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: competition.id, quantity }),
      })
      const data = await res.json()
      if (res.status === 401) { window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname); return }
      if (!res.ok) { setError(data.error || 'Failed to create payment'); return }
      alert(`Payment intent created! In production this opens Stripe checkout.\n\nClient secret: ${data.clientSecret?.substring(0, 20)}...`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (competition.status !== 'active') {
    return (
      <motion.div
        className="ts-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <p className="ts-closed">This competition has closed</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="ts-box"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease }}
    >
      <h2 className="ts-title">Enter This Competition</h2>
      <p className="ts-remaining">{remaining.toLocaleString()} tickets remaining</p>

      {/* Price per ticket */}
      <div className="ts-price-row">
        <span className="ts-price-label">Per Ticket</span>
        <span className="ts-price-val">{formatCurrency(competition.ticketPrice)}</span>
      </div>

      {/* Quantity stepper */}
      <div className="ts-qty-section">
        <label className="ts-label">Number of Tickets</label>
        <div className="ts-stepper">
          <motion.button
            className="ts-step-btn"
            onClick={() => setQty(quantity - 1)}
            disabled={quantity <= 1}
            whileTap={quantity > 1 ? { scale: 0.88 } : {}}
            transition={spring}
          >
            −
          </motion.button>
          <AnimatePresence mode="wait">
            <motion.span
              key={quantity}
              className="ts-qty-val"
              initial={{ opacity: 0, y: -12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.2, ease }}
            >
              {quantity}
            </motion.span>
          </AnimatePresence>
          <motion.button
            className="ts-step-btn"
            onClick={() => setQty(quantity + 1)}
            disabled={quantity >= maxSelect}
            whileTap={quantity < maxSelect ? { scale: 0.88 } : {}}
            transition={spring}
          >
            +
          </motion.button>
        </div>
        <p className="ts-max">Max {maxSelect} per transaction</p>
      </div>

      {/* Quick pick */}
      <div className="ts-quick">
        {[1, 3, 5, 10].filter(n => n <= maxSelect).map(n => (
          <motion.button
            key={n}
            onClick={() => setQty(n)}
            className={`ts-quick-btn${quantity === n ? ' active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
          >
            {n}
          </motion.button>
        ))}
      </div>

      {/* Total */}
      <div className="ts-total-row">
        <span className="ts-total-label">Total</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            className="ts-total-val"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease }}
          >
            {formatCurrency(total)}
          </motion.span>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="ts-error"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="btn-primary ts-cta"
        onClick={handleCheckout}
        disabled={loading}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        transition={spring}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
            <span className="ts-spinner" /> Processing...
          </span>
        ) : `Enter Now — ${formatCurrency(total)}`}
      </motion.button>

      <p className="ts-note">
        🔒 Secure payment via Stripe.{' '}
        No purchase necessary —{' '}
        <a href="/free-entry" className="ts-free-link">free entry available</a>.
      </p>

      <style>{`
        .ts-box {
          background: #fff; border: 1px solid var(--border);
          padding: 2rem; display: flex; flex-direction: column; gap: 0;
        }
        .ts-title { font-family: var(--font-cormorant,serif); font-size: 1.625rem; font-weight: 500; color: var(--ink); margin-bottom: .375rem; }
        .ts-remaining { font-size: .8125rem; color: var(--ink3); margin-bottom: 1.75rem; }
        .ts-closed { font-family: var(--font-cormorant,serif); font-size: 1.25rem; color: var(--ink3); text-align: center; padding: 1rem 0; }
        .ts-price-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; background: var(--off); margin-bottom: 1.5rem;
        }
        .ts-price-label { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--ink2); }
        .ts-price-val { font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 500; color: var(--rg); line-height: 1; }
        .ts-qty-section { margin-bottom: 1.25rem; }
        .ts-label { display: block; font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2); margin-bottom: .75rem; }
        .ts-stepper {
          display: flex; align-items: center;
          border: 1px solid var(--border); background: #fff; overflow: hidden;
          height: 52px;
        }
        .ts-step-btn {
          width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          font-size: 1.375rem; color: var(--ink2); transition: background .15s, color .15s;
          flex-shrink: 0;
        }
        .ts-step-btn:hover:not(:disabled) { background: var(--off); color: var(--ink); }
        .ts-step-btn:disabled { opacity: .3; cursor: not-allowed; }
        .ts-step-btn:first-child { border-right: 1px solid var(--border); }
        .ts-step-btn:last-child { border-left: 1px solid var(--border); }
        .ts-qty-val {
          flex: 1; text-align: center;
          font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 500; color: var(--ink);
          display: block;
        }
        .ts-max { font-size: .6875rem; color: var(--ink3); margin-top: .5rem; }
        .ts-quick { display: flex; gap: .5rem; margin-bottom: 1.5rem; }
        .ts-quick-btn {
          flex: 1; padding: .5rem; font-size: .8125rem; font-weight: 500;
          border: 1px solid var(--border); background: #fff; color: var(--ink2);
          cursor: pointer; transition: border-color .15s, background .15s, color .15s;
        }
        .ts-quick-btn.active { border-color: var(--rg); background: var(--rg); color: #fff; }
        .ts-quick-btn:hover:not(.active) { border-color: var(--ink2); color: var(--ink); }
        .ts-total-row {
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 1rem 0; margin-bottom: 1.5rem;
        }
        .ts-total-label { font-size: .875rem; font-weight: 500; color: var(--ink2); }
        .ts-total-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 500; color: var(--ink); line-height: 1; }
        .ts-error {
          padding: .75rem; background: rgba(184,104,122,.08);
          border: 1px solid rgba(184,104,122,.2); color: #8a4f58;
          font-size: .85rem; overflow: hidden;
        }
        .ts-cta { width: 100%; margin-bottom: 1rem; }
        .ts-note { font-size: .75rem; color: var(--ink3); text-align: center; line-height: 1.55; }
        .ts-free-link { color: var(--rg); text-decoration: none; }
        .ts-free-link:hover { text-decoration: underline; }
        .ts-spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 1.5px solid rgba(255,255,255,.25); border-top-color: #fff;
          border-radius: 50%; animation: ts-spin .6s linear infinite;
        }
        @keyframes ts-spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  )
}
