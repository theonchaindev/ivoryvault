'use client'

import { motion } from 'motion/react'
import { formatCurrency } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

export default function WinnersHero({ count, total }: { count: number; total: number }) {
  return (
    <div className="wpage__hero">
      <motion.p className="wpage__label" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.1 }}>
        Success Stories
      </motion.p>
      <motion.h1 className="wpage__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.15 }}>
        Our Winners
      </motion.h1>
      <motion.p className="wpage__sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.25 }}>
        Real people. Real prizes. Every draw is transparent and verified.
      </motion.p>
      {count > 0 && (
        <motion.div className="wpage__stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.38 }}>
          <div className="wpage__stat">
            <span className="wpage__stat-val">{count}</span>
            <span className="wpage__stat-label">Winners to date</span>
          </div>
          <div className="wpage__stat-div" />
          <div className="wpage__stat">
            <span className="wpage__stat-val">{formatCurrency(total)}</span>
            <span className="wpage__stat-label">Total prizes awarded</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
