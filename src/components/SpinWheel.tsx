'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { WHEEL_SEGMENTS, formatPrize } from '@/lib/wheel'

const N = WHEEL_SEGMENTS.length
const SEG = 360 / N

// Alternating segment fills for contrast
const fills = ['#18140f', '#2a2118']

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function segmentPath(i: number, cx: number, cy: number, r: number) {
  const start = i * SEG
  const end = (i + 1) * SEG
  const a = polar(cx, cy, r, start)
  const b = polar(cx, cy, r, end)
  const large = SEG > 180 ? 1 : 0
  return `M${cx},${cy} L${a.x},${a.y} A${r},${r} 0 ${large} 1 ${b.x},${b.y} Z`
}

export default function SpinWheel({ alreadySpun, startCredit }: { alreadySpun: boolean; startCredit: number }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [done, setDone] = useState(alreadySpun)
  const [won, setWon] = useState<number | null>(null)
  const [credit, setCredit] = useState(startCredit)
  const [error, setError] = useState('')

  const cx = 150, cy = 150, r = 145

  const spin = async () => {
    if (spinning || done) return
    setSpinning(true); setError('')
    try {
      const res = await fetch('/api/spin', { method: 'POST' })
      const data = await res.json()
      if (res.status === 401) { window.location.href = '/login?from=/spin'; return }
      if (!res.ok) {
        if (data.error === 'already') { setDone(true); setCredit(data.siteCredit ?? credit); setError('You have already claimed your free spin.') }
        else setError(data.error || 'Spin failed')
        setSpinning(false)
        return
      }
      // Land the pointer (top, 0deg) on the centre of the winning segment.
      const target = data.index as number
      const segCentre = target * SEG + SEG / 2
      const spins = 6 // full rotations for drama
      const final = spins * 360 + (360 - segCentre)
      setRotation(final)
      setTimeout(() => {
        setWon(data.amount)
        setCredit(data.siteCredit ?? credit + data.amount)
        setDone(true)
        setSpinning(false)
      }, 4200)
    } catch {
      setError('Something went wrong. Please try again.')
      setSpinning(false)
    }
  }

  return (
    <div className="sw">
      <div className="sw__head">
        <p className="sw__eyebrow">Welcome Gift</p>
        <h1 className="sw__title">Spin to Win <em>Free Credit</em></h1>
        <p className="sw__sub">One free spin for new members — the credit lands straight in your account to use on any competition.</p>
      </div>

      <div className="sw__stage">
        {/* Pointer */}
        <div className="sw__pointer" />

        {/* Wheel */}
        <motion.div
          className="sw__wheel"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            {WHEEL_SEGMENTS.map((amt, i) => {
              const mid = i * SEG + SEG / 2
              const lp = polar(cx, cy, r * 0.66, mid)
              return (
                <g key={i}>
                  <path d={segmentPath(i, cx, cy, r)} fill={fills[i % 2]} stroke="var(--gold)" strokeWidth="1" />
                  <text
                    x={lp.x} y={lp.y}
                    fill="#fff" fontSize="17" fontWeight="800"
                    textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${mid} ${lp.x} ${lp.y})`}
                  >
                    {formatPrize(amt)}
                  </text>
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--gold)" strokeWidth="3" />
          </svg>
          <div className="sw__hub" />
        </motion.div>
      </div>

      {/* Result / CTA */}
      <div className="sw__foot">
        {won !== null ? (
          <motion.div className="sw__result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <p className="sw__result-big">🎉 You won {formatPrize(won)}!</p>
            <p className="sw__result-sub">Your balance is now <strong>£{credit.toFixed(2)}</strong> in site credit.</p>
            <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.25rem' }}>Use It — Browse Competitions</Link>
          </motion.div>
        ) : done ? (
          <div className="sw__result">
            <p className="sw__result-sub">{error || 'You have already claimed your free spin.'}</p>
            <p className="sw__result-sub">Current balance: <strong>£{credit.toFixed(2)}</strong></p>
            <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.25rem' }}>Browse Competitions</Link>
          </div>
        ) : (
          <>
            <button className="sw__spin-btn" onClick={spin} disabled={spinning}>
              {spinning ? 'Spinning…' : 'SPIN THE WHEEL'}
            </button>
            {error && <p className="sw__error">{error}</p>}
            <p className="sw__terms">One spin per member · 18+ · Credit applies at checkout</p>
          </>
        )}
      </div>

      <style>{`
        .sw { max-width: 560px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .sw__eyebrow { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: .75rem; }
        .sw__title { font-size: clamp(2rem,5vw,3rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); line-height: 1; }
        .sw__title em { font-style: normal; color: var(--gold); display: block; }
        .sw__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; max-width: 420px; margin: 1rem auto 0; }

        .sw__stage { position: relative; width: min(340px, 86vw); aspect-ratio: 1; margin: 2.5rem auto 0; }
        .sw__pointer {
          position: absolute; top: -6px; left: 50%; transform: translateX(-50%); z-index: 3;
          width: 0; height: 0; border-left: 16px solid transparent; border-right: 16px solid transparent;
          border-top: 26px solid var(--gold); filter: drop-shadow(0 2px 4px rgba(0,0,0,.35));
        }
        .sw__wheel { width: 100%; height: 100%; position: relative; border-radius: 50%; box-shadow: 0 20px 50px rgba(0,0,0,.3), 0 0 0 8px var(--card), 0 0 0 9px var(--border); }
        .sw__hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 44px; height: 44px; border-radius: 50%; background: var(--gold); box-shadow: 0 2px 10px rgba(0,0,0,.3); border: 3px solid #fff; }

        .sw__foot { margin-top: 2.5rem; }
        .sw__spin-btn {
          background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit;
          font-size: .9375rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          padding: 1.125rem 3rem; border-radius: var(--r-btn);
          box-shadow: 0 10px 28px rgba(201,168,76,.4); transition: background .2s, transform .15s;
        }
        .sw__spin-btn:hover:not(:disabled) { background: var(--gold-d); transform: translateY(-2px); }
        .sw__spin-btn:disabled { opacity: .65; cursor: not-allowed; }
        .sw__terms { font-size: .6875rem; color: var(--ink3); margin-top: 1rem; letter-spacing: .03em; }
        .sw__error { color: #c0392b; font-size: .8125rem; margin-top: .875rem; }
        .sw__result-big { font-size: 1.5rem; font-weight: 800; color: var(--ink); }
        .sw__result-sub { font-size: .9375rem; color: var(--ink2); margin-top: .5rem; }
        .sw__result-sub strong { color: var(--gold); }
      `}</style>
    </div>
  )
}
