'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface Competition {
  id: string; slug: string; title: string; subtitle?: string | null
  prizeValue: number; ticketPrice: number; maxTickets: number
  ticketsSold: number; images: string; drawDate?: string | null
  status: string; featured: boolean
}

export default function CompetitionCard({ competition, index = 0 }: { competition: Competition; index?: number }) {
  const images = (() => { try { return JSON.parse(competition.images) as string[] } catch { return [] } })()
  const heroImage = images[0] || null
  const remaining = competition.maxTickets - competition.ticketsSold
  const percentSold = Math.min(100, Math.round((competition.ticketsSold / competition.maxTickets) * 100))
  const urgency = remaining < competition.maxTickets * 0.15

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.12 }}
      style={{ background: 'white', position: 'relative', overflow: 'hidden' }}
    >
      {/* Image */}
      <Link href={`/competitions/${competition.slug}`} style={{ display: 'block', position: 'relative', overflow: 'hidden', height: '280px' }}>
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            src={heroImage}
            alt={competition.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #ede0cf 0%, #ddd0c0 60%, #c8b8a8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
              <circle cx="32" cy="32" r="28" stroke="#8a4f58" strokeWidth="1.5" />
              <path d="M22 32 L27 26 L32 34 L37 23 L42 32" stroke="#8a4f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        )}
        {/* Overlay gradient at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)' }} />

        {/* Prize value */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1.25rem',
            color: 'white',
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.625rem',
            fontWeight: 600,
            lineHeight: 1,
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        >
          {formatCurrency(competition.prizeValue)}
        </div>

        {urgency && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#b76e79',
              color: 'white',
              fontSize: '0.5625rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '0.35rem 0.7rem',
            }}
          >
            Almost Gone
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '1.5rem 1.5rem 1.75rem' }}>
        <Link href={`/competitions/${competition.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.625rem',
              fontWeight: 500,
              color: '#141210',
              lineHeight: 1.15,
              marginBottom: '0.25rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
            onMouseLeave={e => (e.currentTarget.style.color = '#141210')}
          >
            {competition.title}
          </h3>
        </Link>
        {competition.subtitle && (
          <p style={{ fontSize: '0.8125rem', color: '#8a7f76', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {competition.subtitle}
          </p>
        )}

        {/* Progress */}
        <div style={{ marginBottom: '1.125rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', color: '#8a7f76' }}>
              {remaining.toLocaleString()} tickets remaining
            </span>
            <span style={{ fontSize: '0.6875rem', color: percentSold > 80 ? '#b76e79' : '#8a7f76', fontWeight: percentSold > 80 ? 600 : 400 }}>
              {percentSold}% sold
            </span>
          </div>
          <div style={{ height: '2px', background: '#e2d0c0', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentSold}%` }}
              transition={{ duration: 1, delay: index * 0.12 + 0.3, ease: 'easeOut' }}
              style={{ height: '100%', background: percentSold > 80 ? '#b76e79' : '#c8a898' }}
            />
          </div>
        </div>

        {/* Countdown */}
        {competition.drawDate && (
          <div style={{ marginBottom: '1.25rem' }}>
            <CountdownTimer drawDate={competition.drawDate} compact />
          </div>
        )}

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.125rem', borderTop: '1px solid #e2d0c0' }}>
          <div>
            <p style={{ fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a7f76', marginBottom: '0.2rem' }}>Per ticket</p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#141210', lineHeight: 1 }}>
              {formatCurrency(competition.ticketPrice)}
            </p>
          </div>
          <Link href={`/competitions/${competition.slug}`} className="btn-rg" style={{ padding: '0.625rem 1.5rem', fontSize: '0.625rem' }}>
            Enter Now
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
