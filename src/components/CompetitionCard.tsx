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
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const imgs = (() => { try { return JSON.parse(c.images) as string[] } catch { return [] } })()
  const img = imgs[0]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))
  const left = c.maxTickets - c.ticketsSold
  const hot = pct >= 80

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="comp-card"
    >
      {/* Image */}
      <Link href={`/competitions/${c.slug}`} className="comp-card__img-wrap">
        {img ? (
          <motion.img
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            src={img} alt={c.title}
            className="comp-card__img"
          />
        ) : (
          <div className="comp-card__img-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#b8687a" strokeWidth="1"/>
              <path d="M15 24l6-8 6 10 5-7 6 5" stroke="#b8687a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div className="comp-card__scrim" />
        <div className="comp-card__prize">{formatCurrency(c.prizeValue)}</div>
        {hot && (
          <motion.div
            className="comp-card__badge"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.07 + 0.3, type: 'spring', stiffness: 300 }}
          >
            Selling Fast
          </motion.div>
        )}
      </Link>

      {/* Body */}
      <div className="comp-card__body">
        <Link href={`/competitions/${c.slug}`} style={{ textDecoration: 'none' }}>
          <h3 className="comp-card__title">{c.title}</h3>
        </Link>
        {c.subtitle && <p className="comp-card__sub">{c.subtitle}</p>}

        {/* Progress */}
        <div className="comp-card__progress-row">
          <span className="comp-card__left">{left.toLocaleString()} left</span>
          <span className={`comp-card__pct${hot ? ' hot' : ''}`}>{pct}%</span>
        </div>
        <div className="comp-card__track">
          <motion.div
            className={`comp-card__fill${hot ? ' hot' : ''}`}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 + 0.2 }}
          />
        </div>

        {c.drawDate && (
          <div className="comp-card__timer">
            <CountdownTimer drawDate={c.drawDate} compact />
          </div>
        )}

        {/* Footer */}
        <div className="comp-card__foot">
          <div>
            <p className="comp-card__price-label">Per ticket</p>
            <p className="comp-card__price">{formatCurrency(c.ticketPrice)}</p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href={`/competitions/${c.slug}`} className="btn-rg comp-card__cta">Enter Now →</Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        .comp-card { background: #fff; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .4s cubic-bezier(.22,1,.36,1); will-change: transform; }
        .comp-card:hover { box-shadow: 0 20px 56px rgba(12,11,10,.12); }
        .comp-card__img-wrap { display: block; position: relative; height: 260px; overflow: hidden; flex-shrink: 0; }
        .comp-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .comp-card__img-placeholder { width: 100%; height: 100%; background: linear-gradient(145deg,#f0e8e0,#e4d8cc); display: flex; align-items: center; justify-content: center; }
        .comp-card__scrim { position: absolute; bottom: 0; left: 0; right: 0; height: 110px; background: linear-gradient(to top, rgba(12,11,10,.75) 0%, transparent 100%); pointer-events: none; }
        .comp-card__prize { position: absolute; bottom: 1rem; left: 1.25rem; font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 500; color: #fff; line-height: 1; text-shadow: 0 1px 8px rgba(0,0,0,.35); }
        .comp-card__badge { position: absolute; top: 1rem; right: 1rem; background: var(--rg); color: #fff; font-size: .5625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: .3rem .75rem; }
        .comp-card__body { padding: 1.375rem 1.5rem 1.75rem; flex: 1; display: flex; flex-direction: column; }
        .comp-card__title { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); line-height: 1.15; margin-bottom: .25rem; transition: color .2s; }
        .comp-card__title:hover { color: var(--rg); }
        .comp-card__sub { font-size: .8125rem; color: var(--ink3); margin-bottom: 1.125rem; line-height: 1.5; }
        .comp-card__progress-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: .4rem; margin-top: auto; padding-top: 1rem; }
        .comp-card__left { font-size: .6875rem; color: var(--ink3); }
        .comp-card__pct { font-size: .6875rem; color: var(--ink3); }
        .comp-card__pct.hot { color: var(--rg); font-weight: 600; }
        .comp-card__track { height: 2px; background: var(--border); overflow: hidden; margin-bottom: 1rem; }
        .comp-card__fill { height: 100%; background: var(--ink2); }
        .comp-card__fill.hot { background: var(--rg); }
        .comp-card__timer { margin-bottom: 1rem; }
        .comp-card__foot { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); }
        .comp-card__price-label { font-size: .5625rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); margin-bottom: .15rem; }
        .comp-card__price { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); line-height: 1; }
        .comp-card__cta { padding: .625rem 1.375rem; font-size: .625rem; display: inline-block; }
      `}</style>
    </motion.div>
  )
}
