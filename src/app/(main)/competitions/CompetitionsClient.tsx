'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import CompetitionCard from '@/components/CompetitionCard'

interface Competition {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; images: string; drawDate?: string | null
  status: string; featured: boolean
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'watches', label: 'Watches & Jewellery' },
  { id: 'cash', label: 'Cash' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'experience', label: 'Experiences' },
]

export default function CompetitionsClient({ competitions }: { competitions: Competition[] }) {
  const [active, setActive] = useState('all')

  const filtered = competitions.filter(c => {
    if (active === 'all') return true
    const s = (c.title + ' ' + (c.subtitle || '')).toLowerCase()
    if (active === 'watches') return s.includes('watch') || s.includes('jewel') || s.includes('ring') || s.includes('gold')
    if (active === 'cash') return s.includes('cash') || s.includes('£') || s.includes('money')
    if (active === 'electronics') return s.includes('macbook') || s.includes('iphone') || s.includes('tech') || s.includes('electronic')
    if (active === 'experience') return s.includes('travel') || s.includes('holiday') || s.includes('trip') || s.includes('experience')
    return true
  })

  return (
    <div className="cc-wrap">
      {/* Filter tabs */}
      <div className="cc-tabs" role="tablist">
        {categories.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => setActive(cat.id)}
            className={`cc-tab${active === cat.id ? ' active' : ''}`}
          >
            {cat.label}
            {active === cat.id && (
              <motion.span
                layoutId="tab-indicator"
                className="cc-tab__indicator"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={active}
            className="cc-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((comp, i) => (
              <CompetitionCard key={comp.id} competition={comp} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="cc-empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="cc-empty__text">No competitions in this category yet</p>
            <motion.button
              onClick={() => setActive('all')}
              className="btn-ghost"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ marginTop: '1.5rem' }}
            >
              View All Competitions
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cc-wrap { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 6rem; }
        .cc-tabs {
          display: flex; gap: 0; margin-bottom: 2.5rem;
          border-bottom: 1px solid var(--border); overflow-x: auto;
          scrollbar-width: none;
        }
        .cc-tabs::-webkit-scrollbar { display: none; }
        .cc-tab {
          position: relative; padding: .875rem 1.5rem;
          font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase;
          font-weight: 500; background: none; border: none;
          color: var(--ink3); cursor: pointer; white-space: nowrap;
          transition: color .2s;
        }
        .cc-tab.active { color: var(--rg); }
        .cc-tab:hover:not(.active) { color: var(--ink2); }
        .cc-tab__indicator {
          position: absolute; bottom: -1px; left: 0; right: 0;
          height: 2px; background: var(--rg);
        }
        .cc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .cc-empty { padding: 5rem 2rem; text-align: center; }
        .cc-empty__text { font-family: var(--font-cormorant,serif); font-size: 1.5rem; color: var(--ink3); }
        @media (max-width: 640px) { .cc-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
