'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface HeroComp {
  slug: string
  title: string
  subtitle?: string | null
  prizeValue: number
  ticketPrice: number
  maxTickets: number
  ticketsSold: number
  heroImg: string | null
  drawDate?: string | null
}

const INTERVAL = 5000
const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ comps }: { comps: HeroComp[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(comps.length, 1)), [comps.length])

  useEffect(() => {
    if (paused || comps.length <= 1) return
    const t = setTimeout(next, INTERVAL)
    return () => clearTimeout(t)
  }, [idx, paused, next, comps.length])

  if (!comps.length) return null

  const c = comps[idx]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image crossfade */}
      <AnimatePresence mode="sync">
        {c.heroImg && (
          <motion.img
            key={`bg-${idx}`}
            src={c.heroImg}
            alt=""
            className="hero-carousel__bg"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
      <div className="hero-carousel__scrim" />

      {/* Content */}
      <div className="hero-carousel__inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="hero-carousel__content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="hero-carousel__badge">
              <span className="hero-carousel__badge-dot" />
              Live Competition
            </div>

            <h2 className="hero-carousel__title">{c.title}</h2>
            {c.subtitle && <p className="hero-carousel__sub">{c.subtitle}</p>}

            <div className="hero-carousel__prize">
              <span className="hero-carousel__prize-label">Prize Value</span>
              <span className="hero-carousel__prize-val">{formatCurrency(c.prizeValue)}</span>
            </div>

            {/* Countdown */}
            {c.drawDate && (
              <div className="hero-carousel__timer">
                <CountdownTimer drawDate={c.drawDate} variant="hero" />
              </div>
            )}

            {/* Progress */}
            <div className="hero-carousel__progress">
              <div className="hero-carousel__track">
                <motion.div
                  className="hero-carousel__fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease, delay: 0.2 }}
                />
              </div>
              <span className="hero-carousel__sold">{pct}% sold — {(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
            </div>

            <div className="hero-carousel__actions">
              <Link href={`/competitions/${c.slug}`} className="hero-carousel__enter">
                Enter Now — from {formatCurrency(c.ticketPrice)}
              </Link>
              <Link href="/competitions" className="hero-carousel__view-all">
                View all competitions →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot nav + auto-advance bar */}
        <div className="hero-carousel__nav">
          {comps.map((_, i) => (
            <button
              key={i}
              className={`hero-carousel__dot${i === idx ? ' active' : ''}`}
              onClick={() => { setIdx(i); setPaused(true) }}
              aria-label={`Competition ${i + 1}`}
            />
          ))}
        </div>

        {/* Auto-advance progress bar */}
        {comps.length > 1 && !paused && (
          <motion.div
            key={`bar-${idx}`}
            className="hero-carousel__bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          />
        )}
      </div>

      <style>{`
        .hero-carousel {
          position: relative; width: 100%;
          height: clamp(420px, 60vh, 620px);
          overflow: hidden; background: var(--ink);
          display: flex; align-items: flex-end;
        }
        .hero-carousel__bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
        }
        .hero-carousel__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(24,20,15,.95) 0%,
            rgba(24,20,15,.7) 40%,
            rgba(24,20,15,.25) 75%,
            rgba(24,20,15,.1) 100%
          );
        }
        .hero-carousel__inner {
          position: relative; z-index: 2; width: 100%;
          max-width: 1440px; margin: 0 auto;
          padding: 0 clamp(1.5rem,4vw,4rem) clamp(2rem,4vw,3.5rem);
        }
        .hero-carousel__content { max-width: 640px; }
        .hero-carousel__badge {
          display: inline-flex; align-items: center; gap: .5rem;
          background: rgba(201,168,76,.15); border: 1px solid rgba(201,168,76,.35);
          border-radius: 999px; padding: .3rem .875rem;
          font-size: .5rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--gold); font-weight: 600; margin-bottom: 1rem;
        }
        .hero-carousel__badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
          animation: pulse-dot 1.8s infinite;
        }
        .hero-carousel__title {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2rem,5vw,3.75rem);
          font-weight: 400; line-height: 1; letter-spacing: -.02em;
          color: #fff; margin-bottom: .5rem;
        }
        .hero-carousel__sub { font-size: .875rem; color: rgba(255,255,255,.6); margin-bottom: 1rem; line-height: 1.5; }
        .hero-carousel__prize { margin-bottom: 1.25rem; }
        .hero-carousel__prize-label { display: block; font-size: .5rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: .25rem; }
        .hero-carousel__prize-val {
          font-family: var(--font-cormorant,serif); font-size: clamp(2rem,4vw,3rem);
          font-weight: 600; color: var(--gold); line-height: 1;
        }
        .hero-carousel__timer { margin-bottom: 1.25rem; }
        .hero-carousel__progress { margin-bottom: 1.5rem; }
        .hero-carousel__track { height: 4px; background: rgba(255,255,255,.15); border-radius: 999px; overflow: hidden; margin-bottom: .5rem; }
        .hero-carousel__fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .hero-carousel__sold { font-size: .5625rem; color: rgba(255,255,255,.45); letter-spacing: .06em; }
        .hero-carousel__actions { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .hero-carousel__enter {
          background: var(--gold); color: #fff;
          font-size: .6875rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          padding: .9375rem 2rem; border-radius: var(--r-btn); text-decoration: none;
          transition: background .2s, transform .15s; white-space: nowrap;
        }
        .hero-carousel__enter:hover { background: var(--gold-d); transform: translateY(-1px); }
        .hero-carousel__view-all {
          font-size: .625rem; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.5); text-decoration: none; transition: color .2s; white-space: nowrap;
        }
        .hero-carousel__view-all:hover { color: #fff; }
        .hero-carousel__nav { display: flex; align-items: center; gap: .5rem; }
        .hero-carousel__dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,.25); border: none; cursor: pointer; padding: 0;
          transition: background .25s, transform .25s;
        }
        .hero-carousel__dot.active { background: var(--gold); transform: scale(1.3); }
        .hero-carousel__bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--gold); z-index: 3;
        }
      `}</style>
    </section>
  )
}
