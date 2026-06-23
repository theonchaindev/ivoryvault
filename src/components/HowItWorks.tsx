'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import StarDivider from './StarDivider'

const steps = [
  { n: '01', title: 'Choose', body: 'Browse our curated luxury competitions and pick the prize you want to win.' },
  { n: '02', title: 'Enter', body: 'Select your ticket quantity. More entries = more chances. Complete checkout via Stripe.' },
  { n: '03', title: 'Watch', body: 'All draws are live-recorded and fully transparent. Watch every single one.' },
  { n: '04', title: 'Win', body: 'Winners notified instantly. Prizes dispatched within 48 hours of the draw.' },
]

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="hiw" ref={ref}>
      <div className="hiw__inner">
        <motion.div
          className="hiw__head"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="hiw__label">Simple Process</p>
            <h2 className="hiw__title">How It <em>Works</em></h2>
          </div>
          <Link href="/how-it-works" className="hiw__link">Full details →</Link>
        </motion.div>

        <div style={{ margin: '0 0 clamp(2rem,4vw,3rem)' }}><StarDivider /></div>

        <div className="hiw__grid">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              className="hiw__step"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="hiw__dot" />
              <h3 className="hiw__step-title">{s.title}</h3>
              <p className="hiw__step-body">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
