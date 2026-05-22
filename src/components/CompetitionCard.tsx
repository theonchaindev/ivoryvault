'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface Comp {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; images: string; drawDate?: string | null
  status: string; featured: boolean
}

export default function CompetitionCard({ competition: c, index = 0 }: { competition: Comp; index?: number }) {
  const imgs = (() => { try { return JSON.parse(c.images) as string[] } catch { return [] } })()
  const img = imgs[0]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))
  const left = c.maxTickets - c.ticketsSold
  const hot = pct >= 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .55, ease: [.25, .46, .45, .94], delay: index * .08 }}
      className="comp-card"
    >
      {/* Image */}
      <Link href={`/competitions/${c.slug}`} className="comp-card__img-wrap">
        {img
          ? <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: .6, ease: [.25,.46,.45,.94] }} src={img} alt={c.title} className="comp-card__img" />
          : <div className="comp-card__img-placeholder"><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#b8687a" strokeWidth="1"/><path d="M15 24l6-8 6 10 5-7 6 5" stroke="#b8687a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        }
        {/* Dark scrim at bottom */}
        <div className="comp-card__scrim" />
        {/* Prize value over image */}
        <div className="comp-card__prize">{formatCurrency(c.prizeValue)}</div>
        {hot && <div className="comp-card__badge">Selling Fast</div>}
      </Link>

      {/* Body */}
      <div className="comp-card__body">
        <Link href={`/competitions/${c.slug}`} style={{ textDecoration: 'none' }}>
          <h3 className="comp-card__title">{c.title}</h3>
        </Link>
        {c.subtitle && <p className="comp-card__sub">{c.subtitle}</p>}

        {/* Progress */}
        <div className="comp-card__progress-row">
          <span className="comp-card__left">{left.toLocaleString()} tickets left</span>
          <span className={`comp-card__pct ${hot ? 'hot' : ''}`}>{pct}%</span>
        </div>
        <div className="comp-card__track"><div className={`comp-card__fill ${hot ? 'hot' : ''}`} style={{ width: `${pct}%` }} /></div>

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
          <Link href={`/competitions/${c.slug}`} className="btn-rg comp-card__cta">Enter Now →</Link>
        </div>
      </div>

      <style>{`
        .comp-card { background: #fff; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .35s, transform .35s; }
        .comp-card:hover { box-shadow: 0 16px 48px rgba(12,11,10,.1); transform: translateY(-3px); }
        .comp-card__img-wrap { display: block; position: relative; height: 260px; overflow: hidden; flex-shrink: 0; }
        .comp-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .comp-card__img-placeholder { width: 100%; height: 100%; background: linear-gradient(145deg,#f0e8e0,#e4d8cc); display: flex; align-items: center; justify-content: center; }
        .comp-card__scrim { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to top, rgba(12,11,10,.7) 0%, transparent 100%); pointer-events: none; }
        .comp-card__prize { position: absolute; bottom: 1rem; left: 1.25rem; font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 500; color: #fff; line-height: 1; text-shadow: 0 1px 6px rgba(0,0,0,.3); }
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
        .comp-card__fill { height: 100%; background: var(--ink2); transition: width .6s ease; }
        .comp-card__fill.hot { background: var(--rg); }
        .comp-card__timer { margin-bottom: 1rem; }
        .comp-card__foot { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); }
        .comp-card__price-label { font-size: .5625rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); margin-bottom: .15rem; }
        .comp-card__price { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); line-height: 1; }
        .comp-card__cta { padding: .625rem 1.375rem; font-size: .625rem; }
      `}</style>
    </motion.div>
  )
}
