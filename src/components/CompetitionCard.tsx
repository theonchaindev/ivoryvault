'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'

interface Competition {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  prizeValue: number
  ticketPrice: number
  maxTickets: number
  ticketsSold: number
  images: string
  drawDate?: string | null
  status: string
  featured: boolean
}

interface CompetitionCardProps {
  competition: Competition
  index?: number
}

export default function CompetitionCard({ competition, index = 0 }: CompetitionCardProps) {
  const images = (() => {
    try {
      return JSON.parse(competition.images) as string[]
    } catch {
      return []
    }
  })()

  const heroImage = images[0] || null
  const remaining = competition.maxTickets - competition.ticketsSold
  const percentSold = Math.round((competition.ticketsSold / competition.maxTickets) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      style={{
        backgroundColor: 'var(--card, #fffcf9)',
        border: '1px solid #e8d8cc',
        overflow: 'hidden',
        transition: 'box-shadow 0.4s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(183, 110, 121, 0.18)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={competition.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f0e3d3 0%, #e8d8cc 40%, #d4c4b8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.4 }}>
              <circle cx="30" cy="30" r="28" stroke="#b76e79" strokeWidth="1" />
              <path d="M20 30 L25 25 L30 32 L35 24 L40 30" stroke="#b76e79" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        )}
        {/* Prize badge */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: '#b76e79',
            color: 'white',
            padding: '0.4rem 0.875rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {formatCurrency(competition.prizeValue)}
        </div>
        {competition.featured && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: '#1c1a18',
              color: '#d4959e',
              padding: '0.3rem 0.75rem',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1c1a18',
            lineHeight: 1.2,
            marginBottom: '0.375rem',
          }}
        >
          {competition.title}
        </h3>
        {competition.subtitle && (
          <p style={{ fontSize: '0.85rem', color: '#9a8878', marginBottom: '1rem' }}>
            {competition.subtitle}
          </p>
        )}

        {/* Ticket info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>
              Ticket Price
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: '#b76e79' }}>
              {formatCurrency(competition.ticketPrice)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>
              Tickets Left
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, color: '#1c1a18' }}>
              {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9a8878' }}>{percentSold}% sold</span>
            <span style={{ fontSize: '0.7rem', color: '#9a8878' }}>{competition.maxTickets.toLocaleString()} total</span>
          </div>
          <div style={{ height: '3px', backgroundColor: '#e8d8cc', borderRadius: '1px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${percentSold}%`,
                background: 'linear-gradient(90deg, #b76e79, #d4959e)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Countdown */}
        {competition.drawDate && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', marginBottom: '0.5rem' }}>
              Draw closes in
            </p>
            <CountdownTimer drawDate={competition.drawDate} />
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/competitions/${competition.slug}`}
          className="btn-primary"
          style={{ width: '100%', textAlign: 'center', display: 'block' }}
        >
          Enter Now
        </Link>
      </div>
    </motion.div>
  )
}
