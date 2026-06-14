'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface HeroComp {
  slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number
  heroImg: string | null; drawDate?: string | null
}

const INTERVAL = 5000
const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ comps }: { comps: HeroComp[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const direction = useRef<1 | -1>(1) // 1 = forward (right→left), -1 = backward

  const go = useCallback((nextIdx: number) => {
    direction.current = nextIdx > idx ? 1 : -1
    setIdx(nextIdx)
  }, [idx])

  const next = useCallback(() => {
    direction.current = 1
    setIdx(i => (i + 1) % Math.max(comps.length, 1))
  }, [comps.length])

  useEffect(() => {
    if (paused || comps.length <= 1) return
    const t = setTimeout(next, INTERVAL)
    return () => clearTimeout(t)
  }, [idx, paused, next, comps.length])

  if (!comps.length) return null

  const c = comps[idx]
  const pct = Math.min(100, Math.round((c.ticketsSold / c.maxTickets) * 100))

  const enterX = direction.current === 1 ? 60 : -60
  const exitX = direction.current === 1 ? -60 : 60

  return (
    <section className="hh" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hh__inner">

        {/* Left: brand text (hidden on mobile) */}
        <div className="hh__left">
          <h1 className="hh__headline">Win The <em>Extra&shy;ordinary</em></h1>
          <p className="hh__sub">UK luxury prize competitions. Transparent live draws.</p>
          <div className="hh__trust">
            {['✓ UK Regulated', '✓ Free Entry', '✓ Live Draws', '✓ 18+'].map(t => (
              <span key={t} className="hh__trust-item">{t}</span>
            ))}
          </div>
          <Link href="/competitions" className="hh__cta">Browse All Competitions</Link>
        </div>

        {/* Right: sliding card */}
        <div className="hh__card-wrap">
          <div className="hh__card-viewport">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={idx}
                className={"hh__card"}
                initial={{ opacity: 0, x: enterX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: exitX }}
                transition={{ duration: 0.38, ease }}
              >
                <div className="hh__card-img-wrap">
                  {c.heroImg
                    ? <img src={c.heroImg} alt={c.title} className="hh__card-img" />
                    : <div className="hh__card-placeholder" />
                  }
                </div>

                {c.drawDate && (
                  <div className="hh__card-timer">
                    <CountdownTimer drawDate={c.drawDate} variant="strip" />
                  </div>
                )}

                <div className="hh__card-body">
                  <h3 className="hh__card-title">{c.title}</h3>

                  <div className="hh__card-sold-row">
                    <span>{c.ticketsSold.toLocaleString()} sold</span>
                    <span className="hh__card-remaining">{(c.maxTickets - c.ticketsSold).toLocaleString()} left</span>
                  </div>
                  <div className="hh__card-track">
                    <motion.div
                      className="hh__card-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease, delay: 0.1 }}
                    />
                  </div>

                  <div className="hh__card-foot">
                    <span className="hh__card-price">{formatCurrency(c.ticketPrice)}<span className="hh__card-per"> / entry</span></span>
                  </div>
                  <Link href={`/competitions/${c.slug}`} className="hh__card-btn">Enter Now</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav: prev/next arrows + dots */}
          {comps.length > 1 && (
            <div className="hh__nav">
              <button
                className="hh__arrow"
                onClick={() => go((idx - 1 + comps.length) % comps.length)}
                aria-label="Previous"
              >
                ‹
              </button>
              <div className="hh__dots">
                {comps.map((_, i) => (
                  <button
                    key={i}
                    className={`hh__dot${i === idx ? ' active' : ''}`}
                    onClick={() => go(i)}
                    aria-label={`Competition ${i + 1}`}
                  />
                ))}
              </div>
              <button
                className="hh__arrow"
                onClick={() => go((idx + 1) % comps.length)}
                aria-label="Next"
              >
                ›
              </button>
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
          position: relative;
          background: var(--ink);
          padding-top: 80px;
          overflow: hidden;
        }
        /* Gold radial glow + subtle texture */
        .hh::before {
          content: ''; position: absolute; top: -20%; right: -10%;
          width: 70%; height: 140%;
          background: radial-gradient(ellipse at center, rgba(31,122,224,.18) 0%, rgba(31,122,224,.05) 40%, transparent 70%);
          pointer-events: none;
        }
        .hh::after {
          content: ''; position: absolute; inset: 0;
          background:
            linear-gradient(135deg, rgba(31,122,224,.04) 0%, transparent 50%),
            radial-gradient(circle at 15% 30%, rgba(255,255,255,.02) 0%, transparent 25%);
          pointer-events: none;
        }
        .hh__inner {
          position: relative; z-index: 1;
          max-width: 1440px; margin: 0 auto;
          padding: clamp(2.5rem,5vw,4.5rem) clamp(1.5rem,4vw,4rem);
          display: grid; grid-template-columns: 1.1fr 380px;
          gap: clamp(2.5rem,5vw,5rem); align-items: center;
        }
        @media (max-width: 860px) {
          .hh__inner { grid-template-columns: 1fr; padding: 2.5rem 1.5rem 3rem; gap: 0; }
          .hh__card-wrap { display: none; }
        }

        /* Left */
        .hh__left { display: flex; flex-direction: column; gap: 1.5rem; }
        .hh__badge {
          display: inline-flex; align-items: center; gap: .5rem; width: fit-content;
          background: rgba(31,122,224,.12); border: 1px solid rgba(31,122,224,.3);
          border-radius: 999px; padding: .4rem 1rem;
          font-size: .5rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--gold); font-weight: 700;
        }
        .hh__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse-dot 1.8s infinite; box-shadow: 0 0 8px rgba(31,122,224,.8); }
        .hh__headline {
          font-size: clamp(2.75rem,6.5vw,5.5rem);
          font-weight: 800; line-height: .92; letter-spacing: -.035em; color: #fff;
          text-transform: uppercase;
        }
        .hh__headline em {
          font-style: normal; display: block;
          background: linear-gradient(120deg, #4a9aee 0%, var(--gold) 45%, #1056a0 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hh__sub { font-size: 1rem; color: rgba(255,255,255,.55); line-height: 1.6; max-width: 420px; }
        .hh__trust { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .hh__trust-item { font-size: .625rem; color: rgba(255,255,255,.5); letter-spacing: .06em; font-weight: 500; }
        .hh__cta {
          display: inline-flex; align-items: center; width: fit-content;
          background: var(--gold); color: var(--ink);
          font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          padding: 1.0625rem 2.5rem; border-radius: var(--r-btn); text-decoration: none;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 8px 24px rgba(31,122,224,.3);
        }
        .hh__cta:hover { background: #4a9aee; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(31,122,224,.45); }

        /* Card wrapper */
        .hh__card-wrap { position: relative; }
        .hh__card-viewport { overflow: hidden; border-radius: var(--r-card); }
        .hh__card {
          background: var(--card);
          border-radius: var(--r-card);
          overflow: hidden;
          box-shadow: 0 24px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(31,122,224,.2);
        }
        .hh__card-img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--bg2); }
        .hh__card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .hh__card-placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,var(--bg2),var(--border)); }
        .hh__card-img-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(24,20,15,.85) 0%, transparent 55%); }
        .hh__card-prize-overlay { position: absolute; bottom: .875rem; left: 1.125rem; right: 1.125rem; z-index: 2; display: flex; align-items: flex-end; justify-content: space-between; }
        .hh__card-prize-label { font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .hh__card-prize-val { font-size: 2rem; font-weight: 800; color: #fff; line-height: 1; }
        .hh__card-timer { background: var(--ink); }
        .hh__card-body { padding: 1rem 1.125rem 1.125rem; }
        .hh__card-title { font-size: 1.0625rem; font-weight: 700; color: var(--ink); margin-bottom: .75rem; line-height: 1.2; }
        .hh__card-sold-row { display: flex; justify-content: space-between; font-size: .5625rem; color: var(--ink3); margin-bottom: .3rem; font-weight: 500; }
        .hh__card-remaining { color: var(--gold); font-weight: 700; }
        .hh__card-track { height: 5px; background: var(--track); border-radius: 999px; overflow: hidden; margin-bottom: .75rem; }
        .hh__card-fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .hh__card-foot { margin-bottom: .75rem; }
        .hh__card-price { font-size: 1.25rem; font-weight: 800; color: var(--ink); }
        .hh__card-per { font-size: .625rem; color: var(--ink3); font-weight: 500; }
        .hh__card-btn {
          display: block; width: 100%; text-align: center;
          background: var(--gold); color: var(--ink);
          font-size: .6875rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          padding: .8125rem; border-radius: var(--r-btn); text-decoration: none;
          transition: background .2s;
        }
        .hh__card-btn:hover { background: #4a9aee; }

        /* Nav row */
        .hh__nav { display: flex; align-items: center; justify-content: center; gap: .75rem; margin-top: 1.25rem; }
        .hh__arrow {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.15);
          font-size: 1.25rem; color: rgba(255,255,255,.7); cursor: pointer;
          display: flex; align-items: center; justify-content: center; line-height: 1;
          transition: border-color .2s, color .2s, background .2s;
        }
        .hh__arrow:hover { border-color: var(--gold); color: var(--gold); background: rgba(31,122,224,.12); }
        .hh__dots { display: flex; align-items: center; gap: .5rem; }
        .hh__dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.2); border: none; cursor: pointer; padding: 0; transition: background .2s, transform .2s; }
        .hh__dot.active { background: var(--gold); transform: scale(1.35); }

        /* Progress bar */
        .hh__bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--gold); z-index: 2; }
      `}</style>
    </section>
  )
}
