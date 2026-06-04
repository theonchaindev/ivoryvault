'use client'

import Link from 'next/link'
import Image from 'next/image'
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

interface Props { comps: HeroComp[] }

const ease = [0.22, 1, 0.36, 1] as const
const INTERVAL = 5000

export default function HomeHero({ comps }: Props) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(comps.length, 1)), [comps.length])

  useEffect(() => {
    if (paused || comps.length <= 1) return
    const t = setTimeout(() => next(), INTERVAL)
    return () => clearTimeout(t)
  }, [idx, paused, next, comps.length])

  const c = comps[idx]
  const pct = c ? Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100)) : 0

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Full-bleed background image crossfade */}
      <AnimatePresence mode="sync">
        {c?.heroImg && (
          <motion.img
            key={`bg-${idx}`}
            src={c.heroImg}
            alt=""
            className="hero__bg"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: .35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
          />
        )}
      </AnimatePresence>
      <div className="hero__scrim" />

      {/* Trust bar */}
      <div className="hero__trust">
        {['UK Regulated', 'Free Entry Route', 'Live Recorded Draws', '18+ Only'].map((t, i) => (
          <span key={t} style={{ display: 'contents' }}>
            {i > 0 && <span className="hero__trust-dot" />}
            <span>{t}</span>
          </span>
        ))}
      </div>

      <div className="hero__inner">
        {/* Left: editorial text + stats */}
        <div className="hero__left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />
              <span>Live Competitions</span>
              <span className="hero__eyebrow-dot" />
            </div>
            <h1 className="hero__headline">
              Win The<br />
              <em>Extraordinary</em>
            </h1>
            <p className="hero__strapline">
              Premium prize competitions. Transparent draws.<br />Life-changing prizes from as little as £1.
            </p>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            {[
              { v: '10,000+', l: 'Members' },
              { v: '£500k+', l: 'Awarded' },
              { v: '100%', l: 'Transparent' },
            ].map(s => (
              <div key={s.l} className="hero__stat">
                <span className="hero__stat-v">{s.v}</span>
                <span className="hero__stat-l">{s.l}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
          >
            <Link href="/competitions" className="hero__btn-primary">Browse All Competitions</Link>
            <Link href="/how-it-works" className="hero__btn-ghost">How It Works →</Link>
          </motion.div>

          {/* Dot navigation */}
          {comps.length > 1 && (
            <motion.div
              className="hero__dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
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

        {/* Right: featured competition card */}
        {c && (
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className="hero__card"
              initial={{ opacity: 0, x: 32, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.65, ease }}
            >
              {/* Card image */}
              <div className="hero__card-img-wrap">
                {c.heroImg ? (
                  <img src={c.heroImg} alt={c.title} className="hero__card-img" />
                ) : (
                  <div className="hero__card-placeholder" />
                )}
                <div className="hero__card-gradient" />
                <div className="hero__card-prize">
                  <span className="hero__card-prize-label">Prize Value</span>
                  <span className="hero__card-prize-val">{formatCurrency(c.prizeValue)}</span>
                </div>
                <div className="hero__card-tag">Featured</div>
              </div>

              {/* Timer strip */}
              {c.drawDate && (
                <div className="hero__card-timer">
                  <CountdownTimer drawDate={c.drawDate} variant="strip" />
                </div>
              )}

              {/* Card footer */}
              <div className="hero__card-body">
                <p className="hero__card-title">{c.title}</p>
                {c.subtitle && <p className="hero__card-sub">{c.subtitle}</p>}

                <div className="hero__card-progress-row">
                  <span>{pct}% sold</span>
                  <span>{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
                </div>
                <div className="hero__card-track">
                  <motion.div
                    className="hero__card-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease, delay: 0.3 }}
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
          background: #0d0c0b;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .hero__bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center 30%;
        }
        .hero__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(120deg,
            rgba(10,9,8,.95) 0%,
            rgba(10,9,8,.8) 40%,
            rgba(10,9,8,.45) 70%,
            rgba(10,9,8,.25) 100%);
        }

        /* Trust bar */
        .hero__trust {
          position: relative; z-index: 2;
          padding: 1.25rem 3rem 0;
          display: flex; align-items: center; gap: .75rem;
          font-size: .5rem; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,.35);
          margin-top: 72px;
        }
        .hero__trust-dot { width: 2.5px; height: 2.5px; border-radius: 50%; background: rgba(255,255,255,.2); flex-shrink: 0; }

        /* Inner layout */
        .hero__inner {
          position: relative; z-index: 2; flex: 1;
          max-width: 1440px; margin: 0 auto; width: 100%;
          padding: 3rem 3rem 4rem;
          display: grid; grid-template-columns: 1fr 420px;
          gap: 4rem; align-items: center;
        }

        /* Left column */
        .hero__left { display: flex; flex-direction: column; gap: 2rem; }
        .hero__eyebrow {
          display: flex; align-items: center; gap: .625rem; margin-bottom: -.5rem;
          font-size: .5rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--rg);
        }
        .hero__eyebrow-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--rg); }
        .hero__headline {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(3.5rem, 7vw, 6.5rem);
          font-weight: 300; line-height: .95;
          letter-spacing: -.02em; color: #fff;
        }
        .hero__headline em { font-style: italic; color: #f5e5a8; }
        .hero__strapline {
          font-size: clamp(.875rem, 1.4vw, 1.0625rem);
          line-height: 1.7; color: rgba(255,255,255,.6);
          max-width: 460px;
        }
        .hero__stats { display: flex; gap: 0; width: fit-content; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); backdrop-filter: blur(8px); }
        .hero__stat { padding: 1rem 1.75rem; border-right: 1px solid rgba(255,255,255,.08); }
        .hero__stat:last-child { border-right: none; }
        .hero__stat-v { display: block; font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 400; color: #fff; line-height: 1; }
        .hero__stat-l { display: block; font-size: .5rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.4); margin-top: .2rem; }
        .hero__ctas { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .hero__btn-primary {
          background: var(--rg); color: #fff;
          font-size: .6875rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
          padding: 1rem 2.25rem; text-decoration: none;
          transition: background .2s, transform .15s;
          display: inline-block;
        }
        .hero__btn-primary:hover { background: var(--rg-dark); transform: translateY(-1px); }
        .hero__btn-ghost {
          font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.65); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.25); padding-bottom: 2px;
          transition: color .2s, border-color .2s;
        }
        .hero__btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,.6); }
        .hero__dots { display: flex; align-items: center; gap: .5rem; margin-top: -.5rem; }
        .hero__dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,.2); border: none; cursor: pointer; padding: 0;
          transition: background .25s, transform .25s;
        }
        .hero__dot.active { background: var(--rg); transform: scale(1.3); }

        /* Right: featured card */
        .hero__card {
          background: #fff;
          box-shadow: 0 32px 80px rgba(0,0,0,.5);
          position: relative; overflow: hidden;
        }
        .hero__card-img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; }
        .hero__card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero__card-placeholder { width: 100%; aspect-ratio: 1/1; background: linear-gradient(145deg, #1a1510, #120f0a); }
        .hero__card-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,0) 50%);
        }
        .hero__card-prize {
          position: absolute; bottom: 1rem; left: 1rem; right: 1rem;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .hero__card-prize-label { font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .hero__card-prize-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 500; color: #fff; line-height: 1; }
        .hero__card-tag {
          position: absolute; top: .875rem; right: .875rem;
          background: var(--rg); color: #fff;
          font-size: .45rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .275rem .625rem;
        }
        .hero__card-timer { background: var(--ink); }
        .hero__card-body { padding: 1.125rem 1.25rem 1.375rem; }
        .hero__card-title { font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500; color: var(--ink); margin-bottom: .2rem; }
        .hero__card-sub { font-size: .75rem; color: var(--ink3); margin-bottom: .75rem; }
        .hero__card-progress-row { display: flex; justify-content: space-between; font-size: .5rem; color: var(--ink3); margin-bottom: .3rem; letter-spacing: .04em; }
        .hero__card-track { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 1rem; }
        .hero__card-fill { height: 100%; background: var(--rg); border-radius: 2px; }
        .hero__card-cta {
          display: block; text-align: center;
          background: var(--ink); color: #fff;
          font-size: .625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .875rem; text-decoration: none;
          transition: background .2s;
        }
        .hero__card-cta:hover { background: var(--rg); }
        .hero__card-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--rg); z-index: 4;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .hero__inner { grid-template-columns: 1fr 360px; gap: 2.5rem; }
        }
        @media (max-width: 860px) {
          .hero__inner {
            grid-template-columns: 1fr; gap: 2.5rem; padding: 2rem 1.5rem 3rem;
            align-items: flex-start;
          }
          .hero__card { max-width: 380px; }
          .hero__trust { padding: 1rem 1.5rem 0; }
        }
        @media (max-width: 500px) {
          .hero__headline { font-size: clamp(3rem, 11vw, 4rem); }
          .hero__card { max-width: 100%; }
          .hero__stats { width: 100%; }
          .hero__stat { flex: 1; padding: .875rem 1rem; }
        }
      `}</style>
    </section>
  )
}
