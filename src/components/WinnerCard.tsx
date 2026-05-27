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
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className="wc"
    >
      {/* Rose gold top accent */}
      <div className="wc__accent" />

      <div className="wc__inner">
        {/* Winner label */}
        <p className="wc__tag">Winner</p>

        {/* Name */}
        <p className="wc__name">{name}</p>

        {/* Prize */}
        <p className="wc__prize">{prize}</p>

        <div className="wc__divider" />

        {/* Value + date */}
        <div className="wc__foot">
          <p className="wc__value">{formatCurrency(value)}</p>
          <p className="wc__date">{formatDate(winner.drawnAt)}</p>
        </div>
      </div>

      <style>{`
        .wc {
          background: var(--ink); position: relative; overflow: hidden;
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s;
        }
        .wc:hover { transform: translateY(-4px); box-shadow: 0 24px 56px rgba(0,0,0,.35); }
        .wc__accent {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c9848e 30%, var(--rg) 50%, #c9848e 70%, transparent 100%);
        }
        .wc__inner { padding: 2.25rem 2rem 1.875rem; }
        .wc__tag {
          font-size: .5rem; letter-spacing: .24em; text-transform: uppercase;
          color: var(--rg); margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: .625rem;
        }
        .wc__tag::before { content: '★'; font-size: .6rem; }
        .wc__name {
          font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 300;
          color: #fff; line-height: 1; letter-spacing: -.01em; margin-bottom: .5rem;
        }
        .wc__prize { font-size: .8125rem; color: rgba(255,255,255,.45); line-height: 1.55; margin-bottom: 1.75rem; }
        .wc__divider { height: 1px; background: rgba(255,255,255,.08); margin-bottom: 1.25rem; }
        .wc__foot { display: flex; align-items: flex-end; justify-content: space-between; }
        .wc__value {
          font-family: var(--font-cormorant,serif); font-size: 1.625rem; font-weight: 400; line-height: 1;
          background: linear-gradient(120deg, #e0a0aa 0%, #c9848e 40%, var(--rg) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wc__date { font-size: .6rem; letter-spacing: .08em; color: rgba(255,255,255,.28); }
      `}</style>
    </motion.div>
  )
}
