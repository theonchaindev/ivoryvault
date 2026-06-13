'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface Props {
  competition: {
    id: string; slug: string; title: string; image: string | null; ticketPrice: number
    maxTickets: number; ticketsSold: number; status: string
  }
}

const spring = { type: 'spring', stiffness: 400, damping: 28 } as const
const ease = [0.22, 1, 0.36, 1] as const

export default function TicketSelector({ competition }: Props) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const remaining = competition.maxTickets - competition.ticketsSold
  const maxSelect = Math.min(remaining, 50)
  const total = competition.ticketPrice * quantity

  const setQty = (n: number) => setQuantity(Math.min(maxSelect, Math.max(1, n)))

  const handleAddToBasket = () => {
    addItem({
      competitionId: competition.id,
      slug: competition.slug,
      title: competition.title,
      image: competition.image,
      ticketPrice: competition.ticketPrice,
      quantity,
      maxAvailable: maxSelect,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  const handleBuyNow = () => {
    addItem({
      competitionId: competition.id,
      slug: competition.slug,
      title: competition.title,
      image: competition.image,
      ticketPrice: competition.ticketPrice,
      quantity,
      maxAvailable: maxSelect,
    })
    router.push('/basket')
  }

  if (competition.status !== 'active') {
    return (
      <div className="ts">
        <p className="ts__closed">This competition has closed</p>
      </div>
    )
  }

  return (
    <motion.div
      className="ts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="ts__header">
        <h2 className="ts__title">Enter This Competition</h2>
        <span className="ts__remaining">{remaining.toLocaleString()} tickets left</span>
      </div>

      {/* Price per ticket */}
      <div className="ts__price-row">
        <span className="ts__price-label">Price per ticket</span>
        <span className="ts__price-val">{formatCurrency(competition.ticketPrice)}</span>
      </div>

      {/* Quick pick buttons */}
      <div className="ts__quick-section">
        <p className="ts__section-label">Quick Pick</p>
        <div className="ts__quick">
          {[1, 3, 5, 10].filter(n => n <= maxSelect).map(n => (
            <motion.button
              key={n}
              onClick={() => setQty(n)}
              className={`ts__quick-btn${quantity === n ? ' active' : ''}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="ts__qty-section">
        <p className="ts__section-label">Tickets</p>
        <div className="ts__stepper">
          <motion.button
            className="ts__step-btn"
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
              className="ts__qty-val"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {quantity}
            </motion.span>
          </AnimatePresence>
          <motion.button
            className="ts__step-btn"
            onClick={() => setQty(quantity + 1)}
            disabled={quantity >= maxSelect}
            whileTap={quantity < maxSelect ? { scale: 0.88 } : {}}
            transition={spring}
          >
            +
          </motion.button>
        </div>
        <p className="ts__max">Max {maxSelect} per order</p>
      </div>

      {/* Total */}
      <div className="ts__total-row">
        <span className="ts__total-label">Total</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            className="ts__total-val"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(total)}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        className="ts__cta"
        onClick={handleAddToBasket}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
      >
        {added ? '✓ Added to Basket' : `Add to Basket — ${formatCurrency(total)}`}
      </motion.button>

      <button className="ts__buy-now" onClick={handleBuyNow}>
        Buy Now →
      </button>

      <p className="ts__note">
        🔒 Secure checkout via Stripe.{' '}
        <a href="/free-entry" className="ts__free-link">Free entry also available.</a>
      </p>

      <style>{`
        .ts {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-card); padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }
        /* Sticky bottom on mobile */
        @media (max-width: 860px) {
          .ts {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
            border-radius: 16px 16px 0 0;
            border-left: none; border-right: none; border-bottom: none;
            box-shadow: 0 -4px 32px rgba(24,20,15,.12);
            padding: 1rem 1.25rem;
            gap: .875rem;
          }
          /* Hide the less-critical elements on mobile sticky */
          .ts__quick-section, .ts__qty-section, .ts__note { display: none; }
          .ts__header { margin-bottom: 0; }
          /* Show a compact price + CTA row */
          .ts__price-row { padding: .625rem .875rem; }
          .ts__total-row { padding: .625rem 0; border-top: none; border-bottom: none; margin-bottom: 0; }
        }
        .ts__header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
        .ts__title { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); }
        .ts__remaining { font-size: .625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); font-weight: 600; white-space: nowrap; }
        .ts__closed { font-family: var(--font-cormorant,serif); font-size: 1.25rem; color: var(--ink3); text-align: center; padding: 1rem 0; }
        .ts__price-row { display: flex; justify-content: space-between; align-items: center; background: var(--gold-pale); border: 1px solid rgba(201,168,76,.25); border-radius: 10px; padding: .875rem 1rem; }
        .ts__price-label { font-size: .625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2); }
        .ts__price-val { font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 700; color: var(--gold); line-height: 1; }
        .ts__section-label { font-size: .5625rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); margin-bottom: .625rem; font-weight: 500; }
        .ts__quick { display: flex; gap: .5rem; }
        .ts__quick-btn { flex: 1; padding: .625rem .5rem; font-size: .875rem; font-weight: 600; border: 1.5px solid var(--border); background: var(--card); color: var(--ink2); cursor: pointer; border-radius: 8px; transition: border-color .15s, background .15s, color .15s; font-family: inherit; }
        .ts__quick-btn.active { border-color: var(--gold); background: var(--gold); color: #fff; }
        .ts__quick-btn:hover:not(.active) { border-color: var(--gold); color: var(--gold); }
        .ts__qty-section {}
        .ts__stepper { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; height: 54px; }
        .ts__step-btn { width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; font-size: 1.5rem; color: var(--ink2); transition: background .15s, color .15s; flex-shrink: 0; font-family: inherit; }
        .ts__step-btn:hover:not(:disabled) { background: var(--bg2); color: var(--gold); }
        .ts__step-btn:disabled { opacity: .3; cursor: not-allowed; }
        .ts__step-btn:first-child { border-right: 1px solid var(--border); }
        .ts__step-btn:last-child { border-left: 1px solid var(--border); }
        .ts__qty-val { flex: 1; text-align: center; font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 600; color: var(--ink); display: block; }
        .ts__max { font-size: .6875rem; color: var(--ink3); margin-top: .375rem; }
        .ts__total-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1rem 0; }
        .ts__total-label { font-size: .875rem; font-weight: 500; color: var(--ink2); }
        .ts__total-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 600; color: var(--ink); line-height: 1; }
        .ts__error { padding: .75rem 1rem; background: rgba(224,90,48,.08); border: 1px solid rgba(224,90,48,.25); border-radius: 8px; color: #b84020; font-size: .85rem; overflow: hidden; }
        .ts__cta {
          width: 100%; padding: 1rem; border-radius: var(--r-btn);
          background: var(--gold); color: #fff;
          font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          border: none; cursor: pointer; font-family: inherit;
          transition: background .2s; display: flex; align-items: center; justify-content: center;
        }
        .ts__cta:hover { background: var(--gold-d); }
        .ts__buy-now {
          width: 100%; padding: .75rem; border-radius: var(--r-btn);
          background: transparent; color: var(--ink2);
          font-size: .6875rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          border: 1.5px solid var(--border); cursor: pointer; font-family: inherit;
          transition: border-color .2s, color .2s;
        }
        .ts__buy-now:hover { border-color: var(--ink); color: var(--ink); }
        .ts__note { font-size: .6875rem; color: var(--ink3); text-align: center; line-height: 1.55; }
        .ts__free-link { color: var(--gold); text-decoration: none; }
        .ts__free-link:hover { text-decoration: underline; }
      `}</style>
    </motion.div>
  )
}
