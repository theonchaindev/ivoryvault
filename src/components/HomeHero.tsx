'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface HeroComp {
  slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number
  heroImg: string | null; drawDate?: string | null
}

const ease = [0.22, 1, 0.36, 1] as const
const INTERVAL = 5500

export default function HomeHero({ comps }: { comps: HeroComp[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(comps.length, 1)), [comps.length])
  useEffect(() => {
    if (paused || comps.length <= 1) return
    const t = setTimeout(next, INTERVAL)
    return () => clearTimeout(t)
  }, [idx, paused, next, comps.length])

  const c = comps[idx]
  const pct = c ? Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100)) : 0

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-bleed BG crossfade */}
      <AnimatePresence mode="sync">
        {c?.heroImg && (
          <motion.img
            key={`bg-${idx}`}
            src={c.heroImg}
            alt=""
            className="hero__bg"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: .28, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        )}
      </AnimatePresence>
      <div className="hero__scrim" />

      {/* Trust strip */}
      <motion.div
        className="hero__trust"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.9 }}
      >
        {['UK Regulated', 'Free Entry Available', 'Live Draws', '18+ Only'].map((t, i) => (
          <span key={t} style={{ display: 'contents' }}>
            {i > 0 && <span className="hero__trust-sep">·</span>}
            <span>{t}</span>
          </span>
        ))}
      </motion.div>

      <div className="hero__layout">
        {/* ── LEFT: editorial headline ── */}
        <div className="hero__left">
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
          >
            Ivory Vault · Luxury Competitions
          </motion.p>

          <motion.h1
            className="hero__headline"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
          >
            Win The<br />
            <em>Extra&shy;ordinary</em>
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.45 }}
          >
            Premium prize competitions from as little as £1.<br />
            Transparent draws. Life-changing prizes.
          </motion.p>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.6 }}
          >
            {[['10,000+', 'Members'], ['£500k+', 'In Prizes'], ['100%', 'Transparent']].map(([v, l]) => (
              <div key={l} className="hero__stat">
                <span className="hero__stat-v">{v}</span>
                <span className="hero__stat-l">{l}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.75 }}
          >
            <Link href="/competitions" className="hero__cta-primary">
              Browse Competitions
            </Link>
            <Link href="/how-it-works" className="hero__cta-ghost">How it works →</Link>
          </motion.div>

          {comps.length > 1 && (
            <motion.div
              className="hero__dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {comps.map((_, i) => (
                <button
                  key={i}
                  className={`hero__dot${i === idx ? ' active' : ''}`}
                  onClick={() => { setIdx(i); setPaused(true) }}
                  aria-label={`Competition ${i + 1}`}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: featured competition card ── */}
        {c && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${idx}`}
              className="hero__card"
              initial={{ opacity: 0, x: 40, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -24, scale: 0.97 }}
              transition={{ duration: 0.65, ease }}
            >
              {/* Image */}
              <div className="hero__card-img">
                {c.heroImg
                  ? <img src={c.heroImg} alt={c.title} className="hero__card-photo" />
                  : <div className="hero__card-fallback" />
                }
                <div className="hero__card-img-grad" />
                <div className="hero__card-live">Featured</div>
                <div className="hero__card-prize-wrap">
                  <span className="hero__card-prize-label">Prize</span>
                  <span className="hero__card-prize-val">{formatCurrency(c.prizeValue)}</span>
                </div>
              </div>

              {/* Timer */}
              {c.drawDate && (
                <div className="hero__card-timer">
                  <CountdownTimer drawDate={c.drawDate} variant="strip" />
                </div>
              )}

              {/* Body */}
              <div className="hero__card-body">
                <p className="hero__card-title">{c.title}</p>
                {c.subtitle && <p className="hero__card-sub">{c.subtitle}</p>}

                <div className="hero__card-prog-row">
                  <span>{pct}% sold</span>
                  <span>{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
                </div>
                <div className="hero__card-track">
                  <motion.div
                    className="hero__card-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease, delay: 0.2 }}
                  />
                </div>

                <Link href={`/competitions/${c.slug}`} className="hero__card-cta">
                  Enter from {formatCurrency(c.ticketPrice)} →
                </Link>
              </div>

              {/* Auto-advance bar */}
              {comps.length > 1 && !paused && (
                <motion.div
                  key={`bar-${idx}`}
                  className="hero__card-bar"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .hero {
          position: relative; min-height: 100svh;
          background: var(--ink);
          overflow: hidden; display: flex; flex-direction: column;
        }
        .hero__bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center 30%;
        }
        .hero__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(125deg,
            rgba(12,11,10,.97) 0%,
            rgba(12,11,10,.88) 38%,
            rgba(12,11,10,.6) 65%,
            rgba(12,11,10,.35) 100%);
        }

        /* Trust */
        .hero__trust {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
          padding: 1.25rem clamp(1.5rem,4vw,4rem) 0;
          margin-top: 72px;
          font-size: .5rem; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,.3);
        }
        .hero__trust-sep { color: rgba(255,255,255,.15); }

        /* Layout */
        .hero__layout {
          position: relative; z-index: 2; flex: 1;
          display: grid; grid-template-columns: 1fr 400px;
          gap: clamp(2rem,4vw,5rem); align-items: center;
          max-width: 1440px; width: 100%; margin: 0 auto;
          padding: clamp(2.5rem,5vw,5rem) clamp(1.5rem,4vw,4rem);
        }

        /* Left */
        .hero__left { display: flex; flex-direction: column; gap: 2rem; }
        .hero__eyebrow {
          font-size: .5rem; letter-spacing: .25em; text-transform: uppercase;
          color: var(--rg); display: flex; align-items: center; gap: .75rem;
        }
        .hero__eyebrow::before { content: ''; display: block; width: 28px; height: 1px; background: var(--rg); }
        .hero__headline {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(4rem,8vw,7.5rem);
          font-weight: 300; line-height: .92;
          letter-spacing: -.025em; color: #fff;
        }
        .hero__headline em { font-style: italic; color: #f5e8a0; }
        .hero__sub {
          font-size: clamp(.875rem,1.4vw,1.0625rem);
          line-height: 1.7; color: rgba(255,255,255,.55);
          max-width: 420px;
        }
        .hero__stats {
          display: flex; width: fit-content;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(10px);
        }
        .hero__stat {
          padding: 1rem 1.75rem;
          border-right: 1px solid rgba(255,255,255,.08);
        }
        .hero__stat:last-child { border-right: none; }
        .hero__stat-v { display: block; font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 400; color: #fff; line-height: 1; }
        .hero__stat-l { display: block; font-size: .45rem; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.38); margin-top: .2rem; }
        .hero__ctas { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .hero__cta-primary {
          background: var(--rg); color: #fff;
          font-size: .6875rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: 1.0625rem 2.25rem; text-decoration: none;
          transition: background .2s, transform .15s; display: inline-block;
        }
        .hero__cta-primary:hover { background: var(--rg-dark); transform: translateY(-2px); }
        .hero__cta-ghost {
          font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.55); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.2); padding-bottom: 2px;
          transition: color .2s, border-color .2s;
        }
        .hero__cta-ghost:hover { color: #fff; border-color: rgba(255,255,255,.55); }
        .hero__dots { display: flex; align-items: center; gap: .5rem; margin-top: -.5rem; }
        .hero__dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,.18); border: none; cursor: pointer; padding: 0;
          transition: background .25s, transform .25s;
        }
        .hero__dot.active { background: var(--rg); transform: scale(1.4); }

        /* Right: competition card */
        .hero__card {
          background: #fff; position: relative; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04);
        }
        .hero__card-img { position: relative; aspect-ratio: 1/1; overflow: hidden; }
        .hero__card-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero__card-fallback { width: 100%; height: 100%; background: linear-gradient(145deg,#1a1510,#0e0c0a); }
        .hero__card-img-grad {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,0) 55%);
        }
        .hero__card-live {
          position: absolute; top: .875rem; right: .875rem;
          background: var(--rg); color: #fff;
          font-size: .45rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .3rem .625rem;
        }
        .hero__card-prize-wrap {
          position: absolute; bottom: .875rem; left: 1rem; right: 1rem;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .hero__card-prize-label { font-size: .45rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .hero__card-prize-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 500; color: #fff; line-height: 1; }
        .hero__card-timer { background: var(--ink); }
        .hero__card-body { padding: 1.125rem 1.25rem 1.375rem; }
        .hero__card-title { font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500; color: var(--ink); margin-bottom: .2rem; line-height: 1.2; }
        .hero__card-sub { font-size: .75rem; color: var(--ink3); margin-bottom: .75rem; }
        .hero__card-prog-row { display: flex; justify-content: space-between; font-size: .5rem; color: var(--ink3); margin-bottom: .3rem; letter-spacing: .04em; }
        .hero__card-track { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 1rem; }
        .hero__card-fill { height: 100%; background: var(--rg); border-radius: 2px; }
        .hero__card-cta {
          display: block; text-align: center;
          background: var(--ink); color: #fff;
          font-size: .625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .875rem; text-decoration: none; transition: background .2s;
        }
        .hero__card-cta:hover { background: var(--rg); }
        .hero__card-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--rg); z-index: 4; }

        /* Responsive */
        @media (max-width: 1100px) { .hero__layout { grid-template-columns: 1fr 360px; } }
        @media (max-width: 820px) {
          .hero__layout { grid-template-columns: 1fr; gap: 2.5rem; padding: 2rem 1.5rem 3rem; }
          .hero__card { max-width: 400px; }
        }
        @media (max-width: 480px) {
          .hero__headline { font-size: clamp(3.25rem,14vw,5rem); }
          .hero__card { max-width: 100%; }
          .hero__stats { width: 100%; }
          .hero__stat { flex: 1; padding: .875rem .75rem; }
        }
      `}</style>
    </section>
  )
}
