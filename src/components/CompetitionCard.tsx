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
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className="cc"
    >
      <Link href={`/competitions/${c.slug}`} className="cc__link">

        {/* ── Square image ── */}
        <div className="cc__img-wrap">
          {img ? (
            <motion.img
              src={img} alt={c.title} className="cc__img"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          ) : (
            <div className="cc__placeholder" />
          )}

          {/* Prize badge top-right */}
          <div className="cc__prize-badge">
            <span className="cc__prize-label">Prize</span>
            <span className="cc__prize-val">{formatCurrency(c.prizeValue)}</span>
          </div>

          {/* Hot badge top-left */}
          {hot && (
            <motion.div
              className="cc__hot"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 300, delay: index * 0.06 + 0.2 }}
            >
              🔥 Selling Fast
            </motion.div>
          )}
        </div>

        {/* ── Timer strip ── */}
        {c.drawDate && (
          <div className="cc__timer-wrap">
            <CountdownTimer drawDate={c.drawDate} variant="strip" />
          </div>
        )}

        {/* ── Card body (cream) ── */}
        <div className="cc__body">
          <h3 className="cc__title">{c.title}</h3>
          {c.subtitle && <p className="cc__sub">{c.subtitle}</p>}

          {/* Progress */}
          <div className="cc__progress-row">
            <span className="cc__pct">{pct}% sold</span>
            <span className="cc__left">{(c.maxTickets - c.ticketsSold).toLocaleString()} remaining</span>
          </div>
          <div className="cc__track">
            <motion.div
              className={`cc__fill${hot ? ' hot' : ''}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : { width: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 + 0.15 }}
            />
          </div>

          {/* Footer */}
          <div className="cc__foot">
            <div className="cc__price-wrap">
              <span className="cc__from">from</span>
              <span className="cc__price">{formatCurrency(c.ticketPrice)}</span>
              <span className="cc__per">/entry</span>
            </div>
            <span className="cc__cta">Enter Now →</span>
          </div>
        </div>
      </Link>

      <style>{`
        .cc {
          background: #fff;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow .35s, transform .35s;
        }
        .cc:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,.1); }
        .cc__link { display: block; text-decoration: none; }

        /* Image */
        .cc__img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--off); }
        .cc__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .cc__placeholder { position: absolute; inset: 0; background: linear-gradient(145deg, #1a1510, #120f0a); }

        /* Badges */
        .cc__prize-badge {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
          background: linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,0) 100%);
          padding: 2rem 1rem .875rem;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .cc__prize-label { font-size: .5rem; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .cc__prize-val { font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 500; color: #fff; line-height: 1; }
        .cc__hot {
          position: absolute; top: .75rem; left: .75rem; z-index: 3;
          background: var(--rg); color: #fff;
          font-size: .5rem; font-weight: 600; letter-spacing: .1em;
          padding: .3rem .75rem; text-transform: uppercase;
        }

        /* Timer */
        .cc__timer-wrap { background: var(--ink); }

        /* Body */
        .cc__body { padding: 1rem 1.125rem 1.125rem; }
        .cc__title {
          font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500;
          color: var(--ink); line-height: 1.2; margin-bottom: .25rem;
        }
        .cc__sub { font-size: .75rem; color: var(--ink3); margin-bottom: .75rem; line-height: 1.45; }
        .cc__progress-row {
          display: flex; justify-content: space-between;
          font-size: .5625rem; color: var(--ink3); margin-bottom: .3rem;
        }
        .cc__track { height: 3px; background: var(--border); overflow: hidden; margin-bottom: .875rem; border-radius: 2px; }
        .cc__fill { height: 100%; background: var(--border); border-radius: 2px; transition: background .3s; }
        .cc__fill.hot { background: var(--rg); }
        .cc:hover .cc__fill { background: var(--rg); }

        /* Footer */
        .cc__foot { display: flex; align-items: center; justify-content: space-between; padding-top: .75rem; border-top: 1px solid var(--border); }
        .cc__price-wrap { display: flex; align-items: baseline; gap: .2rem; }
        .cc__from { font-size: .5rem; letter-spacing: .08em; text-transform: uppercase; color: var(--ink3); }
        .cc__price { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: var(--ink); line-height: 1; }
        .cc__per { font-size: .5rem; color: var(--ink3); letter-spacing: .06em; }
        .cc__cta {
          font-size: .5875rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--rg); font-weight: 600;
          background: var(--rg-pale); padding: .5rem .875rem;
          transition: background .2s, color .2s;
        }
        .cc:hover .cc__cta { background: var(--rg); color: #fff; }
      `}</style>
    </motion.article>
  )
}
