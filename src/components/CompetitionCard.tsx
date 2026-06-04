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
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className="cc"
    >
      <Link href={`/competitions/${c.slug}`} className="cc__link">

        {/* ── Square image ── */}
        <div className="cc__img-wrap">
          {img
            ? <motion.img src={img} alt={c.title} className="cc__img" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} />
            : <div className="cc__placeholder" />
          }
          {hot && <div className="cc__hot">🔥 Hot</div>}
          <div className="cc__prize-badge">
            <span className="cc__prize-val">{formatCurrency(c.prizeValue)}</span>
            <span className="cc__prize-label">prize value</span>
          </div>
        </div>

        {/* ── Countdown timer ── */}
        {c.drawDate && (
          <div className="cc__timer">
            <CountdownTimer drawDate={c.drawDate} variant="strip" />
          </div>
        )}

        {/* ── Card info ── */}
        <div className="cc__body">
          <h3 className="cc__title">{c.title}</h3>

          {/* Sold / remaining */}
          <div className="cc__sold-row">
            <span className="cc__sold">{c.ticketsSold.toLocaleString()} tickets sold</span>
            <span className="cc__remaining">{remaining.toLocaleString()} left</span>
          </div>

          {/* Progress bar */}
          <div className="cc__track">
            <motion.div
              className={`cc__fill${hot ? ' cc__fill--hot' : ''}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : { width: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 + 0.2 }}
            />
          </div>

          {/* Footer: price + CTA */}
          <div className="cc__foot">
            <div className="cc__price-wrap">
              <span className="cc__price">{formatCurrency(c.ticketPrice)}</span>
              <span className="cc__per"> per entry</span>
            </div>
            <span className="cc__cta">View Competition →</span>
          </div>
        </div>
      </Link>

      <style>{`
        .cc { background: #fff; border: 1px solid var(--border); overflow: hidden; border-radius: 4px; transition: box-shadow .3s, transform .3s, border-color .3s; }
        .cc:hover { box-shadow: 0 8px 32px rgba(0,0,0,.1); transform: translateY(-3px); border-color: var(--rg); }
        .cc__link { display: block; text-decoration: none; }
        .cc__img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--off); }
        .cc__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .cc__placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,#f0ead8,#e8dfc8); display: flex; align-items: center; justify-content: center; }
        .cc__hot { position: absolute; top: .625rem; left: .625rem; background: #e85d2e; color: #fff; font-size: .5rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: .25rem .625rem; border-radius: 2px; z-index: 2; }
        .cc__prize-badge { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top,rgba(0,0,0,.78),transparent); padding: 1.5rem .875rem .625rem; text-align: right; z-index: 2; }
        .cc__prize-val { display: block; font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 600; color: #fff; line-height: 1; }
        .cc__prize-label { display: block; font-size: .45rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); margin-top: 1px; }
        .cc__timer { background: var(--ink); border-top: 1px solid rgba(255,255,255,.06); }
        .cc__body { padding: .875rem 1rem 1rem; }
        .cc__title { font-family: var(--font-cormorant,serif); font-size: 1.1875rem; font-weight: 600; color: var(--ink); line-height: 1.2; margin-bottom: .625rem; }
        .cc__sold-row { display: flex; justify-content: space-between; font-size: .625rem; color: var(--ink3); margin-bottom: .375rem; }
        .cc__sold { color: var(--ink3); }
        .cc__remaining { color: var(--rg); font-weight: 600; }
        .cc__track { height: 5px; background: var(--off); border-radius: 999px; overflow: hidden; margin-bottom: .875rem; }
        .cc__fill { height: 100%; background: var(--rg); border-radius: 999px; }
        .cc__fill--hot { background: #e85d2e; }
        .cc__foot { display: flex; align-items: center; justify-content: space-between; padding-top: .75rem; border-top: 1px solid var(--border); }
        .cc__price-wrap { display: flex; align-items: baseline; gap: .125rem; }
        .cc__price { font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 700; color: var(--ink); }
        .cc__per { font-size: .5625rem; color: var(--ink3); }
        .cc__cta { font-size: .5625rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--rg); transition: color .2s; }
        .cc:hover .cc__cta { color: var(--rg-dark); }
      `}</style>
    </motion.article>
  )
}
