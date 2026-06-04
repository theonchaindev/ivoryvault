'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ count }: { count: number }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner__inner">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.05 }}>
          <div className="hero-banner__badge">
            <span className="hero-banner__badge-dot" />
            {count} Live Competition{count !== 1 ? 's' : ''} — Open Now
          </div>
          <h1 className="hero-banner__title">
            Win The <em>Extraordinary</em>
          </h1>
          <p className="hero-banner__sub">
            UK&apos;s most exciting luxury prize competitions. Tickets from just £1.
          </p>
        </motion.div>

        <motion.div
          className="hero-banner__right"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.25 }}
        >
          <div className="hero-banner__trust">
            {[
              { icon: '✓', label: 'UK Regulated' },
              { icon: '✓', label: 'Free Entry' },
              { icon: '✓', label: 'Live Recorded Draws' },
              { icon: '✓', label: '18+ Only' },
            ].map(t => (
              <span key={t.label} className="hero-banner__trust-item">
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
          <div className="hero-banner__ctas">
            <Link href="/competitions" className="btn-gold">Browse Competitions</Link>
            <Link href="/how-it-works" style={{ fontSize: '.6875rem', color: 'var(--ink3)', letterSpacing: '.08em', textDecoration: 'none', transition: 'color .2s' }}>How it works →</Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
