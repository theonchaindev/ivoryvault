'use client'

import { motion, useInView, AnimatePresence } from 'motion/react'
import { useRef, useState } from 'react'
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

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease, delay }}>
      {children}
    </motion.div>
  )
}

export default function CompetitionDetail({ competition }: { competition: Competition }) {
  const [activeImg, setActiveImg] = useState(0)
  const remaining = competition.maxTickets - competition.ticketsSold
  const pct = Math.round((competition.ticketsSold / competition.maxTickets) * 100)
  const hot = pct >= 80

  return (
    <div className="cd">
      {/* ── Hero ── */}
      <motion.div className="cd-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
        {competition.images.length > 0 ? (
          <AnimatePresence mode="sync">
            <motion.img
              key={activeImg}
              src={competition.images[activeImg]}
              alt={competition.title}
              className="cd-hero__img"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        ) : (
          <div className="cd-hero__placeholder" />
        )}
        <div className="cd-hero__scrim" />

        <motion.div className="cd-hero__badge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease, delay: 0.4 }}>
          <span className="cd-hero__badge-l">Prize Value</span>
          <span className="cd-hero__badge-v">{formatCurrency(competition.prizeValue)}</span>
        </motion.div>

        {hot && (
          <motion.div className="cd-hero__hot" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}>
            🔥 Selling Fast
          </motion.div>
        )}

        {competition.images.length > 1 && (
          <motion.div className="cd-hero__thumbs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {competition.images.map((src, i) => (
              <button key={i} className={`cd-hero__thumb${i === activeImg ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ── Content ── */}
      <div className="cd-content">
        <div className="cd-grid">
          <div className="cd-left">
            <Reveal>
              <div className="cd-title-block">
                <h1 className="cd-title">{competition.title}</h1>
                {competition.subtitle && <p className="cd-subtitle">{competition.subtitle}</p>}
              </div>
            </Reveal>

            {competition.drawDate && (
              <Reveal delay={0.08}>
                <div className="cd-block">
                  <p className="cd-block__label">Draw closes in</p>
                  <CountdownTimer drawDate={competition.drawDate.toISOString()} />
                  <p className="cd-block__sub">Draw date: {formatDate(competition.drawDate)}</p>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.12}>
              <div className="cd-progress">
                <div className="cd-progress__stats">
                  <div>
                    <p className="cd-block__label">Tickets Sold</p>
                    <p className="cd-progress__big">{competition.ticketsSold.toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="cd-block__label">Remaining</p>
                    <p className="cd-progress__big cd-progress__big--gold">{remaining.toLocaleString()}</p>
                  </div>
                </div>
                <div className="cd-progress__track">
                  <motion.div
                    className={`cd-progress__fill${hot ? ' hot' : ''}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease, delay: 0.2 }}
                  />
                </div>
                <p className="cd-progress__pct">{pct}% sold of {competition.maxTickets.toLocaleString()} total tickets</p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="cd-card">
                <h2 className="cd-card__title">About This Prize</h2>
                <p className="cd-card__body">{competition.description}</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="cd-card">
                <h2 className="cd-card__title">How the Draw Works</h2>
                {[
                  'Every ticket is assigned a unique number at purchase.',
                  'When the competition closes, a winner is drawn at random using verified software.',
                  'All draws are conducted live and recorded in full for transparency.',
                  'The winner is contacted within 24 hours. Prizes dispatched within 7 days.',
                  'Full audit trail available — every entry is verifiable.',
                ].map((item, i) => (
                  <motion.div key={i} className="cd-draw__item" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, ease, delay: i * 0.07 }}>
                    <span className="cd-draw__n">{String(i + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="cd-right">
            <TicketSelector competition={{ id: competition.id, title: competition.title, ticketPrice: competition.ticketPrice, maxTickets: competition.maxTickets, ticketsSold: competition.ticketsSold, status: competition.status }} />
          </div>
        </div>
      </div>

      <style>{`
        /* styles in globals.css */
        .cd { background: var(--bg); min-height: 100vh; }
        .cd-hero { height: clamp(320px,50vw,580px); position: relative; overflow: hidden; background: var(--ink); }
        .cd-hero__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .cd-hero__placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,#1a1510,#0e0c0a); }
        .cd-hero__scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,11,10,.65) 0%, rgba(12,11,10,.08) 50%, transparent 100%); }
        .cd-hero__badge { position: absolute; bottom: 2rem; left: 2rem; background: rgba(12,11,10,.85); backdrop-filter: blur(12px); border: 1px solid rgba(201,168,76,.3); padding: .875rem 1.5rem; }
        .cd-hero__badge-l { display: block; font-size: .5rem; letter-spacing: .14em; text-transform: uppercase; color: var(--rg); margin-bottom: .3rem; }
        .cd-hero__badge-v { display: block; font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 500; color: #fff; line-height: 1; }
        .cd-hero__hot { position: absolute; top: 1.5rem; right: 1.5rem; background: var(--rg); color: #fff; font-size: .5625rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: .375rem .875rem; }
        .cd-hero__thumbs { position: absolute; bottom: 2rem; right: 2rem; display: flex; gap: .5rem; }
        .cd-hero__thumb { width: 56px; height: 56px; overflow: hidden; border: 2px solid rgba(255,255,255,.3); cursor: pointer; padding: 0; background: none; transition: border-color .2s; }
        .cd-hero__thumb.active { border-color: var(--rg); }
        .cd-hero__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cd-content { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem 6rem; }
        .cd-grid { display: grid; grid-template-columns: minmax(0,1fr) 400px; gap: 4rem; align-items: start; }
        .cd-left { display: flex; flex-direction: column; gap: 1.5rem; }
        .cd-right { position: sticky; top: 92px; }
        .cd-title-block { padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
        .cd-title { font-family: var(--font-cormorant,serif); font-size: clamp(2rem,4vw,3.75rem); font-weight: 300; color: var(--ink); line-height: 1; letter-spacing: -.02em; margin-bottom: .5rem; }
        .cd-subtitle { font-family: var(--font-cormorant,serif); font-size: 1.125rem; font-style: italic; color: var(--ink3); }
        .cd-block { background: #fff; border: 1px solid var(--border); padding: 1.5rem; }
        .cd-block__label { font-size: .5375rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink3); margin-bottom: .75rem; }
        .cd-block__sub { font-size: .8125rem; color: var(--ink3); margin-top: .75rem; }
        .cd-progress { background: #fff; border: 1px solid var(--border); padding: 1.5rem; }
        .cd-progress__stats { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .cd-progress__big { font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 400; color: var(--ink); line-height: 1; }
        .cd-progress__big--gold { color: var(--rg); }
        .cd-progress__track { height: 4px; background: var(--border); overflow: hidden; margin-bottom: .5rem; border-radius: 2px; }
        .cd-progress__fill { height: 100%; background: var(--rg); border-radius: 2px; }
        .cd-progress__fill.hot { background: linear-gradient(90deg,#a86e28,var(--rg)); }
        .cd-progress__pct { font-size: .75rem; color: var(--ink3); text-align: right; }
        .cd-card { background: #fff; border: 1px solid var(--border); padding: 1.75rem; }
        .cd-card__title { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: var(--ink); padding-bottom: .875rem; border-bottom: 1px solid var(--border); margin-bottom: 1.25rem; }
        .cd-card__body { font-size: .875rem; line-height: 1.85; color: var(--ink2); white-space: pre-wrap; }
        .cd-draw__item { display: flex; gap: 1rem; align-items: flex-start; font-size: .875rem; line-height: 1.75; color: var(--ink2); padding: .75rem 0; border-bottom: 1px solid var(--border); }
        .cd-draw__item:last-child { border-bottom: none; padding-bottom: 0; }
        .cd-draw__n { font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500; color: var(--rg); min-width: 28px; line-height: 1.4; flex-shrink: 0; }
        @media (max-width: 900px) { .cd-grid { grid-template-columns: 1fr; } .cd-right { position: static; } }
        @media (max-width: 600px) { .cd-content { padding: 1.5rem 1.25rem 4rem; } .cd-grid { gap: 1.5rem; } }
      `}</style>
    </div>
  )
}
