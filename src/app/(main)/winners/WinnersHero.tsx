'use client'

import { motion } from 'motion/react'
import { formatCurrency } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

export default function WinnersHero({ count, total }: { count: number; total: number }) {
  return (
    <section className="wh">
      <div className="wh__inner">
        <motion.p
          className="wh__label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Success Stories
        </motion.p>
        <motion.h1
          className="wh__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.2 }}
        >
          Our Winners
        </motion.h1>
        <motion.p
          className="wh__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.32 }}
        >
          Real people. Real prizes. Every draw is transparent and verified.
        </motion.p>

        {count > 0 && (
          <motion.div
            className="wh__stats"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.45 }}
          >
            <div className="wh__stat">
              <span className="wh__stat-val">{count}</span>
              <span className="wh__stat-label">Winners to date</span>
            </div>
            <div className="wh__stat-div" />
            <div className="wh__stat">
              <span className="wh__stat-val">{formatCurrency(total)}</span>
              <span className="wh__stat-label">Total prizes awarded</span>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .wh {
          background: #fff; border-bottom: 1px solid var(--border);
          padding: clamp(5rem,8vw,8rem) 2rem clamp(3rem,5vw,4rem);
        }
        .wh__inner { max-width: 1280px; margin: 0 auto; }
        .wh__label { font-size: .5875rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .875rem; }
        .wh__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5rem); font-weight: 300; color: var(--ink); line-height: .95; letter-spacing: -.02em; margin-bottom: .75rem; }
        .wh__sub { font-family: var(--font-cormorant,serif); font-size: clamp(1rem,2vw,1.25rem); font-style: italic; color: var(--ink3); max-width: 500px; line-height: 1.6; }
        .wh__stats { display: flex; align-items: center; gap: 0; margin-top: 2.5rem; width: fit-content; border: 1px solid var(--border); }
        .wh__stat { padding: 1rem 2rem; }
        .wh__stat-val { display: block; font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 400; color: var(--ink); line-height: 1; margin-bottom: .2rem; }
        .wh__stat-label { display: block; font-size: .5375rem; letter-spacing: .15em; text-transform: uppercase; color: var(--ink3); }
        .wh__stat-div { width: 1px; align-self: stretch; background: var(--border); margin: .75rem 0; }
      `}</style>
    </section>
  )
}
