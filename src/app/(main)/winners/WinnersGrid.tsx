'use client'

import { motion } from 'motion/react'

interface Winner {
  id: string
  name: string
  competitionTitle: string
  drawDate: string | null
  image: string
}

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'To be announced'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7ea2f0', marginBottom: '.15rem' }}>
      {children}
    </span>
  )
}

export default function WinnersGrid({ winners }: { winners: Winner[] }) {
  if (winners.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '520px', margin: '0 auto' }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏆</div>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.5rem' }}>
          Our first winners are on the way
        </h2>
        <p style={{ color: 'var(--ink3)', fontSize: '.95rem', lineHeight: 1.7 }}>
          Every draw is recorded and independently verifiable. As soon as our first competitions close,
          the lucky winners will be celebrated right here.
        </p>
      </motion.div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.75rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {winners.map((w, i) => (
        <motion.article
          key={w.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: (i % 3) * 0.09, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -6 }}
          style={{
            background: 'linear-gradient(165deg, #1b2432 0%, #131a26 100%)',
            border: '1px solid rgba(126,162,240,0.28)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 14px 40px rgba(19,26,38,0.28)',
          }}
        >
          {/* Photo */}
          <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
            <img src={w.image} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(19,26,38,0.55), transparent 55%)' }} />
            <span
              style={{
                position: 'absolute', top: '12px', left: '12px',
                background: 'var(--gold)', color: '#fff',
                fontSize: '.58rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase',
                padding: '.35rem .7rem', borderRadius: '999px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.45)',
              }}
            >
              ★ Winner
            </span>
          </div>

          {/* Details */}
          <div style={{ padding: '1.35rem 1.4rem 1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
              {w.competitionTitle}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              <div>
                <Label>Draw Date</Label>
                <span style={{ color: '#dbe4f2', fontSize: '.9rem', fontWeight: 500 }}>{fmtDate(w.drawDate)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(126,162,240,0.16)', paddingTop: '.8rem' }}>
                <Label>Winner</Label>
                <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>{w.name}</span>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
