'use client'

import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string
  drawnAt: string | Date
  prizeTitle?: string | null
  prizeValue?: number | null
  user: { name: string }
  competition: {
    title: string
    prizeValue: number
    images?: string
    slug?: string
    ticketsSold?: number
    maxTickets?: number
  }
}

function parseFirstImage(raw?: string): string | null {
  try { return raw ? (JSON.parse(raw) as string[])[0] ?? null : null } catch { return null }
}

export default function WinnerCard({ winner, index = 0 }: { winner: WinnerData; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const parts = winner.user.name.trim().split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  const prize = winner.prizeTitle || winner.competition.title
  const value = winner.prizeValue ?? winner.competition.prizeValue
  const img = parseFirstImage(winner.competition.images)
  const slug = winner.competition.slug
  const pct = winner.competition.maxTickets
    ? Math.round(((winner.competition.ticketsSold ?? 0) / winner.competition.maxTickets) * 100)
    : null

  const inner = (
    <div className="wc__inner">
      {/* Image */}
      {img ? (
        <div className="wc__img-wrap">
          <img src={img} alt={prize} className="wc__img" />
          <div className="wc__img-overlay" />
        </div>
      ) : (
        <div className="wc__no-img" />
      )}

      {/* Top accent */}
      <div className="wc__accent" />

      {/* Content */}
      <div className="wc__body">
        <p className="wc__tag">★ Winner</p>
        <p className="wc__name">{name}</p>
        <p className="wc__prize">{prize}</p>

        <div className="wc__divider" />

        <div className="wc__foot">
          <p className="wc__value">{formatCurrency(value)}</p>
          <div style={{ textAlign: 'right' }}>
            <p className="wc__date">{formatDate(winner.drawnAt)}</p>
            {pct !== null && (
              <p className="wc__tickets">{pct}% sold</p>
            )}
          </div>
        </div>

        {slug && (
          <p className="wc__cta">View competition →</p>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className="wc"
    >
      {slug ? (
        <Link href={`/competitions/${slug}`} className="wc__link">{inner}</Link>
      ) : (
        inner
      )}

      <style>{`
        .wc {
          position: relative; overflow: hidden; background: var(--ink);
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s;
        }
        .wc:hover { transform: translateY(-4px); box-shadow: 0 24px 56px rgba(0,0,0,.35); }
        .wc__link { display: block; text-decoration: none; }
        .wc__inner { position: relative; }
        .wc__img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; }
        .wc__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.22,1,.36,1); }
        .wc:hover .wc__img { transform: scale(1.05); }
        .wc__img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.55) 100%);
        }
        .wc__no-img { aspect-ratio: 4/3; background: linear-gradient(145deg, #1a0f14, #0d0a0c); }
        .wc__accent {
          position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
          background: linear-gradient(90deg, transparent 0%, #d4b86a 30%, var(--rg) 50%, #d4b86a 70%, transparent 100%);
        }
        .wc__body { padding: 1.5rem 1.75rem 1.625rem; }
        .wc__tag {
          font-size: .5rem; letter-spacing: .22em; text-transform: uppercase;
          color: var(--rg); margin-bottom: 1rem;
        }
        .wc__name {
          font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 300;
          color: #fff; line-height: 1; letter-spacing: -.01em; margin-bottom: .375rem;
        }
        .wc__prize { font-size: .75rem; color: rgba(255,255,255,.45); line-height: 1.5; margin-bottom: 1.25rem; }
        .wc__divider { height: 1px; background: rgba(255,255,255,.08); margin-bottom: 1rem; }
        .wc__foot { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: .875rem; }
        .wc__value {
          font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 400; line-height: 1;
          background: linear-gradient(120deg, #f0d88a 0%, #d4a832 40%, var(--rg) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wc__date { font-size: .5625rem; letter-spacing: .08em; color: rgba(255,255,255,.28); }
        .wc__tickets { font-size: .5rem; letter-spacing: .08em; color: rgba(255,255,255,.2); margin-top: 2px; }
        .wc__cta {
          font-size: .5625rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--rg); opacity: 0; transition: opacity .25s;
        }
        .wc:hover .wc__cta { opacity: 1; }
      `}</style>
    </motion.div>
  )
}
