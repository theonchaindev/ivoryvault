'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import TicketSelector from './TicketSelector'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Competition {
  id: string; title: string; subtitle?: string | null
  description: string; prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number; status: string
  drawDate?: Date | null; images: string[]
}

const ease = [0.22, 1, 0.36, 1] as const

function ScrollReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.65, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function CompetitionDetail({ competition }: { competition: Competition }) {
  const heroImage = competition.images[0]
  const remaining = competition.maxTickets - competition.ticketsSold
  const percentSold = Math.round((competition.ticketsSold / competition.maxTickets) * 100)
  const hot = percentSold >= 80

  return (
    <div className="cd-page">
      {/* Hero image */}
      <motion.div
        className="cd-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            src={heroImage} alt={competition.title}
            className="cd-hero__img"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease }}
          />
        ) : (
          <div className="cd-hero__placeholder">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: .35 }}>
              <circle cx="40" cy="40" r="38" stroke="#b8687a" strokeWidth="1" />
              <path d="M25 40L33 32l7 10 8-14 7 12" stroke="#b8687a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <div className="cd-hero__overlay" />
        {/* Prize badge */}
        <motion.div
          className="cd-hero__badge"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.35 }}
        >
          <p className="cd-hero__badge-label">Prize Value</p>
          <p className="cd-hero__badge-val">{formatCurrency(competition.prizeValue)}</p>
        </motion.div>
        {hot && (
          <motion.div
            className="cd-hero__hot"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
          >
            Selling Fast
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="cd-content">
        <div className="cd-grid">
          {/* Left column */}
          <div>
            {/* Title */}
            <ScrollReveal delay={0.05}>
              <h1 className="cd-title">{competition.title}</h1>
              {competition.subtitle && (
                <p className="cd-subtitle">{competition.subtitle}</p>
              )}
            </ScrollReveal>

            {/* Countdown */}
            {competition.drawDate && (
              <ScrollReveal delay={0.1}>
                <div className="cd-countdown-block">
                  <p className="cd-meta-label">Draw closes in</p>
                  <CountdownTimer drawDate={competition.drawDate.toISOString()} />
                  <p className="cd-meta-sub">Draw date: {formatDate(competition.drawDate)}</p>
                </div>
              </ScrollReveal>
            )}

            {/* Progress */}
            <ScrollReveal delay={0.15}>
              <div className="cd-progress-card">
                <div className="cd-progress-stats">
                  <div>
                    <p className="cd-meta-label">Tickets Sold</p>
                    <p className="cd-progress-big">{competition.ticketsSold.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="cd-meta-label">Remaining</p>
                    <p className="cd-progress-big" style={{ color: 'var(--rg)' }}>{remaining.toLocaleString()}</p>
                  </div>
                </div>
                <div className="cd-progress-track">
                  <motion.div
                    className={`cd-progress-fill${hot ? ' hot' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentSold}%` }}
                    transition={{ duration: 1.1, ease, delay: 0.3 }}
                  />
                </div>
                <p className="cd-progress-pct">{percentSold}% sold of {competition.maxTickets.toLocaleString()} total</p>
              </div>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal delay={0.2}>
              <div className="cd-section">
                <h2 className="cd-section-title">About This Prize</h2>
                <div className="cd-description">{competition.description}</div>
              </div>
            </ScrollReveal>

            {/* How the draw works */}
            <ScrollReveal delay={0.25}>
              <div className="cd-draw-card">
                <h3 className="cd-draw-title">How the Draw Works</h3>
                <div className="cd-draw-list">
                  {[
                    'All tickets are assigned a unique number at time of purchase.',
                    'When the competition closes (or all tickets are sold), a winner is drawn at random.',
                    'Draws are conducted using verified random number generation and recorded live.',
                    'The winner is contacted within 24 hours and prizes dispatched within 7 days.',
                    'Full audit trail available — every ticket is verifiable.',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="cd-draw-item"
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, ease, delay: i * 0.07 }}
                    >
                      <span className="cd-draw-num">{i + 1}.</span>
                      <p>{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: sticky ticket selector */}
          <div className="cd-sticky">
            <TicketSelector competition={{
              id: competition.id,
              title: competition.title,
              ticketPrice: competition.ticketPrice,
              maxTickets: competition.maxTickets,
              ticketsSold: competition.ticketsSold,
              status: competition.status,
            }} />
          </div>
        </div>
      </div>

      <style>{`
        .cd-page { background: var(--off); min-height: calc(100vh - 68px); }

        /* Hero */
        .cd-hero {
          height: clamp(300px, 45vw, 520px); position: relative;
          overflow: hidden; background: #1a1210;
        }
        .cd-hero__img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cd-hero__placeholder { width: 100%; height: 100%; background: linear-gradient(135deg,#f0e3d3,#e8d8cc,#d4c4b8); display: flex; align-items: center; justify-content: center; }
        .cd-hero__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,11,10,.55) 0%, transparent 50%); }
        .cd-hero__badge {
          position: absolute; bottom: 2rem; left: 2rem;
          background: var(--rg); color: #fff; padding: .875rem 1.5rem;
        }
        .cd-hero__badge-label { font-size: .6rem; letter-spacing: .1em; text-transform: uppercase; opacity: .8; margin-bottom: .2rem; }
        .cd-hero__badge-val { font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 500; line-height: 1; }
        .cd-hero__hot {
          position: absolute; top: 1.5rem; right: 1.5rem;
          background: var(--rg); color: #fff;
          font-size: .5625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          padding: .35rem .875rem;
        }

        /* Content layout */
        .cd-content { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem 6rem; }
        .cd-grid { display: grid; grid-template-columns: minmax(0,1fr) 380px; gap: 4rem; align-items: start; }
        .cd-sticky { position: sticky; top: 96px; }

        /* Typography */
        .cd-title { font-family: var(--font-cormorant,serif); font-size: clamp(2rem,4vw,3.5rem); font-weight: 400; color: var(--ink); line-height: 1.05; margin-bottom: .5rem; }
        .cd-subtitle { font-family: var(--font-cormorant,serif); font-size: 1.125rem; font-style: italic; color: var(--ink3); margin-bottom: 2rem; }
        .cd-meta-label { font-size: .6rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); margin-bottom: .5rem; }
        .cd-meta-sub { font-size: .8125rem; color: var(--ink3); margin-top: .5rem; }

        /* Countdown block */
        .cd-countdown-block { margin-bottom: 2.5rem; }

        /* Progress card */
        .cd-progress-card {
          background: #fff; border: 1px solid var(--border);
          padding: 1.5rem; margin-bottom: 2.5rem;
        }
        .cd-progress-stats { display: flex; justify-content: space-between; margin-bottom: .875rem; }
        .cd-progress-big { font-family: var(--font-cormorant,serif); font-size: 1.625rem; font-weight: 500; color: var(--ink); line-height: 1; }
        .cd-progress-track { height: 4px; background: var(--border); overflow: hidden; margin-bottom: .5rem; }
        .cd-progress-fill { height: 100%; background: linear-gradient(90deg, var(--rg), #d49aa5); }
        .cd-progress-fill.hot { background: linear-gradient(90deg, #c0404f, var(--rg)); }
        .cd-progress-pct { font-size: .75rem; color: var(--ink3); text-align: right; }

        /* Description */
        .cd-section { margin-bottom: 2.5rem; }
        .cd-section-title { font-family: var(--font-cormorant,serif); font-size: 1.625rem; font-weight: 500; color: var(--ink); margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 1px solid var(--border); }
        .cd-description { font-size: .9rem; line-height: 1.85; color: var(--ink2); white-space: pre-wrap; }

        /* Draw card */
        .cd-draw-card { background: #fff; border: 1px solid var(--border); padding: 2rem; }
        .cd-draw-title { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: var(--ink); margin-bottom: 1.25rem; }
        .cd-draw-list { display: flex; flex-direction: column; gap: .875rem; }
        .cd-draw-item { display: flex; gap: 1rem; align-items: flex-start; font-size: .875rem; color: var(--ink2); line-height: 1.7; }
        .cd-draw-num { font-family: var(--font-cormorant,serif); font-size: 1.125rem; color: var(--rg); font-weight: 500; min-width: 20px; line-height: 1.5; }

        @media (max-width: 900px) { .cd-grid { grid-template-columns: 1fr; } .cd-sticky { position: static; } }
        @media (max-width: 640px) { .cd-content { padding: 2rem 1.25rem 4rem; } }
      `}</style>
    </div>
  )
}
