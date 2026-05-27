'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string; drawnAt: string | Date
  prizeTitle?: string | null; prizeValue?: number | null
  user: { name: string }
  competition: { title: string; prizeValue: number }
}

export default function WinnerCard({ winner, index = 0 }: { winner: WinnerData; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const parts = winner.user.name.trim().split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  const prize = winner.prizeTitle || winner.competition.title
  const value = winner.prizeValue ?? winner.competition.prizeValue

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className="wc"
    >
      <div className="wc__top-line" />

      <motion.div
        className="wc__star"
        initial={{ scale: 0, rotate: -30 }}
        animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: index * 0.07 + 0.2 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5 L12.2 7.3 L18.4 7.6 L13.8 11.5 L15.4 17.5 L10 14 L4.6 17.5 L6.2 11.5 L1.6 7.6 L7.8 7.3 Z" fill="#b8687a" opacity=".85" />
        </svg>
      </motion.div>

      <p className="wc__name">{name}</p>
      <p className="wc__prize">{prize}</p>

      <div className="wc__foot">
        <div>
          <p className="wc__val-label">Prize Value</p>
          <p className="wc__val">{formatCurrency(value)}</p>
        </div>
        <p className="wc__date">{formatDate(winner.drawnAt)}</p>
      </div>

      <style>{`
        .wc {
          background: #fff; padding: 2.5rem; position: relative;
          overflow: hidden; cursor: default;
          box-shadow: 0 1px 0 var(--border);
          transition: box-shadow .35s;
        }
        .wc:hover { box-shadow: 0 20px 48px rgba(12,11,10,.1); }
        .wc__top-line {
          position: absolute; top: 0; left: 2.5rem; right: 2.5rem;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--rg), transparent);
        }
        .wc__star { margin-bottom: 1.5rem; display: inline-block; }
        .wc__name { font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 400; color: var(--ink); line-height: 1.05; margin-bottom: .375rem; }
        .wc__prize { font-size: .8125rem; color: var(--ink3); margin-bottom: 2rem; line-height: 1.55; }
        .wc__foot { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .wc__val-label { font-size: .5rem; letter-spacing: .18em; text-transform: uppercase; color: var(--ink3); margin-bottom: .25rem; }
        .wc__val {
          font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; line-height: 1;
          background: linear-gradient(120deg, #c9848e 0%, #b8687a 50%, #8a4f58 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wc__date { font-size: .6875rem; color: var(--ink3); }
      `}</style>
    </motion.div>
  )
}
