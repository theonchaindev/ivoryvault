'use client'

import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string; drawnAt: string | Date; prizeTitle?: string | null; prizeValue?: number | null
  user: { name: string }
  competition: { title: string; prizeValue: number; images?: string; slug?: string; ticketsSold?: number; maxTickets?: number }
}

function parseFirstImage(raw?: string): string | null {
  try { return raw ? (JSON.parse(raw) as string[])[0] ?? null : null } catch { return null }
}

export default function WinnerCard({ winner, index = 0 }: { winner: WinnerData; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-24px' })

  const parts = winner.user.name.trim().split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  const prize = winner.prizeTitle || winner.competition.title
  const value = winner.prizeValue ?? winner.competition.prizeValue
  const img = parseFirstImage(winner.competition.images)
  const slug = winner.competition.slug

  const inner = (
    <motion.div
      ref={ref}
      className="wc"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
    >
      <div className="wc__img-wrap">
        {img ? <img src={img} alt={prize} className="wc__img" /> : <div className="wc__no-img" />}
        <div className="wc__overlay" />
        <span className="wc__badge">★ Winner</span>
      </div>
      <div className="wc__body">
        <p className="wc__name">{name}</p>
        <p className="wc__prize">{prize}</p>
        <div className="wc__divider" />
        <div className="wc__foot">
          <span className="wc__value">{formatCurrency(value)}</span>
          <span className="wc__date">{formatDate(winner.drawnAt)}</span>
        </div>
      </div>
    </motion.div>
  )

  return slug
    ? <Link href={`/competitions/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
    : inner
}
