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
    <section className="hh" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hh__inner">

        {/* Left: headline */}
        <motion.div
          className="hh__left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
        >
          <div className="hh__badge">
            <span className="hh__badge-dot" />
            {comps.length} Live Competition{comps.length !== 1 ? 's' : ''}
          </div>
          <h1 className="hh__headline">Win The <em>Extra&shy;ordinary</em></h1>
          <p className="hh__sub">UK luxury prize competitions. Tickets from just £1.</p>
          <div className="hh__trust">
            {['✓ UK Regulated', '✓ Free Entry', '✓ Live Draws', '✓ 18+'].map(t => (
              <span key={t} className="hh__trust-item">{t}</span>
            ))}
          </div>
          <Link href="/competitions" className="hh__cta">Browse All Competitions</Link>
        </motion.div>

        {/* Right: cycling competition card */}
        <div className="hh__card-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className="hh__card"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.45, ease }}
            >
              {/* Image */}
              <div className="hh__card-img-wrap">
                {c.heroImg
                  ? <img src={c.heroImg} alt={c.title} className="hh__card-img" />
                  : <div className="hh__card-placeholder" />
                }
                <div className="hh__card-img-grad" />
                <div className="hh__card-prize-overlay">
                  <span className="hh__card-prize-label">Prize Value</span>
                  <span className="hh__card-prize-val">{formatCurrency(c.prizeValue)}</span>
                </div>
              </div>

              {/* Timer strip */}
              {c.drawDate && (
                <div className="hh__card-timer">
                  <CountdownTimer drawDate={c.drawDate} variant="strip" />
                </div>
              )}

              {/* Card body */}
              <div className="hh__card-body">
                <h3 className="hh__card-title">{c.title}</h3>
                {c.subtitle && <p className="hh__card-sub">{c.subtitle}</p>}

                <div className="hh__card-sold-row">
                  <span>{c.ticketsSold.toLocaleString()} tickets sold</span>
                  <span className="hh__card-remaining">{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
                </div>
                <div className="hh__card-track">
                  <motion.div
                    className="hh__card-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease, delay: 0.15 }}
                  />
                </div>

                <div className="hh__card-foot">
                  <div>
                    <span className="hh__card-price">{formatCurrency(c.ticketPrice)}</span>
                    <span className="hh__card-per"> per entry</span>
                  </div>
                  <Link href={`/competitions/${c.slug}`} className="hh__card-btn">Enter Now →</Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot navigation */}
          {comps.length > 1 && (
            <div className="hh__dots">
              {comps.map((_, i) => (
                <button
                  key={i}
                  className={`hh__dot${i === idx ? ' active' : ''}`}
                  onClick={() => { setIdx(i); setPaused(true) }}
                  aria-label={`Competition ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Auto-advance bar */}
          {comps.length > 1 && !paused && (
            <motion.div
              key={`bar-${idx}`}
              className="hh__bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </div>
      </div>

      <style>{`
        .hh {
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          padding-top: 68px;
        }
        .hh__inner {
          max-width: 1440px; margin: 0 auto;
          padding: clamp(2.5rem,5vw,4rem) clamp(1.5rem,4vw,4rem);
          display: grid; grid-template-columns: 1fr 420px;
          gap: clamp(2rem,4vw,5rem); align-items: center;
        }
        @media (max-width: 900px) { .hh__inner { grid-template-columns: 1fr; } }

        /* Left */
        .hh__left { display: flex; flex-direction: column; gap: 1.5rem; }
        .hh__badge {
          display: inline-flex; align-items: center; gap: .5rem; width: fit-content;
          background: var(--gold-pale); border: 1px solid rgba(201,168,76,.35);
          border-radius: 999px; padding: .35rem 1rem;
          font-size: .5rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--gold); font-weight: 600;
        }
        .hh__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse-dot 1.8s infinite; }
        .hh__headline {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2.5rem,5.5vw,4.5rem);
          font-weight: 300; line-height: .92; letter-spacing: -.03em; color: var(--ink);
        }
        .hh__headline em { font-style: italic; color: var(--gold); }
        .hh__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; max-width: 400px; }
        .hh__trust { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .hh__trust-item { font-size: .625rem; color: var(--ink2); letter-spacing: .04em; }
        .hh__cta {
          display: inline-flex; align-items: center; gap: .5rem; width: fit-content;
          background: var(--gold); color: #fff;
          font-size: .6875rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          padding: .9375rem 2rem; border-radius: var(--r-btn); text-decoration: none;
          transition: background .2s, transform .15s;
        }
        .hh__cta:hover { background: var(--gold-d); transform: translateY(-1px); }

        /* Right: card */
        .hh__card-wrap { position: relative; }
        .hh__card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--r-card);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .hh__card-img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--bg2); border-radius: var(--r-card) var(--r-card) 0 0; }
        .hh__card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .hh__card-placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,var(--bg2),var(--border)); }
        .hh__card-img-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(24,20,15,.8) 0%, transparent 55%); }
        .hh__card-prize-overlay { position: absolute; bottom: .875rem; left: 1rem; right: 1rem; z-index: 2; display: flex; align-items: flex-end; justify-content: space-between; }
        .hh__card-prize-label { font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .hh__card-prize-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 600; color: #fff; line-height: 1; }
        .hh__card-timer { background: var(--bg); }
        .hh__card-body { padding: 1rem 1.125rem 1.25rem; }
        .hh__card-title { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 600; color: var(--ink); margin-bottom: .25rem; line-height: 1.15; }
        .hh__card-sub { font-size: .75rem; color: var(--ink3); margin-bottom: .75rem; line-height: 1.45; }
        .hh__card-sold-row { display: flex; justify-content: space-between; font-size: .5875rem; color: var(--ink3); margin-bottom: .375rem; }
        .hh__card-remaining { color: var(--gold); font-weight: 600; }
        .hh__card-track { height: 5px; background: var(--bg2); border-radius: 999px; overflow: hidden; margin-bottom: .875rem; }
        .hh__card-fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .hh__card-foot { display: flex; align-items: center; justify-content: space-between; padding-top: .75rem; border-top: 1px solid var(--border); }
        .hh__card-price { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 700; color: var(--ink); }
        .hh__card-per { font-size: .5375rem; color: var(--ink3); }
        .hh__card-btn {
          background: var(--gold); color: #fff;
          font-size: .5625rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          padding: .5rem 1rem; border-radius: var(--r-btn); text-decoration: none;
          transition: background .2s;
        }
        .hh__card-btn:hover { background: var(--gold-d); }

        /* Dots */
        .hh__dots { display: flex; align-items: center; gap: .5rem; margin-top: 1rem; justify-content: center; }
        .hh__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); border: none; cursor: pointer; padding: 0; transition: background .25s, transform .25s; }
        .hh__dot.active { background: var(--gold); transform: scale(1.3); }

        /* Auto-advance bar */
        .hh__bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--gold); border-radius: 0 0 var(--r-card) var(--r-card); }
      `}</style>
    </section>
  )
}
