'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

function FaqItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      className="faq-item"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease, delay: index * 0.05 }}
    >
      <button className="faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{faq.q}</span>
        <motion.span
          className="faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <p className="faq-a">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface Props {
  faqs: { q: string; a: string }[]
  compliance: string[]
  children: React.ReactNode
}

export default function HowItWorksClient({ faqs, compliance, children }: Props) {
  const compRef = useRef<HTMLDivElement>(null)
  const compInView = useInView(compRef, { once: true, margin: '-60px' })

  return (
    <div className="hiw-page">
      {/* Hero */}
      <section className="hiw-hero">
        <div className="hiw-inner">
          <motion.p
            className="hiw-label"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            The Process
          </motion.p>
          <motion.h1
            className="hiw-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.2 }}
          >
            How It Works
          </motion.h1>
          <motion.p
            className="hiw-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.32 }}
          >
            Transparent, fair, and fully UK compliant. Every detail of our competition process is designed with integrity.
          </motion.p>
        </div>
      </section>

      {/* Steps from HowItWorks component */}
      {children}

      {/* UK Compliance */}
      <section className="hiw-compliance">
        <div className="hiw-inner hiw-inner--narrow" ref={compRef}>
          <motion.h2
            className="hiw-section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={compInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.65, ease }}
          >
            UK Competition Law Compliance
          </motion.h2>
          <div className="hiw-compliance-list">
            {compliance.map((item, i) => (
              <motion.div
                key={i}
                className="hiw-compliance-item"
                initial={{ opacity: 0, x: -20 }}
                animate={compInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease, delay: i * 0.07 }}
              >
                <span className="hiw-compliance-dot" />
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={compInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '2.5rem' }}
          >
            <Link href="/free-entry" className="btn-ghost">View Free Entry Instructions →</Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hiw-faq">
        <div className="hiw-inner hiw-inner--narrow">
          <motion.h2
            className="hiw-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease }}
            style={{ marginBottom: '2.5rem' }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            style={{ textAlign: 'center', marginTop: '3.5rem' }}
          >
            <p style={{ color: 'var(--ink3)', marginBottom: '1rem', fontSize: '.9rem' }}>Still have questions?</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contact" className="btn-rg">Contact Us</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .hiw-page { background: var(--off); }
        .hiw-hero { background: #fff; border-bottom: 1px solid var(--border); padding: clamp(5rem,8vw,8rem) 2rem clamp(3rem,5vw,4rem); }
        .hiw-inner { max-width: 1280px; margin: 0 auto; padding: 0 clamp(0rem,0vw,0rem); }
        .hiw-inner--narrow { max-width: 800px; }
        .hiw-label { font-size: .5875rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .875rem; }
        .hiw-title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5rem); font-weight: 300; color: var(--ink); line-height: .95; letter-spacing: -.02em; margin-bottom: .875rem; }
        .hiw-sub { font-family: var(--font-cormorant,serif); font-size: clamp(1rem,2vw,1.25rem); font-style: italic; color: var(--ink3); max-width: 560px; line-height: 1.6; }
        .hiw-section-title { font-family: var(--font-cormorant,serif); font-size: clamp(1.75rem,3vw,2.5rem); font-weight: 400; color: var(--ink); }
        .hiw-compliance { padding: clamp(4rem,7vw,6rem) 2rem; background: #fff; border-top: 1px solid var(--border); }
        .hiw-compliance-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.75rem; }
        .hiw-compliance-item { display: flex; gap: 1rem; align-items: flex-start; font-size: .875rem; color: var(--ink2); line-height: 1.75; }
        .hiw-compliance-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg); margin-top: 8px; flex-shrink: 0; }
        .hiw-faq { padding: clamp(4rem,7vw,7rem) 2rem clamp(5rem,8vw,8rem); }
        .faq-list { display: flex; flex-direction: column; }
        .faq-item { border-bottom: 1px solid var(--border); overflow: hidden; }
        .faq-q {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 0; text-align: left;
          background: none; border: none; cursor: pointer;
          font-family: var(--font-cormorant,serif); font-size: clamp(1.0625rem,2vw,1.25rem);
          font-weight: 500; color: var(--ink); gap: 1rem;
          transition: color .2s;
        }
        .faq-q:hover { color: var(--rg); }
        .faq-icon { font-size: 1.5rem; font-weight: 300; color: var(--rg); flex-shrink: 0; line-height: 1; display: block; }
        .faq-a-wrap { overflow: hidden; }
        .faq-a { padding: 0 0 1.5rem; font-size: .9rem; color: var(--ink2); line-height: 1.8; }
      `}</style>
    </div>
  )
}
