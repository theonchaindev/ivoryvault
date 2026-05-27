'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const steps = [
  {
    n: '01',
    title: 'Choose a Competition',
    body: 'Browse our curated selection of luxury prizes — from timepieces to cash and beyond. Every competition is handpicked.',
  },
  {
    n: '02',
    title: 'Select Your Tickets',
    body: 'Choose how many tickets you want. More tickets means more chances. Each entry is unique and securely logged.',
  },
  {
    n: '03',
    title: 'Complete Payment',
    body: 'Secure checkout via Stripe. All major cards, Apple Pay and Google Pay accepted. Entry confirmed instantly.',
  },
  {
    n: '04',
    title: 'Watch the Draw',
    body: 'All draws are conducted live and recorded for full transparency. Winners notified immediately. Prizes dispatched within 48 hours.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div
      ref={ref}
      style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 5rem)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '24px', height: '1px', background: '#b76e79' }} />
          <span style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b76e79' }}>The Process</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.75rem, 5vw, 4.5rem)',
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#141210',
          }}
        >
          How It<br /><span style={{ fontStyle: 'italic' }}>Works</span>
        </h2>
      </motion.div>

      {/* Steps — horizontal strip with top number, dividing lines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', borderTop: '1px solid #e2d0c0' }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              padding: 'clamp(2rem, 3vw, 3rem) clamp(1.25rem, 2vw, 2.5rem)',
              borderRight: i < steps.length - 1 ? '1px solid #e2d0c0' : 'none',
              position: 'relative',
            }}
          >
            {/* Number — huge, light, decorative */}
            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4rem, 6vw, 7rem)',
                fontWeight: 300,
                lineHeight: 1,
                color: '#e8d8cc',
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
                userSelect: 'none',
              }}
            >
              {step.n}
            </p>

            {/* Rose dot accent */}
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b76e79', marginBottom: '1.25rem' }} />

            <h3
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
                fontWeight: 500,
                color: '#141210',
                lineHeight: 1.2,
                marginBottom: '0.875rem',
              }}
            >
              {step.title}
            </h3>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.75, color: '#4a423c' }}>{step.body}</p>
          </motion.div>
        ))}
      </div>

      <style>{`@media (max-width: 768px) { .how-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}
