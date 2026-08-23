'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

interface Competition {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; images: string; drawDate?: string | null
  status: string; featured: boolean; closed?: boolean; upcoming?: boolean
}

export default function CompetitionsClient({ competitions }: { competitions: Competition[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="page-section page-section--cream">
      <div className="section-inner">
        <motion.div
          ref={ref}
          className="section-head"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="section-head__label">Live Now — {competitions.filter(c => c.status === 'active' && !c.closed && !c.upcoming).length} Active</p>
            <h1 className="section-head__title">All Competitions</h1>
          </div>
        </motion.div>

        {competitions.length > 0 ? (
          <div className="comp-grid">
            {competitions.map((c, i) => (
              <CompetitionCard key={c.id} competition={c} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No live competitions right now — check back soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}
