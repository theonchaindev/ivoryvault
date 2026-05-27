'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'

interface HeroComp {
  slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number; heroImg: string | null
}

interface Props { comps: HeroComp[] }

const ease = [0.22, 1, 0.36, 1] as const
const INTERVAL = 5500

const slideVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export default function HomeHero({ comps }: Props) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(comps.length, 1)), [comps.length])
  const go = (i: number) => { setIdx(i); setPaused(true) }

  useEffect(() => {
    if (paused || comps.length <= 1) return
    const t = setTimeout(() => { next(); setPaused(false) }, INTERVAL)
    return () => clearTimeout(t)
  }, [idx, paused, next, comps.length])

  if (comps.length === 0) {
    return (
      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <h1 className="hero__title hero__title--large">Win The<br /><em>Extraordinary</em></h1>
          <p className="hero__subtitle">Premium prize competitions. Transparent draws. Life-changing prizes.</p>
          <div className="hero__ctas">
            <Link href="/competitions" className="btn-rg hero__cta-primary">Browse Competitions →</Link>
          </div>
        </div>
        <HeroStyles />
      </section>
    )
  }

  const c = comps[idx]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Background images — crossfade */}
      <AnimatePresence mode="sync">
        {c.heroImg ? (
          <motion.img
            key={`bg-${idx}`}
            src={c.heroImg}
            alt=""
            className="hero__bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: .45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
        ) : (
          <motion.div
            key={`bg-fallback-${idx}`}
            className="hero__bg-fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
        )}
      </AnimatePresence>
      <div className="hero__overlay" />

      {/* Trust bar */}
      <motion.div
        className="hero__trust"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.8 }}
      >
        {['UK Regulated', 'Free Entry Available', 'Draws Recorded Live', '18+ Only'].map((t, i) => (
          <span key={t} style={{ display: 'contents' }}>
            {i > 0 && <span className="hero__dot" />}
            <span>{t}</span>
          </span>
        ))}
      </motion.div>

      {/* Slide content */}
      <div className="hero__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease }}
          >
            {/* Tags */}
            <div className="hero__eyebrow">
              <span className="hero__tag">Featured Competition</span>
              <span className="hero__tag hero__tag--rg">Live Now</span>
            </div>

            <h1 className="hero__title">{c.title}</h1>
            {c.subtitle && <p className="hero__subtitle">{c.subtitle}</p>}

            {/* Stats */}
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-val">{formatCurrency(c.prizeValue)}</span>
                <span className="hero__stat-label">Prize Value</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-val">{formatCurrency(c.ticketPrice)}</span>
                <span className="hero__stat-label">Per Ticket</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-val">{(c.maxTickets - c.ticketsSold).toLocaleString()}</span>
                <span className="hero__stat-label">Remaining</span>
              </div>
            </div>

            {/* Progress */}
            <div className="hero__progress-wrap">
              <div className="hero__progress-track">
                <motion.div
                  className="hero__progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease, delay: 0.15 }}
                />
              </div>
              <span className="hero__progress-pct">{pct}% sold</span>
            </div>

            {/* CTAs */}
            <div className="hero__ctas">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`/competitions/${c.slug}`} className="btn-rg hero__cta-primary">
                  Enter This Competition →
                </Link>
              </motion.div>
              <Link href="/competitions" className="hero__cta-ghost">View All Competitions</Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        {comps.length > 1 && (
          <div className="hero__dots">
            {comps.map((_, i) => (
              <button
                key={i}
                className={`hero__dot-btn${i === idx ? ' active' : ''}`}
                onClick={() => go(i)}
                aria-label={`Go to competition ${i + 1}`}
              >
                <motion.span
                  className="hero__dot-fill"
                  animate={{ scaleX: i === idx ? 1 : 0 }}
                  transition={{ duration: 0.3, ease }}
                  style={{ transformOrigin: 'left' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar for auto-advance */}
      {comps.length > 1 && !paused && (
        <motion.div
          key={`timer-${idx}`}
          className="hero__timer-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      )}

      <HeroStyles />
    </section>
  )
}

function HeroStyles() {
  return (
    <style>{`
      .hero {
        position: relative; min-height: 100svh;
        display: flex; flex-direction: column; justify-content: flex-end;
        overflow: hidden;
        background: linear-gradient(145deg, #1a0f14 0%, #0e0a10 50%, #0d0c0b 100%);
      }
      .hero__bg {
        position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: cover; object-position: center 25%;
      }
      .hero__bg-fallback {
        position: absolute; inset: 0;
        background: linear-gradient(145deg, #2a1520, #1a0f14, #0d0c0b);
      }
      .hero__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(160deg,
          rgba(12,11,10,.08) 0%, rgba(12,11,10,.04) 30%,
          rgba(12,11,10,.55) 65%, rgba(12,11,10,.92) 100%);
      }
      .hero__trust {
        position: absolute; top: 80px; left: 0; right: 0;
        display: flex; align-items: center; justify-content: center;
        gap: .875rem; z-index: 2;
        font-size: .5625rem; letter-spacing: .16em; text-transform: uppercase;
        color: rgba(255,255,255,.4);
      }
      .hero__dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.2); flex-shrink: 0; }
      .hero__content {
        position: relative; z-index: 2;
        padding: 5rem clamp(1.5rem,5vw,5rem) clamp(2.5rem,4vw,4rem);
        max-width: 840px;
      }
      .hero__eyebrow { display: flex; gap: .5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
      .hero__tag { font-size: .5625rem; font-weight: 500; letter-spacing: .18em; text-transform: uppercase; padding: .3rem .75rem; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.7); }
      .hero__tag--rg { background: var(--rg); border-color: var(--rg); color: #fff; }
      .hero__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5.5rem); font-weight: 300; line-height: 1; letter-spacing: -.02em; color: #fff; margin-bottom: .75rem; }
      .hero__title--large { font-size: clamp(3rem,7vw,6rem); }
      .hero__title em { font-style: italic; color: #f0d8dd; }
      .hero__subtitle { font-size: clamp(.875rem,1.5vw,1.0625rem); line-height: 1.65; color: rgba(255,255,255,.65); max-width: 500px; margin-bottom: 1.75rem; }
      .hero__stats { display: flex; align-items: center; background: rgba(255,255,255,.07); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.1); width: fit-content; margin-bottom: 1.25rem; }
      .hero__stat { padding: .875rem 1.5rem; }
      .hero__stat-val { display: block; font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: #fff; line-height: 1; }
      .hero__stat-label { display: block; font-size: .5rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-top: .2rem; }
      .hero__stat-divider { width: 1px; align-self: stretch; background: rgba(255,255,255,.1); margin: .625rem 0; }
      .hero__progress-wrap { display: flex; align-items: center; gap: .875rem; margin-bottom: 1.75rem; max-width: 440px; }
      .hero__progress-track { flex: 1; height: 2px; background: rgba(255,255,255,.15); overflow: hidden; }
      .hero__progress-fill { height: 100%; background: var(--rg); }
      .hero__progress-pct { font-size: .5625rem; letter-spacing: .1em; color: rgba(255,255,255,.45); white-space: nowrap; }
      .hero__ctas { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
      .hero__cta-primary { padding: .9375rem 2rem; font-size: .6875rem; display: inline-block; }
      .hero__cta-ghost { font-size: .6875rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.6); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.25); padding-bottom: 2px; transition: color .2s, border-color .2s; }
      .hero__cta-ghost:hover { color: #fff; border-color: rgba(255,255,255,.65); }

      /* Dots */
      .hero__dots { display: flex; align-items: center; gap: .625rem; margin-top: 2rem; }
      .hero__dot-btn { position: relative; width: 28px; height: 2px; background: rgba(255,255,255,.2); border: none; cursor: pointer; padding: 0; overflow: hidden; transition: background .2s; }
      .hero__dot-btn.active { background: rgba(255,255,255,.25); }
      .hero__dot-fill { position: absolute; inset: 0; background: #fff; display: block; }

      /* Auto-advance timer bar */
      .hero__timer-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--rg); z-index: 3; }

      @media (max-width: 640px) { .hero__stats { flex-wrap: wrap; } .hero__trust { display: none; } }
    `}</style>
  )
}
