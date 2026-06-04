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
    if (active === 'electronics') return s.includes('macbook') || s.includes('iphone') || s.includes('ps5') || s.includes('tech')
    if (active === 'experience') return s.includes('travel') || s.includes('holiday') || s.includes('trip') || s.includes('experience') || s.includes('track')
    return true
  })

  return (
    <div className="comps-page__body">
      <motion.div
        className="comps-page__header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="comps-page__label">{competitions.length} Active</p>
        <h1 className="comps-page__title">All Competitions</h1>
      </motion.div>

      <motion.div
        className="cc-tabs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        {cats.map(cat => (
          <button key={cat.id} className={`cc-tab${active === cat.id ? ' active' : ''}`} onClick={() => setActive(cat.id)}>
            {cat.label}
            {active === cat.id && (
              <motion.span className="cc-tab__indicator" layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={active}
            className="comp-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.map((c, i) => <CompetitionCard key={c.id} competition={c} index={i} />)}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <p>No competitions in this category yet.</p>
            <button className="btn-outline" onClick={() => setActive('all')} style={{ marginTop: '1.5rem' }}>View All</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
