'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface Comp {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; drawDate?: string | null; heroImg: string | null
}

function FeaturedCard({ c, large = false, index = 0 }: { c: Comp; large?: boolean; index?: number }) {
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))

  return (
    <motion.div
      className={`fg-card${large ? ' fg-card--large' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      <Link href={`/competitions/${c.slug}`} className="fg-card__link">
        {/* Image */}
        <div className="fg-card__img-wrap">
          {c.heroImg
            ? <motion.img src={c.heroImg} alt={c.title} className="fg-card__img" whileHover={{ scale: 1.04 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} />
            : <div className="fg-card__placeholder" />
          }
          <div className="fg-card__scrim" />

          {/* Prize value — large overlay */}
          <div className="fg-card__prize">
            <span className="fg-card__prize-label">Prize Value</span>
            <span className="fg-card__prize-val">{formatCurrency(c.prizeValue)}</span>
          </div>
        </div>

        {/* Timer strip */}
        {c.drawDate && (
          <div className="fg-card__timer">
            <CountdownTimer drawDate={c.drawDate} variant="strip" />
          </div>
        )}

        {/* Body */}
        <div className="fg-card__body">
          <div className="fg-card__text">
            <h3 className="fg-card__title">{c.title}</h3>
            {c.subtitle && <p className="fg-card__sub">{c.subtitle}</p>}
          </div>

          <div className="fg-card__prog-row">
            <span>{pct}% sold</span>
            <span>{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
          </div>
          <div className="fg-card__track">
            <motion.div
              className="fg-card__fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 + 0.3 }}
            />
          </div>

          <div className="fg-card__foot">
            <div>
              <span className="fg-card__from">from </span>
              <span className="fg-card__price">{formatCurrency(c.ticketPrice)}</span>
              <span className="fg-card__per"> /entry</span>
            </div>
            <motion.span
              className="fg-card__cta"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Enter Now →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturedGrid({ competitions }: { competitions: Comp[] }) {
  const [main, ...others] = competitions

  return (
    <section className="fg">
      <div className="fg__inner">
        <div className="fg__head">
          <p className="fg__label">
            <span className="fg__live-dot" />
            Featured Competitions
          </p>
          <Link href="/competitions" className="fg__see-all">View all →</Link>
        </div>

        <div className="fg__grid">
          {/* Large featured card */}
          {main && <FeaturedCard c={main} large index={0} />}

          {/* Stacked smaller cards */}
          <div className="fg__stack">
            {others.slice(0, 2).map((c, i) => (
              <FeaturedCard key={c.id} c={c} index={i + 1} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .fg { background: var(--off); padding: 0 0 clamp(3rem,5vw,5rem); border-bottom: 1px solid var(--border); }
        .fg__inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem); }
        .fg__head { display: flex; align-items: center; justify-content: space-between; padding: clamp(2rem,3vw,3rem) 0 1.5rem; }
        .fg__label { display: flex; align-items: center; gap: .75rem; font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--ink2); }
        .fg__live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rg); animation: live-pulse 2s infinite; flex-shrink: 0; }
        @keyframes live-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(31,122,224,.5); } 50% { box-shadow: 0 0 0 6px rgba(31,122,224,0); } }
        .fg__see-all { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); text-decoration: none; transition: color .2s; }
        .fg__see-all:hover { color: var(--rg); }

        /* Two-column masonry layout */
        .fg__grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 1.5rem; align-items: stretch; }
        .fg__stack { display: flex; flex-direction: column; gap: 1.5rem; }
        @media (max-width: 860px) { .fg__grid { grid-template-columns: 1fr; } }

        /* Card base */
        .fg-card { background: #fff; border: 1px solid var(--border); overflow: hidden; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s, border-color .3s; display: flex; flex-direction: column; }
        .fg-card:hover { transform: translateY(-4px); box-shadow: 0 24px 64px rgba(0,0,0,.12); border-color: var(--rg); }
        .fg-card__link { display: flex; flex-direction: column; text-decoration: none; height: 100%; }

        /* Image */
        .fg-card__img-wrap { position: relative; overflow: hidden; background: var(--ink); flex-shrink: 0; }
        .fg-card--large .fg-card__img-wrap { aspect-ratio: 4/3; }
        .fg-card:not(.fg-card--large) .fg-card__img-wrap { aspect-ratio: 16/9; }
        @media (max-width: 860px) {
          .fg-card--large .fg-card__img-wrap { aspect-ratio: 16/9; }
        }
        .fg-card__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .fg-card__placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,#1a1510,#120f0a); }
        .fg-card__scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,0) 55%); }

        /* Prize overlay */
        .fg-card__prize { position: absolute; bottom: 1rem; left: 1.125rem; right: 1.125rem; display: flex; align-items: flex-end; justify-content: space-between; z-index: 2; }
        .fg-card__prize-label { font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .fg-card--large .fg-card__prize-val { font-size: 3rem; }
        .fg-card__prize-val { font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 500; color: #fff; line-height: 1; }

        /* Timer */
        .fg-card__timer { background: var(--ink); flex-shrink: 0; }

        /* Body */
        .fg-card__body { padding: 1.125rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: .75rem; flex: 1; }
        .fg-card__title { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: var(--ink); line-height: 1.15; }
        .fg-card--large .fg-card__title { font-size: 1.625rem; }
        .fg-card__sub { font-size: .75rem; color: var(--ink3); line-height: 1.5; margin-top: .2rem; }
        .fg-card__prog-row { display: flex; justify-content: space-between; font-size: .5625rem; color: var(--ink3); }
        .fg-card__track { height: 3px; background: var(--border); overflow: hidden; border-radius: 2px; }
        .fg-card__fill { height: 100%; background: var(--rg); border-radius: 2px; }
        .fg-card__foot { display: flex; align-items: center; justify-content: space-between; padding-top: .75rem; border-top: 1px solid var(--border); margin-top: auto; }
        .fg-card__from { font-size: .5rem; letter-spacing: .08em; text-transform: uppercase; color: var(--ink3); }
        .fg-card__price { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: var(--ink); }
        .fg-card__per { font-size: .5rem; color: var(--ink3); }
        .fg-card__cta { font-size: .5875rem; letter-spacing: .1em; text-transform: uppercase; font-weight: 600; color: var(--gold); display: inline-block; }
      `}</style>
    </section>
  )
}
