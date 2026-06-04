'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ count }: { count: number }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner__inner">
        <motion.div
          className="hero-banner__left"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
        >
          <div className="hero-banner__live">
            <span className="hero-banner__dot" />
            {count} Live Competition{count !== 1 ? 's' : ''}
          </div>
          <h1 className="hero-banner__title">
            Win The <em>Extraordinary</em>
          </h1>
          <p className="hero-banner__sub">
            UK&apos;s most exciting prize competitions. Tickets from just £1.
          </p>
        </motion.div>

        <motion.div
          className="hero-banner__right"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.2 }}
        >
          <div className="hero-banner__trust">
            {['UK Regulated', 'Free Entry', 'Live Draws', '18+ Only'].map((t, i) => (
              <span key={t} className="hero-banner__trust-item">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <circle cx="5" cy="5" r="4" stroke="var(--rg)" strokeWidth="1.2"/>
                  <path d="M3 5l1.5 1.5L7 3.5" stroke="var(--rg)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t}
              </span>
            ))}
          </div>
          <div className="hero-banner__ctas">
            <Link href="/competitions" className="hero-banner__cta">Browse Competitions</Link>
            <Link href="/how-it-works" className="hero-banner__ghost">How it works →</Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        .hero-banner {
          background: #fff;
          border-bottom: 1px solid var(--border);
          padding-top: 68px;
        }
        .hero-banner__inner {
          max-width: 1440px; margin: 0 auto;
          padding: clamp(2rem,3.5vw,3rem) clamp(1.5rem,3vw,3rem);
          display: grid; grid-template-columns: 1fr auto;
          gap: 3rem; align-items: center;
        }
        @media (max-width: 700px) { .hero-banner__inner { grid-template-columns: 1fr; gap: 1.5rem; } }
        .hero-banner__live {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .5rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--rg); margin-bottom: .875rem;
        }
        .hero-banner__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg); animation: blink 1.8s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .hero-banner__title {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2.25rem,5vw,4rem);
          font-weight: 300; line-height: .95; letter-spacing: -.025em;
          color: var(--ink); margin-bottom: .625rem;
        }
        .hero-banner__title em { font-style: italic; color: var(--rg); }
        .hero-banner__sub { font-size: clamp(.875rem,1.2vw,.9375rem); color: var(--ink3); line-height: 1.6; }
        .hero-banner__right { display: flex; flex-direction: column; gap: 1.25rem; align-items: flex-end; }
        @media (max-width: 700px) { .hero-banner__right { align-items: flex-start; } }
        .hero-banner__trust { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: flex-end; }
        @media (max-width: 700px) { .hero-banner__trust { justify-content: flex-start; } }
        .hero-banner__trust-item { display: flex; align-items: center; gap: .375rem; font-size: .625rem; letter-spacing: .06em; color: var(--ink2); white-space: nowrap; }
        .hero-banner__ctas { display: flex; align-items: center; gap: 1.25rem; }
        .hero-banner__cta { background: var(--rg); color: #fff; font-size: .625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: .875rem 1.75rem; text-decoration: none; transition: background .2s, transform .15s; white-space: nowrap; }
        .hero-banner__cta:hover { background: var(--rg-dark); transform: translateY(-1px); }
        .hero-banner__ghost { font-size: .6875rem; letter-spacing: .08em; color: var(--ink3); text-decoration: none; white-space: nowrap; transition: color .2s; }
        .hero-banner__ghost:hover { color: var(--rg); }
      `}</style>
    </section>
  )
}
