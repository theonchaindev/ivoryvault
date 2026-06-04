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

const cats = [
  { id: 'all', label: 'All Competitions' },
  { id: 'watches', label: 'Watches & Jewellery' },
  { id: 'cash', label: 'Cash Prizes' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'experience', label: 'Experiences' },
]

export default function CompetitionsClient({ competitions }: { competitions: Competition[] }) {
  const [active, setActive] = useState('all')

  const filtered = competitions.filter(c => {
    if (active === 'all') return true
    const s = (c.title + ' ' + (c.subtitle || '')).toLowerCase()
    if (active === 'watches') return s.includes('watch') || s.includes('jewel') || s.includes('rolex') || s.includes('omega') || s.includes('gold') || s.includes('ring')
    if (active === 'cash') return s.includes('cash') || s.includes('£') || s.includes('money')
    if (active === 'electronics') return s.includes('macbook') || s.includes('iphone') || s.includes('tech') || s.includes('ps5') || s.includes('electronic')
    if (active === 'experience') return s.includes('travel') || s.includes('holiday') || s.includes('trip') || s.includes('experience') || s.includes('track')
    return true
  })

  return (
    <div className="cc-wrap">

      {/* ── Page header ── */}
      <motion.div
        className="cc-header"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="cc-header__label">Live Now · {competitions.length} Active</p>
          <h1 className="cc-header__title">All Competitions</h1>
        </div>
      </motion.div>

      {/* ── Filter tabs ── */}
      <motion.div
        className="cc-tabs"
        role="tablist"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        {cats.map(cat => (
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
      </motion.div>

      {/* ── Grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={active}
            className="cc-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
            exit={{ opacity: 0 }}
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
        .cc-wrap { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem) 6rem; }
        .cc-header { padding: 4rem 0 2.5rem; border-bottom: 1px solid var(--border); margin-bottom: 2.5rem; }
        .cc-header__label { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .75rem; }
        .cc-header__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.5rem,5vw,4rem); font-weight: 300; color: var(--ink); line-height: .95; letter-spacing: -.02em; }
        .cc-tabs {
          display: flex; gap: 0; margin-bottom: 2.5rem;
          border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none;
        }
        .cc-tabs::-webkit-scrollbar { display: none; }
        .cc-tab {
          position: relative; padding: .875rem 1.5rem;
          font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase;
          font-weight: 500; background: none; border: none;
          color: var(--ink3); cursor: pointer; white-space: nowrap; transition: color .2s;
        }
        .cc-tab.active { color: var(--ink); }
        .cc-tab:hover:not(.active) { color: var(--ink2); }
        .cc-tab__indicator { position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--rg); }
        .cc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .cc-empty { padding: 5rem 2rem; text-align: center; }
        .cc-empty__text { font-family: var(--font-cormorant,serif); font-size: 1.5rem; color: var(--ink3); }
        @media (max-width: 640px) {
          .cc-grid {
            display: flex; overflow-x: auto;
            scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
            gap: 1rem; padding-bottom: 1rem; scrollbar-width: none;
          }
          .cc-grid::-webkit-scrollbar { display: none; }
          .cc-grid > * { flex: 0 0 80vw; scroll-snap-align: start; }
        }
      `}</style>
    </div>
  )
}
