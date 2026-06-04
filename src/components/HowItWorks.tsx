'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const steps = [
  { n: '01', title: 'Choose', body: 'Browse our curated luxury competitions and select the prize you want to win.' },
  { n: '02', title: 'Enter', body: 'Pick your ticket quantity. More entries means more chances. Complete checkout via Stripe.' },
  { n: '03', title: 'Watch', body: 'All draws are live-recorded and fully transparent. You can watch every single one.' },
  { n: '04', title: 'Win', body: 'Winners are notified instantly and prizes dispatched within 48 hours of the draw.' },
]

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="hiw" ref={ref}>
      <div className="hiw__inner">
        <motion.div
          className="hiw__head"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hiw__label">Simple Process</p>
          <h2 className="hiw__title">How It <em>Works</em></h2>
          <Link href="/how-it-works" className="hiw__link">Full details →</Link>
        </motion.div>

        <div className="hiw__grid">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              className="hiw__step"
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.1 }}
            >
              <p className="hiw__num">{s.n}</p>
              <div className="hiw__dot" />
              <h3 className="hiw__step-title">{s.title}</h3>
              <p className="hiw__step-body">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .hiw { padding: clamp(5rem,8vw,8rem) 0; background: #fff; border-top: 1px solid var(--border); }
        .hiw__inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem); }
        .hiw__head { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: clamp(3rem,5vw,5rem); }
        .hiw__label { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .75rem; }
        .hiw__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,5vw,4.5rem); font-weight: 300; line-height: .95; letter-spacing: -.02em; color: var(--ink); }
        .hiw__title em { font-style: italic; }
        .hiw__link { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; align-self: flex-end; transition: color .2s, border-color .2s; }
        .hiw__link:hover { color: var(--rg); border-color: var(--rg); }
        .hiw__grid { display: grid; grid-template-columns: repeat(4,1fr); border-top: 1px solid var(--border); }
        @media (max-width: 768px) { .hiw__grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .hiw__grid { grid-template-columns: 1fr; } }
        .hiw__step { padding: clamp(2rem,3vw,2.75rem) clamp(1.25rem,2vw,2rem); border-right: 1px solid var(--border); }
        .hiw__step:last-child { border-right: none; }
        @media (max-width: 768px) { .hiw__step:nth-child(2) { border-right: none; } .hiw__step:nth-child(3) { border-right: 1px solid var(--border); } }
        .hiw__num { font-family: var(--font-cormorant,serif); font-size: clamp(4rem,6vw,7rem); font-weight: 300; line-height: 1; color: var(--border); letter-spacing: -.03em; margin-bottom: 1.25rem; }
        .hiw__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg); margin-bottom: 1.25rem; }
        .hiw__step-title { font-family: var(--font-cormorant,serif); font-size: clamp(1.375rem,2vw,1.75rem); font-weight: 500; color: var(--ink); margin-bottom: .75rem; }
        .hiw__step-body { font-size: .8125rem; line-height: 1.8; color: var(--ink2); }
      `}</style>
    </section>
  )
}
