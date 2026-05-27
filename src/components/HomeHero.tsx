'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency } from '@/lib/utils'

interface HeroComp {
  slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number
}

interface Props {
  hero: HeroComp | null
  heroImg: string | null
}

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ hero, heroImg }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  const pct = hero ? Math.min(100, Math.round((hero.ticketsSold / hero.maxTickets) * 100)) : 0

  return (
    <section className="hero" ref={ref}>
      {/* Parallax background */}
      <motion.div className="hero__bg-wrap" style={{ y: bgY, opacity: bgOpacity }}>
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImg} alt="" className="hero__bg" />
        ) : (
          <div className="hero__bg-fallback" />
        )}
      </motion.div>
      <div className="hero__overlay" />

      {/* Trust bar — stagger in */}
      <motion.div
        className="hero__trust"
        initial={{ opacity: 0, y: -12 }}
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

      {/* Main content */}
      <motion.div className="hero__content" style={{ y: contentY }}>
        {hero ? (
          <>
            {/* Tags */}
            <motion.div
              className="hero__eyebrow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
            >
              <span className="hero__tag">Featured Competition</span>
              <span className="hero__tag hero__tag--rg">Live Now</span>
            </motion.div>

            {/* Title — word by word */}
            <motion.h1
              className="hero__title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.25 }}
            >
              {hero.title}
            </motion.h1>

            {hero.subtitle && (
              <motion.p
                className="hero__subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.38 }}
              >
                {hero.subtitle}
              </motion.p>
            )}

            {/* Stats row */}
            <motion.div
              className="hero__stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
            >
              <div className="hero__stat">
                <span className="hero__stat-val">{formatCurrency(hero.prizeValue)}</span>
                <span className="hero__stat-label">Prize Value</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-val">{formatCurrency(hero.ticketPrice)}</span>
                <span className="hero__stat-label">Per Ticket</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-val">{(hero.maxTickets - hero.ticketsSold).toLocaleString()}</span>
                <span className="hero__stat-label">Remaining</span>
              </div>
            </motion.div>

            {/* Animated progress bar */}
            <motion.div
              className="hero__progress-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
            >
              <div className="hero__progress-track">
                <motion.div
                  className="hero__progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                />
              </div>
              <span className="hero__progress-pct">{pct}% sold</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="hero__ctas"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.7 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`/competitions/${hero.slug}`} className="btn-rg hero__cta-primary">
                  Enter This Competition →
                </Link>
              </motion.div>
              <Link href="/competitions" className="hero__cta-ghost">View All Competitions</Link>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
            >
              <span className="hero__tag">Ivory Vault</span>
            </motion.div>
            <motion.h1
              className="hero__title hero__title--large"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.35 }}
            >
              Win The<br /><em>Extraordinary</em>
            </motion.h1>
            <motion.p
              className="hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
            >
              Premium prize competitions. Transparent draws. Life-changing prizes.
            </motion.p>
            <motion.div
              className="hero__ctas"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.65 }}
            >
              <Link href="/competitions" className="btn-rg hero__cta-primary">Browse Competitions →</Link>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Animated scroll cue */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span>Scroll</span>
        <motion.div
          className="hero__scroll-line"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>

      <style>{`
        .hero {
          position: relative; min-height: 100svh;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden;
          background: linear-gradient(145deg, #1a0f14 0%, #0e0a10 50%, #0d0c0b 100%);
        }
        .hero__bg-wrap {
          position: absolute; inset: 0; will-change: transform;
        }
        .hero__bg {
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 25%;
          opacity: .45;
        }
        .hero__bg-fallback {
          width: 100%; height: 100%;
          background: linear-gradient(145deg, #2a1520, #1a0f14, #0d0c0b);
        }
        .hero__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(12,11,10,.1) 0%,
            rgba(12,11,10,.04) 35%,
            rgba(12,11,10,.55) 65%,
            rgba(12,11,10,.9) 100%
          );
        }
        .hero__trust {
          position: absolute; top: 80px; left: 0; right: 0;
          display: flex; align-items: center; justify-content: center;
          gap: .875rem; z-index: 2;
          font-size: .5625rem; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.45);
        }
        .hero__dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.25); flex-shrink: 0; }
        .hero__content {
          position: relative; z-index: 2;
          padding: 5rem clamp(1.5rem, 5vw, 5rem) clamp(3rem, 5vw, 4.5rem);
          max-width: 840px;
          will-change: transform;
        }
        .hero__eyebrow { display: flex; gap: .5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .hero__tag {
          font-size: .5625rem; font-weight: 500; letter-spacing: .18em; text-transform: uppercase;
          padding: .3rem .75rem; border: 1px solid rgba(255,255,255,.2);
          color: rgba(255,255,255,.7);
        }
        .hero__tag--rg { background: var(--rg); border-color: var(--rg); color: #fff; }
        .hero__title {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2.75rem, 6vw, 5.5rem);
          font-weight: 300; line-height: 1;
          letter-spacing: -.02em; color: #fff;
          margin-bottom: .75rem;
        }
        .hero__title--large { font-size: clamp(3rem, 7vw, 6rem); }
        .hero__title em { font-style: italic; color: #f0d8dd; }
        .hero__subtitle {
          font-size: clamp(.875rem, 1.5vw, 1.0625rem); line-height: 1.65;
          color: rgba(255,255,255,.65); max-width: 500px;
          margin-bottom: 1.75rem;
        }
        .hero__stats {
          display: flex; align-items: center;
          background: rgba(255,255,255,.07); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.1);
          width: fit-content; margin-bottom: 1.25rem;
        }
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
        .hero__cta-ghost {
          font-size: .6875rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.6); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.25);
          padding-bottom: 2px; transition: color .2s, border-color .2s;
        }
        .hero__cta-ghost:hover { color: #fff; border-color: rgba(255,255,255,.65); }
        .hero__scroll {
          position: absolute; bottom: 1.75rem; right: 2.5rem;
          display: flex; flex-direction: column; align-items: center; gap: .5rem; z-index: 2;
        }
        .hero__scroll span { font-size: .5rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.3); writing-mode: vertical-rl; }
        .hero__scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,.4), transparent); }
        @media (max-width: 640px) {
          .hero__stats { flex-wrap: wrap; }
          .hero__trust { display: none; }
        }
      `}</style>
    </section>
  )
}
