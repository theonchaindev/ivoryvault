'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

export default function CountdownTimer({ drawDate, compact = false }: { drawDate: string; compact?: boolean }) {
  const [t, setT] = useState(() => getTimeRemaining(drawDate))

  useEffect(() => {
    const id = setInterval(() => setT(getTimeRemaining(drawDate)), 1000)
    return () => clearInterval(id)
  }, [drawDate])

  if (t.total <= 0) {
    return <span style={{ fontSize: '.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--rg)' }}>Draw Complete</span>
  }

  const units = [
    { v: t.days, l: 'D' },
    { v: t.hours, l: 'H' },
    { v: t.minutes, l: 'M' },
    { v: t.seconds, l: 'S' },
  ]

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.5625rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginRight: '.25rem' }}>Closes in</span>
        {units.map((u, i) => (
          <span key={u.l} style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.125rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>{String(u.v).padStart(2, '0')}</span>
            <span style={{ fontSize: '.5rem', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{u.l}</span>
            {i < units.length - 1 && <span style={{ color: 'var(--border)', marginLeft: '.25rem' }}>·</span>}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '.5rem' }}>
      {units.map((u, i) => (
        <div key={u.l} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--off)', border: '1px solid var(--border)', padding: '.625rem .875rem', minWidth: '54px' }}>
            <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.875rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1 }}>{String(u.v).padStart(2, '0')}</span>
            <span style={{ fontSize: '.5rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginTop: '3px' }}>{u.l}</span>
          </div>
          {i < units.length - 1 && <span style={{ color: 'var(--border)', fontSize: '.875rem' }}>:</span>}
        </div>
      ))}
    </div>
  )
}
