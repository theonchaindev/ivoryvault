'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

export default function CountdownTimer({ drawDate, compact = false }: { drawDate: string; compact?: boolean }) {
  const [time, setTime] = useState(() => getTimeRemaining(drawDate))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeRemaining(drawDate)), 1000)
    return () => clearInterval(id)
  }, [drawDate])

  if (time.total <= 0) {
    return <span style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b76e79' }}>Draw Complete</span>
  }

  const units = [
    { value: time.days, label: 'D' },
    { value: time.hours, label: 'H' },
    { value: time.minutes, label: 'M' },
    { value: time.seconds, label: 'S' },
  ]

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a7f76', marginRight: '0.25rem' }}>Draw in</span>
        {units.map((u, i) => (
          <div key={u.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.125rem', fontWeight: 500, color: '#141210', lineHeight: 1 }}>
                {String(u.value).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.5rem', letterSpacing: '0.08em', color: '#8a7f76', textTransform: 'uppercase' }}>{u.label}</span>
            </div>
            {i < units.length - 1 && <span style={{ color: '#c8b4a0', fontSize: '0.75rem' }}>·</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'stretch' }}>
      {units.map((u, i) => (
        <div key={u.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', border: '1px solid #e2d0c0', padding: '0.625rem 0.875rem', minWidth: '56px' }}>
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 500, color: '#141210', lineHeight: 1 }}>
              {String(u.value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a7f76', marginTop: '3px' }}>{u.label}</span>
          </div>
          {i < units.length - 1 && <span style={{ color: '#c8b4a0', fontSize: '1rem', alignSelf: 'center' }}>:</span>}
        </div>
      ))}
    </div>
  )
}
