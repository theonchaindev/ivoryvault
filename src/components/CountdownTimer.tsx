'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

export default function CountdownTimer({
  drawDate,
  compact = false,
  variant = 'dark',
}: {
  drawDate: string
  compact?: boolean
  variant?: 'dark' | 'light' | 'strip'
}) {
  const [t, setT] = useState(() => getTimeRemaining(drawDate))

  useEffect(() => {
    const id = setInterval(() => setT(getTimeRemaining(drawDate)), 1000)
    return () => clearInterval(id)
  }, [drawDate])

  if (t.total <= 0) {
    return (
      <span style={{ fontSize: '.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--rg)' }}>
        Draw Complete
      </span>
    )
  }

  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hrs' },
    { v: t.minutes, l: 'Mins' },
    { v: t.seconds, l: 'Secs' },
  ]

  /* ── Strip variant: 4 dark boxes side-by-side ── */
  if (variant === 'strip') {
    return (
      <div className="ct-strip">
        {units.map((u, i) => (
          <div key={u.l} className="ct-strip__box">
            <span className="ct-strip__num">{String(u.v).padStart(2, '0')}</span>
            <span className="ct-strip__lbl">{u.l}</span>
            {i < units.length - 1 && <span className="ct-strip__sep">:</span>}
          </div>
        ))}
        <style>{`
          .ct-strip { display: flex; width: 100%; }
          .ct-strip__box {
            flex: 1; display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: .5rem .25rem; position: relative;
            border-right: 1px solid rgba(255,255,255,.08);
          }
          .ct-strip__box:last-child { border-right: none; }
          .ct-strip__num {
            font-family: var(--font-cormorant,serif); font-size: 1.375rem;
            font-weight: 500; color: #fff; line-height: 1;
          }
          .ct-strip__lbl {
            font-size: .45rem; letter-spacing: .12em; text-transform: uppercase;
            color: rgba(255,255,255,.45); margin-top: 2px;
          }
          .ct-strip__sep { display: none; }
        `}</style>
      </div>
    )
  }

  const light = variant === 'light'

  /* ── Compact variant ── */
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '.5rem', letterSpacing: '.14em', textTransform: 'uppercase',
          color: light ? 'rgba(255,255,255,.55)' : 'var(--ink3)',
          marginRight: '.125rem',
        }}>
          Closes in
        </span>
        {units.map((u, i) => (
          <span key={u.l} style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant,serif)',
              fontSize: light ? '1.25rem' : '1.125rem',
              fontWeight: 600,
              color: light ? '#fff' : 'var(--ink)',
              lineHeight: 1,
            }}>
              {String(u.v).padStart(2, '0')}
            </span>
            <span style={{
              fontSize: '.5rem',
              color: light ? 'rgba(255,255,255,.5)' : 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              {u.l.charAt(0)}
            </span>
            {i < units.length - 1 && (
              <span style={{ color: light ? 'rgba(255,255,255,.25)' : 'var(--border)', marginLeft: '.25rem' }}>·</span>
            )}
          </span>
        ))}
      </div>
    )
  }

  /* ── Full block variant ── */
  return (
    <div style={{ display: 'flex', gap: '.5rem' }}>
      {units.map((u, i) => (
        <div key={u.l} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: light ? 'rgba(255,255,255,.12)' : 'var(--off)',
            border: `1px solid ${light ? 'rgba(255,255,255,.2)' : 'var(--border)'}`,
            padding: '.625rem .875rem', minWidth: '54px',
          }}>
            <span style={{
              fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.875rem',
              fontWeight: 400, color: light ? '#fff' : 'var(--ink)', lineHeight: 1,
            }}>
              {String(u.v).padStart(2, '0')}
            </span>
            <span style={{
              fontSize: '.5rem', letterSpacing: '.14em', textTransform: 'uppercase',
              color: light ? 'rgba(255,255,255,.5)' : 'var(--ink3)', marginTop: '3px',
            }}>
              {u.l}
            </span>
          </div>
          {i < units.length - 1 && (
            <span style={{ color: light ? 'rgba(255,255,255,.3)' : 'var(--border)', fontSize: '.875rem' }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}
