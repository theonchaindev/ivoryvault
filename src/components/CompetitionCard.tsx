'use client'

import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface Comp {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; images: string; drawDate?: string | null
  status: string; featured: boolean
}

export default function CompetitionCard({ competition: c, index = 0 }: { competition: Comp; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-24px' })
  const imgs = (() => { try { return JSON.parse(c.images) as string[] } catch { return [] } })()
  const img = imgs[0]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))
  const remaining = c.maxTickets - c.ticketsSold
  const hot = pct >= 80

  return (
    <motion.article
      ref={ref}
      className={`cc${c.slug === 'ps5-dualsense-controller' ? ' theme-blue' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    >
      <Link href={`/competitions/${c.slug}`} className="cc__link">

        {/* Image */}
        <div className="cc__img-wrap">
          {img
            ? <img src={img} alt={c.title} className="cc__img" />
            : <div className="cc__placeholder" />
          }
          {hot && <span className="cc__hot">🔥 Hot</span>}
        </div>

        {/* Timer */}
        {c.drawDate && (
          <div className="cc__timer">
            <CountdownTimer drawDate={c.drawDate} variant="strip" />
          </div>
        )}

        {/* Body */}
        <div className="cc__body">
          <h3 className="cc__title">{c.title}</h3>

          <div className="cc__sold-row">
            <span>{c.ticketsSold.toLocaleString()} sold</span>
            <span className="cc__sold-remaining">{remaining.toLocaleString()} left</span>
          </div>

          <div className="cc__track">
            <motion.div
              className={`cc__fill${hot ? ' cc__fill--hot' : ''}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : { width: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 + 0.2 }}
            />
          </div>

          <div className="cc__foot">
            <div className="cc__price-wrap">
              <span className="cc__price">{formatCurrency(c.ticketPrice)}</span>
              <span className="cc__price-per"> per entry</span>
            </div>
          </div>

          {/* Bold full-width Enter Now button */}
          <span className="cc__enter-btn">Enter Now</span>
        </div>

      </Link>
    </motion.article>
  )
}
