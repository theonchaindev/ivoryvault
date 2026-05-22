'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

interface CountdownTimerProps {
  drawDate: string
}

export default function CountdownTimer({ drawDate }: CountdownTimerProps) {
  const [time, setTime] = useState(() => getTimeRemaining(drawDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(drawDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [drawDate])

  if (time.total <= 0) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b76e79' }}>
          Draw Complete
        </span>
      </div>
    )
  }

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hrs' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ]

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {units.map((unit, i) => (
        <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'var(--champagne, #fdf6ef)',
              border: '1px solid #e8d8cc',
              padding: '0.5rem 0.75rem',
              minWidth: '52px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#b76e79',
                lineHeight: 1,
              }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#9a8878',
                marginTop: '2px',
              }}
            >
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span style={{ color: '#b76e79', fontSize: '1.25rem', fontFamily: 'var(--font-cormorant)', lineHeight: 1 }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}
