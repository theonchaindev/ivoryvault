'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ count }: { count: number }) {
  return (
    <section className="mh">
      <div className="mh__inner">
        <motion.div
          className="mh__left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <p className="mh__eyebrow">
            <span className="mh__eyebrow-dot" />
            Live Now · {count} Active Competition{count !== 1 ? 's' : ''}
          </p>
          <h1 className="mh__headline">
            Win The <em>Extra&shy;ordinary</em>
          </h1>
        </motion.div>

        <motion.div
          className="mh__right"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
        >
          <p className="mh__sub">Premium UK competitions from £1. Live draws. Real prizes.</p>
          <div className="mh__ctas">
            <Link href="/competitions" className="mh__cta-primary">Browse All Competitions</Link>
            <Link href="/how-it-works" className="mh__cta-ghost">How It Works →</Link>
          </div>
        </motion.div>
      </div>

      {/* Scrolling trust ticker */}
      <div className="mh__ticker-wrap">
        <div className="mh__ticker">
          {['UK Regulated', 'Free Entry Available', 'Live Recorded Draws', '18+ Only', 'Instant Win Confirmation', 'Stripe Secure Payments', 'Prizes Dispatched 48hrs', 'Fully Transparent'].map((t, i) => (
            <span key={i} className="mh__ticker-item">
              <span className="mh__ticker-dot" />
              {t}
            </span>
          ))}
          {/* duplicate for seamless loop */}
          {['UK Regulated', 'Free Entry Available', 'Live Recorded Draws', '18+ Only', 'Instant Win Confirmation', 'Stripe Secure Payments', 'Prizes Dispatched 48hrs', 'Fully Transparent'].map((t, i) => (
            <span key={`b${i}`} className="mh__ticker-item" aria-hidden>
              <span className="mh__ticker-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .mh {
          background: var(--ink);
          padding-top: 72px;
          overflow: hidden;
        }
        .mh__inner {
          max-width: 1440px; margin: 0 auto;
          padding: clamp(2.5rem,4vw,3.5rem) clamp(1.5rem,4vw,5rem);
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2rem; align-items: end;
        }
        @media (max-width: 700px) { .mh__inner { grid-template-columns: 1fr; gap: 1.25rem; } }
        .mh__eyebrow {
          display: flex; align-items: center; gap: .625rem;
          font-size: .5rem; letter-spacing: .22em; text-transform: uppercase;
          color: var(--rg); margin-bottom: 1rem;
        }
        .mh__eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg); animation: pulse 2s infinite; flex-shrink: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .mh__headline {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(3rem,6vw,5.5rem);
          font-weight: 300; line-height: .95;
          letter-spacing: -.025em; color: #fff;
          margin: 0;
        }
        .mh__headline em { font-style: italic; color: #f5e8a0; }
        .mh__right { display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; justify-content: flex-end; }
        .mh__sub { font-size: clamp(.875rem,1.3vw,1rem); line-height: 1.65; color: rgba(255,255,255,.5); max-width: 380px; }
        .mh__ctas { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .mh__cta-primary {
          background: var(--rg); color: #fff;
          font-size: .6875rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .9375rem 2rem; text-decoration: none;
          transition: background .2s, transform .15s; display: inline-block;
          white-space: nowrap;
        }
        .mh__cta-primary:hover { background: var(--rg-dark); transform: translateY(-1px); }
        .mh__cta-ghost {
          font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.5); text-decoration: none;
          transition: color .2s; white-space: nowrap;
        }
        .mh__cta-ghost:hover { color: #fff; }

        /* Ticker */
        .mh__ticker-wrap {
          border-top: 1px solid rgba(255,255,255,.07);
          overflow: hidden; padding: .75rem 0;
          background: rgba(255,255,255,.03);
        }
        .mh__ticker {
          display: flex; gap: 0;
          animation: ticker 28s linear infinite;
          width: max-content;
        }
        .mh__ticker:hover { animation-play-state: paused; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .mh__ticker-item {
          display: flex; align-items: center; gap: .625rem;
          font-size: .5rem; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.3); padding: 0 2.5rem; white-space: nowrap;
        }
        .mh__ticker-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--rg); flex-shrink: 0; }
      `}</style>
    </section>
  )
}
