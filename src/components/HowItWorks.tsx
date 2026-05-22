'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Choose a Competition',
    description: 'Browse our curated selection of luxury prizes — from timepieces to cash and beyond. Each competition is handpicked for excellence.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="#b76e79" strokeWidth="1" />
        <path d="M9 14 L13 18 L19 10" stroke="#b76e79" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Select Your Tickets',
    description: 'Choose how many tickets you wish to purchase. More tickets increases your chances — each entry is unique and securely logged.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="8" width="18" height="12" rx="0" stroke="#b76e79" strokeWidth="1" />
        <path d="M9 14 H19 M14 10 V18" stroke="#b76e79" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Complete Payment',
    description: 'Secure checkout powered by Stripe. We accept all major cards, Apple Pay and Google Pay. Your entry is confirmed instantly.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="14" rx="0" stroke="#b76e79" strokeWidth="1" />
        <path d="M4 13 H24" stroke="#b76e79" strokeWidth="1.5" />
        <rect x="8" y="17" width="6" height="2" fill="#b76e79" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Watch the Draw',
    description: 'All draws are conducted live and recorded for full transparency. Winners are notified immediately and prizes dispatched within 7 days.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#b76e79" strokeWidth="1" />
        <path d="M11 10 L20 14 L11 18 Z" fill="#b76e79" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      style={{
        padding: '6rem 2rem',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', marginBottom: '4rem' }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#b76e79',
            marginBottom: '0.75rem',
          }}
        >
          The Process
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 600,
            color: '#1c1a18',
            lineHeight: 1.1,
          }}
        >
          How It Works
        </h2>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0',
          position: 'relative',
        }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              padding: '2.5rem 2rem',
              borderRight: i < steps.length - 1 ? '1px solid #e8d8cc' : 'none',
              position: 'relative',
            }}
          >
            {/* Step number */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '3.5rem',
                  fontWeight: 300,
                  color: '#e8d8cc',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                {step.number}
              </span>
              <div style={{ marginTop: '-0.5rem' }}>
                {step.icon}
              </div>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.375rem',
                fontWeight: 600,
                color: '#1c1a18',
                marginBottom: '0.75rem',
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.75,
                color: '#5c524a',
              }}
            >
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
