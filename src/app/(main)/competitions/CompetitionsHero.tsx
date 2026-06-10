'use client'

import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export default function CompetitionsHero({ count }: { count: number }) {
  return (
    <section className="ch">
      <div className="ch__inner">
        <motion.p
          className="ch__label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Enter to Win
        </motion.p>
        <motion.h1
          className="ch__title"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.2 }}
        >
          All Competitions
        </motion.h1>
        <motion.p
          className="ch__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.32 }}
        >
          {count} live competition{count !== 1 ? 's' : ''} available now
        </motion.p>
      </div>

      <style>{`
        .ch {
          background: #fff; border-bottom: 1px solid var(--border);
          padding: clamp(5rem,8vw,8rem) 2rem clamp(2.5rem,4vw,3.5rem);
        }
        .ch__inner { max-width: 1280px; margin: 0 auto; }
        .ch__label { font-size: .5875rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .875rem; }
        .ch__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5rem); font-weight: 700; color: var(--ink); line-height: .95; letter-spacing: -.02em; margin-bottom: .75rem; }
        .ch__sub { font-family: var(--font-cormorant,serif); font-size: clamp(1rem,2vw,1.25rem); font-style: italic; color: var(--ink3); }
      `}</style>
    </section>
  )
}
