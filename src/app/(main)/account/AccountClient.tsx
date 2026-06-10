'use client'

import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Tier {
  name: string
  min: number
  max: number
  color: string
  perks: string[]
}

interface TicketEntry {
  id: string
  quantity: number
  purchasedAt: string
  competition: {
    id: string
    title: string
    slug: string
    status: string
    prizeValue: number
    drawDate: string | null
  }
}

interface Props {
  name: string
  email: string
  totalTickets: number
  totalEntries: number
  activeEntries: number
  tier: Tier
  nextTier: Tier | null
  progressPct: number
  tickets: TicketEntry[]
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum']

export default function AccountClient({
  name, email, totalTickets, totalEntries, activeEntries,
  tier, nextTier, progressPct, tickets,
}: Props) {
  return (
    <div className="acc">
      {/* ── Header ── */}
      <div className="acc__hero">
        <div className="acc__hero-inner">
          <FadeIn>
            <p className="acc__label">Welcome Back</p>
            <h1 className="acc__name">{name}</h1>
            <p className="acc__email">{email}</p>
          </FadeIn>
        </div>
      </div>

      <div className="acc__body">

        {/* ── Tier card ── */}
        <FadeIn delay={0.05}>
          <div className="acc__tier-card" style={{ '--tier-color': tier.color } as React.CSSProperties}>
            <div className="acc__tier-left">
              <div className="acc__tier-badge">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 3 L19.5 12 L29 13.5 L22 20 L24 29.5 L16 25.5 L8 29.5 L10 20 L3 13.5 L12.5 12 Z" stroke="currentColor" strokeWidth="1.25" fill="none"/>
                </svg>
                <span className="acc__tier-name">{tier.name}</span>
              </div>
              <p className="acc__tier-sub">
                {nextTier
                  ? `${nextTier.min - totalTickets} tickets to ${nextTier.name}`
                  : 'Maximum tier reached'}
              </p>

              {/* Progress bar */}
              <div className="acc__prog-track">
                <motion.div
                  className="acc__prog-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>

              {/* Tier steps */}
              <div className="acc__tier-steps">
                {TIER_ORDER.map(t => (
                  <span key={t} className={`acc__tier-step ${t === tier.name ? 'active' : ''}`}>{t}</span>
                ))}
              </div>
            </div>

            <div className="acc__tier-perks">
              <p className="acc__perks-title">Your Perks</p>
              <ul className="acc__perks-list">
                {tier.perks.map(p => (
                  <li key={p} className="acc__perk-item">
                    <span className="acc__perk-dot" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* ── Stats ── */}
        <FadeIn delay={0.1}>
          <div className="acc__stats">
            {[
              { label: 'Total Entries', value: totalEntries },
              { label: 'Total Tickets', value: totalTickets.toLocaleString() },
              { label: 'Active Entries', value: activeEntries },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="acc__stat"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.07 }}
              >
                <p className="acc__stat-val">{s.value}</p>
                <p className="acc__stat-label">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* ── Entries ── */}
        <FadeIn delay={0.15}>
          <h2 className="acc__section-title">My Entries</h2>
        </FadeIn>

        {tickets.length > 0 ? (
          <div className="acc__entries">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                className="acc__entry"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.05 }}
              >
                <div className="acc__entry-left">
                  <Link href={`/competitions/${ticket.competition.slug}`} className="acc__entry-title">
                    {ticket.competition.title}
                  </Link>
                  <div className="acc__entry-meta">
                    <span>Entered {formatDate(ticket.purchasedAt)}</span>
                    {ticket.competition.drawDate && (
                      <span>Draw {formatDate(ticket.competition.drawDate)}</span>
                    )}
                  </div>
                </div>
                <div className="acc__entry-right">
                  <div className="acc__entry-stat">
                    <p className="acc__entry-stat-l">Tickets</p>
                    <p className="acc__entry-stat-v">{ticket.quantity}</p>
                  </div>
                  <div className="acc__entry-stat">
                    <p className="acc__entry-stat-l">Prize</p>
                    <p className="acc__entry-stat-v" style={{ color: 'var(--rg)' }}>{formatCurrency(ticket.competition.prizeValue)}</p>
                  </div>
                  <span className={`acc__badge ${ticket.competition.status === 'active' ? 'acc__badge--live' : ''}`}>
                    {ticket.competition.status === 'active' ? 'Live' : ticket.competition.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <FadeIn delay={0.2}>
            <div className="acc__empty">
              <p className="acc__empty-title">No entries yet</p>
              <p className="acc__empty-sub">Browse our live competitions and enter today.</p>
              <Link href="/competitions" className="btn-rg" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                Browse Competitions
              </Link>
            </div>
          </FadeIn>
        )}
      </div>

      <style>{`
        .acc { background: var(--off); min-height: calc(100vh - 68px); }

        /* Hero */
        .acc__hero {
          background: var(--ink);
          padding: 5rem 2rem 4rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .acc__hero-inner { max-width: 1280px; margin: 0 auto; }
        .acc__label {
          font-size: .5625rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--rg); margin-bottom: .75rem;
        }
        .acc__name {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2.5rem,5vw,4.5rem);
          font-weight: 700; color: #fff; line-height: .95;
          letter-spacing: -.02em; margin-bottom: .5rem;
        }
        .acc__email { font-size: .8125rem; color: rgba(255,255,255,.35); }

        /* Body */
        .acc__body { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem 6rem; display: flex; flex-direction: column; gap: 2.5rem; }

        /* Tier card */
        .acc__tier-card {
          display: grid; grid-template-columns: 1fr 1fr;
          background: var(--ink); border-top: 3px solid var(--tier-color, var(--rg));
          overflow: hidden;
        }
        @media (max-width: 700px) { .acc__tier-card { grid-template-columns: 1fr; } }
        .acc__tier-left { padding: 2.5rem; border-right: 1px solid rgba(255,255,255,.07); }
        @media (max-width: 700px) { .acc__tier-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,.07); } }
        .acc__tier-badge {
          display: flex; align-items: center; gap: .875rem;
          color: var(--tier-color, var(--rg)); margin-bottom: 1.5rem;
        }
        .acc__tier-name {
          font-family: var(--font-cormorant,serif);
          font-size: 2.5rem; font-weight: 700; line-height: 1;
          color: #fff;
        }
        .acc__tier-sub { font-size: .75rem; color: rgba(255,255,255,.4); margin-bottom: 1.25rem; }
        .acc__prog-track {
          height: 2px; background: rgba(255,255,255,.1); overflow: hidden; margin-bottom: 1rem;
        }
        .acc__prog-fill { height: 100%; background: var(--tier-color, var(--rg)); }
        .acc__tier-steps { display: flex; gap: 1rem; }
        .acc__tier-step {
          font-size: .5rem; letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,.2); transition: color .2s;
        }
        .acc__tier-step.active { color: var(--tier-color, var(--rg)); font-weight: 600; }

        /* Perks */
        .acc__tier-perks { padding: 2.5rem; }
        .acc__perks-title {
          font-size: .5625rem; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.35); margin-bottom: 1.25rem;
        }
        .acc__perks-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .875rem; }
        .acc__perk-item { display: flex; align-items: baseline; gap: .75rem; font-size: .8125rem; color: rgba(255,255,255,.7); line-height: 1.4; }
        .acc__perk-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--tier-color, var(--rg)); flex-shrink: 0; position: relative; top: -1px; }

        /* Stats */
        .acc__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
        @media (max-width: 560px) { .acc__stats { grid-template-columns: 1fr; } }
        .acc__stat { background: #fff; padding: 2rem; text-align: center; }
        .acc__stat-val {
          font-family: var(--font-cormorant,serif); font-size: 3rem; font-weight: 700;
          color: var(--rg); line-height: 1; margin-bottom: .375rem;
        }
        .acc__stat-label { font-size: .5625rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); }

        /* Section title */
        .acc__section-title {
          font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 700;
          color: var(--ink); letter-spacing: -.01em;
        }

        /* Entries */
        .acc__entries { display: flex; flex-direction: column; gap: .75rem; }
        .acc__entry {
          background: #fff; border: 1px solid var(--border); padding: 1.5rem 2rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1rem;
          transition: border-color .2s;
        }
        .acc__entry:hover { border-color: var(--rg); }
        .acc__entry-left { flex: 1; min-width: 0; }
        .acc__entry-title {
          font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500;
          color: var(--ink); text-decoration: none; display: block; margin-bottom: .375rem;
          transition: color .2s;
        }
        .acc__entry-title:hover { color: var(--rg); }
        .acc__entry-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .acc__entry-meta span { font-size: .75rem; color: var(--ink3); }
        .acc__entry-right { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .acc__entry-stat { text-align: right; }
        .acc__entry-stat-l { font-size: .5625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); margin-bottom: .125rem; }
        .acc__entry-stat-v { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 400; color: var(--ink); }
        .acc__badge {
          display: inline-block; padding: .25rem .75rem;
          font-size: .5625rem; letter-spacing: .1em; text-transform: uppercase;
          background: var(--off); color: var(--ink3);
          border: 1px solid var(--border);
        }
        .acc__badge--live { background: rgba(184,104,122,.08); color: var(--rg); border-color: rgba(184,104,122,.25); }

        /* Empty */
        .acc__empty {
          text-align: center; padding: 5rem 2rem;
          border: 1px solid var(--border); background: #fff;
        }
        .acc__empty-title { font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 700; color: var(--ink3); margin-bottom: .5rem; }
        .acc__empty-sub { font-size: .875rem; color: var(--ink3); }
      `}</style>
    </div>
  )
}
