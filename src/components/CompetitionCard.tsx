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
  const hot = pct >= 80

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="cc"
    >
      <Link href={`/competitions/${c.slug}`} className="cc__link">
        {/* Full-bleed image */}
        {img ? (
          <motion.img
            src={img} alt={c.title}
            className="cc__img"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        ) : (
          <div className="cc__placeholder" />
        )}

        {/* Gradient overlay */}
        <div className="cc__gradient" />

        {/* Badges */}
        {hot && (
          <motion.div
            className="cc__hot"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300, delay: index * 0.07 + 0.25 }}
          >
            Selling Fast
          </motion.div>
        )}

        {/* Prize value top-right */}
        <div className="cc__prize-badge">
          <span className="cc__prize-label">Prize</span>
          <span className="cc__prize-val">{formatCurrency(c.prizeValue)}</span>
        </div>

        {/* Bottom overlay content */}
        <div className="cc__body">
          {c.drawDate && (
            <div className="cc__timer">
              <CountdownTimer drawDate={c.drawDate} compact />
            </div>
          )}
          <h3 className="cc__title">{c.title}</h3>
          {c.subtitle && <p className="cc__sub">{c.subtitle}</p>}

          {/* Progress */}
          <div className="cc__progress-row">
            <span className="cc__pct-label">{pct}% sold</span>
            <span className="cc__left">{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
          </div>
          <div className="cc__track">
            <motion.div
              className={`cc__fill${hot ? ' hot' : ''}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : { width: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 + 0.2 }}
            />
          </div>

          {/* Footer */}
          <div className="cc__foot">
            <div>
              <span className="cc__price-label">from</span>
              <span className="cc__price">{formatCurrency(c.ticketPrice)}</span>
            </div>
            <span className="cc__enter">Enter Now →</span>
          </div>
        </div>
      </Link>

      <style>{`
        .cc { position: relative; overflow: hidden; background: #111; }
        .cc::after { content: ''; position: absolute; inset: 0; border: 1px solid rgba(255,255,255,0); transition: border-color .35s; pointer-events: none; z-index: 3; }
        .cc:hover::after { border-color: var(--rg); }
        .cc__link { display: block; position: relative; aspect-ratio: 3/4; overflow: hidden; text-decoration: none; }
        .cc__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .cc__placeholder { position: absolute; inset: 0; background: linear-gradient(145deg, #2a1a20, #1a1210); }
        .cc__gradient {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0) 20%,
            rgba(0,0,0,.1) 45%,
            rgba(0,0,0,.7) 70%,
            rgba(0,0,0,.92) 100%
          );
        }
        .cc__hot {
          position: absolute; top: 1rem; left: 1rem; z-index: 2;
          background: var(--rg); color: #fff;
          font-size: .5rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          padding: .3rem .75rem;
        }
        .cc__prize-badge {
          position: absolute; top: 1rem; right: 1rem; z-index: 2;
          text-align: right;
        }
        .cc__prize-label { display: block; font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: .1rem; }
        .cc__prize-val { display: block; font-family: var(--font-cormorant,serif); font-size: 1.625rem; font-weight: 500; color: #fff; line-height: 1; text-shadow: 0 1px 8px rgba(0,0,0,.4); }
        .cc__body { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 1.25rem 1.375rem 1.5rem; }
        .cc__timer { margin-bottom: .625rem; }
        .cc__title { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: #fff; line-height: 1.15; margin-bottom: .25rem; }
        .cc__sub { font-size: .75rem; color: rgba(255,255,255,.55); margin-bottom: .875rem; line-height: 1.45; }
        .cc__progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: .375rem; }
        .cc__pct-label { font-size: .5625rem; color: rgba(255,255,255,.5); letter-spacing: .06em; }
        .cc__left { font-size: .5625rem; color: rgba(255,255,255,.4); }
        .cc__track { height: 1.5px; background: rgba(255,255,255,.2); overflow: hidden; margin-bottom: 1rem; }
        .cc__fill { height: 100%; background: rgba(255,255,255,.7); }
        .cc__fill.hot { background: var(--rg); }
        .cc__foot { display: flex; align-items: center; justify-content: space-between; }
        .cc__price-label { font-size: .5rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.4); margin-right: .3rem; }
        .cc__price { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: #fff; }
        .cc__enter { font-size: .5875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--rg); font-weight: 500; transition: color .2s; }
        .cc:hover .cc__enter { color: #e08898; }
      `}</style>
    </motion.article>
  )
}
