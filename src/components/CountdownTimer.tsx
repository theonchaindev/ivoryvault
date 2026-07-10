'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

type Variant = 'dark' | 'light' | 'strip' | 'hero'

export default function CountdownTimer({
  drawDate,
  compact = false,
  variant = 'dark',
}: {
  drawDate: string
  compact?: boolean
  variant?: Variant
}) {
  const [t, setT] = useState(() => getTimeRemaining(drawDate))

  useEffect(() => {
    const id = setInterval(() => setT(getTimeRemaining(drawDate)), 1000)
    return () => clearInterval(id)
  }, [drawDate])

  if (t.total <= 0) {
    return <span style={{ fontSize: '.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Draw Complete</span>
  }

  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hrs' },
    { v: t.minutes, l: 'Mins' },
    { v: t.seconds, l: 'Secs' },
  ]

  /* ── Card strip (on competition cards — cream rounded boxes) ── */
  if (variant === 'strip') {
    return (
      <div className="ct-strip">
        {units.map(u => (
          <div key={u.l} className="ct-strip__box">
            <span className="ct-strip__num">{String(u.v).padStart(2, '0')}</span>
            <span className="ct-strip__lbl">{u.l}</span>
          </div>
        ))}
      </div>
    )
  }

  /* ── Hero variant (on dark hero — translucent boxes, gold numbers) ── */
  if (variant === 'hero') {
    return (
      <div style={{ display: 'flex', gap: '.625rem' }}>
        {units.map(u => (
          <div key={u.l} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: '10px',
            padding: '.625rem .875rem', minWidth: '58px',
          }}>
            <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.875rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              {String(u.v).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '.42rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginTop: '3px' }}>
              {u.l}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const light = variant === 'light'

  /* ── Compact inline ── */
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.5rem', letterSpacing: '.14em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.55)' : 'var(--ink3)', marginRight: '.125rem' }}>Closes in</span>
        {units.map((u, i) => (
          <span key={u.l} style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.125rem', fontWeight: 600, color: light ? '#fff' : 'var(--ink)', lineHeight: 1 }}>
              {String(u.v).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '.5rem', color: light ? 'rgba(255,255,255,.5)' : 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {u.l.charAt(0)}
            </span>
            {i < units.length - 1 && <span style={{ color: light ? 'rgba(255,255,255,.25)' : 'var(--border)', marginLeft: '.25rem' }}>·</span>}
          </span>
        ))}
      </div>
    )
  }

  /* ── Full block (default / competition detail) ── */
  return (
    <div style={{ display: 'flex', gap: '.625rem' }}>
      {units.map(u => (
        <div key={u.l} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: light ? 'rgba(255,255,255,.12)' : 'var(--ink)',
          border: `1px solid ${light ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)'}`,
          padding: '.75rem 1rem', minWidth: '62px',
          borderRadius: '10px',
        }}>
          <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1 }}>
            {String(u.v).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '.45rem', letterSpacing: '.14em', textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.55)', marginTop: '4px' }}>
            {u.l}
          </span>
        </div>
      ))}
    </div>
  )
}

