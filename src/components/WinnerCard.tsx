'use client'

import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string
  drawnAt: string | Date
  prizeTitle?: string | null
  prizeValue?: number | null
  user: { name: string }
  competition: {
    title: string
    prizeValue: number
    images?: string
    slug?: string
    ticketsSold?: number
    maxTickets?: number
  }
}

function parseFirstImage(raw?: string): string | null {
  try { return raw ? (JSON.parse(raw) as string[])[0] ?? null : null } catch { return null }
}

export default function WinnerCard({ winner, index = 0 }: { winner: WinnerData; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })

  const parts = winner.user.name.trim().split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  const prize = winner.prizeTitle || winner.competition.title
  const value = winner.prizeValue ?? winner.competition.prizeValue
  const img = parseFirstImage(winner.competition.images)
  const slug = winner.competition.slug

  const card = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="wc"
    >
      {/* Image */}
      <div className="wc__img-wrap">
        {img
          ? <img src={img} alt={prize} className="wc__img" />
          : <div className="wc__no-img" />
        }
        <div className="wc__img-overlay" />
        <div className="wc__winner-tag">★ WINNER</div>
      </div>

      {/* Body */}
      <div className="wc__body">
        <p className="wc__name">{name}</p>
        <p className="wc__prize">{prize}</p>
        <div className="wc__divider" />
        <div className="wc__foot">
          <span className="wc__value">{formatCurrency(value)}</span>
          <span className="wc__date">{formatDate(winner.drawnAt)}</span>
        </div>
        {slug && <p className="wc__cta">View competition →</p>}
      </div>

      <style>{`
        .wc { background: #fff; border: 1px solid var(--border); overflow: hidden; border-radius: 4px; transition: box-shadow .3s, transform .3s, border-color .3s; }
        .wc:hover { box-shadow: 0 8px 32px rgba(0,0,0,.1); transform: translateY(-3px); border-color: var(--rg); }
        .wc__img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; }
        .wc__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s; }
        .wc:hover .wc__img { transform: scale(1.05); }
        .wc__no-img { width: 100%; height: 100%; background: linear-gradient(135deg,var(--off),var(--border)); }
        .wc__img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 60%); }
        .wc__winner-tag { position: absolute; top: .625rem; left: .625rem; background: var(--rg); color: #fff; font-size: .45rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; padding: .275rem .625rem; }
        .wc__body { padding: 1rem 1.125rem 1.125rem; }
        .wc__name { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); line-height: 1; margin-bottom: .25rem; }
        .wc__prize { font-size: .75rem; color: var(--ink3); line-height: 1.45; margin-bottom: .875rem; }
        .wc__divider { height: 1px; background: var(--border); margin-bottom: .875rem; }
        .wc__foot { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: .5rem; }
        .wc__value { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 600; color: var(--rg); }
        .wc__date { font-size: .5625rem; letter-spacing: .06em; color: var(--ink3); }
        .wc__cta { font-size: .5375rem; letter-spacing: .1em; text-transform: uppercase; color: var(--rg); opacity: 0; transition: opacity .25s; font-weight: 600; }
        .wc:hover .wc__cta { opacity: 1; }
      `}</style>
    </motion.div>
  )

  return slug ? <Link href={`/competitions/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>{card}</Link> : card
}
