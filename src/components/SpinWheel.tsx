'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { WHEEL_SEGMENTS, formatPrize } from '@/lib/wheel'

const N = WHEEL_SEGMENTS.length
const SEG = 360 / N

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function segmentPath(i: number, cx: number, cy: number, r: number) {
  const a = polar(cx, cy, r, i * SEG)
  const b = polar(cx, cy, r, (i + 1) * SEG)
  return `M${cx},${cy} L${a.x},${a.y} A${r},${r} 0 0 1 ${b.x},${b.y} Z`
}

export default function SpinWheel({ freeSpins, startCredit }: { freeSpins: number; startCredit: number }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spins, setSpins] = useState(freeSpins)
  const [credit, setCredit] = useState(startCredit)
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null)
  const [error, setError] = useState('')

  const cx = 150, cy = 150, r = 145

  const spin = async () => {
    if (spinning || spins < 1) return
    setSpinning(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/spin', { method: 'POST' })
      const data = await res.json()
      if (res.status === 401) { window.location.href = '/login?from=/spin'; return }
      if (!res.ok) {
        if (data.error === 'no-spins') { setSpins(0); setCredit(data.siteCredit ?? credit) }
        else setError(data.error || 'Spin failed')
        setSpinning(false); return
      }
      const target = data.index as number
      const segCentre = target * SEG + SEG / 2
      const final = rotation + 6 * 360 + ((360 - (rotation % 360)) - segCentre + 360) % 360
      setRotation(final)
      setTimeout(() => {
        setResult({ win: data.win, amount: data.amount })
        setCredit(data.siteCredit ?? credit)
        setSpins(data.freeSpins ?? Math.max(0, spins - 1))
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
        <p className="sw__eyebrow">Spin &amp; Win</p>
        <h1 className="sw__title">Spin the <em>Wheel</em></h1>
        <p className="sw__sub">Land a WIN and we&apos;ll drop site credit straight into your account. Earn more spins by climbing tiers and every 50 tickets.</p>
        <div className="sw__spins-pill">{spins} free spin{spins === 1 ? '' : 's'} available</div>
      </div>

      <div className="sw__stage">
        <div className="sw__pointer" />
        <motion.div className="sw__wheel" animate={{ rotate: rotation }} transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            {WHEEL_SEGMENTS.map((seg, i) => {
              const mid = i * SEG + SEG / 2
              const lp = polar(cx, cy, r * 0.7, mid)
              return (
                <g key={i}>
                  <path d={segmentPath(i, cx, cy, r)} fill={seg.win ? 'var(--gold)' : '#18140f'} stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={lp.x} y={lp.y}
                    fill={seg.win ? '#18140f' : '#fff'} fontSize="13" fontWeight="800"
                    textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${mid} ${lp.x} ${lp.y})`}
                  >
                    {seg.win ? (
                      <tspan x={lp.x} dy="0">WIN</tspan>
                    ) : (
                      <>
                        <tspan x={lp.x} dy="-0.45em">NO</tspan>
                        <tspan x={lp.x} dy="1em">WIN</tspan>
                      </>
                    )}
                  </text>
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth="3" />
          </svg>
          <div className="sw__hub" />
        </motion.div>
      </div>

      <div className="sw__foot">
        {result ? (
          <motion.div className="sw__result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            {result.win ? (
              <>
                <p className="sw__result-big">🎉 You won {formatPrize(result.amount)}!</p>
                <p className="sw__result-sub">Balance now <strong>£{credit.toFixed(2)}</strong> site credit.</p>
              </>
            ) : (
              <>
                <p className="sw__result-big">So close! No win this time.</p>
                <p className="sw__result-sub">Earn more spins by entering competitions and climbing tiers.</p>
              </>
            )}
            {spins > 0
              ? <button className="sw__spin-btn" onClick={() => setResult(null)} style={{ marginTop: '1.25rem' }}>Spin Again ({spins})</button>
              : <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.25rem' }}>Browse Competitions</Link>}
          </motion.div>
        ) : spins < 1 ? (
          <div className="sw__result">
            <p className="sw__result-sub">You&apos;ve used all your free spins.</p>
            <p className="sw__result-sub">Balance: <strong>£{credit.toFixed(2)}</strong> · Earn more by entering competitions.</p>
            <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.25rem' }}>Browse Competitions</Link>
          </div>
        ) : (
          <>
            <button className="sw__spin-btn" onClick={spin} disabled={spinning}>
              {spinning ? 'Spinning…' : 'SPIN THE WHEEL'}
            </button>
            {error && <p className="sw__error">{error}</p>}
            <p className="sw__terms">18+ · Credit applies at checkout</p>
          </>
        )}
      </div>

      <style>{`
        .sw { max-width: 560px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .sw__eyebrow { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: .75rem; }
        .sw__title { font-size: clamp(2rem,5vw,3rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); line-height: 1; }
        .sw__title em { font-style: normal; color: var(--gold); }
        .sw__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; max-width: 420px; margin: 1rem auto 0; }
        .sw__spins-pill { display: inline-block; margin-top: 1.25rem; padding: .5rem 1.125rem; border-radius: 999px; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .75rem; font-weight: 800; letter-spacing: .04em; }

        .sw__stage { position: relative; width: min(440px,92vw); aspect-ratio: 1; margin: 2rem auto 0; }
        .sw__pointer { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); z-index: 3; width: 0; height: 0; border-left: 16px solid transparent; border-right: 16px solid transparent; border-top: 26px solid var(--gold); filter: drop-shadow(0 2px 4px rgba(0,0,0,.35)); }
        .sw__wheel { width: 100%; height: 100%; position: relative; border-radius: 50%; box-shadow: 0 20px 50px rgba(0,0,0,.3), 0 0 0 8px var(--card), 0 0 0 9px var(--border); }
        .sw__hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 44px; height: 44px; border-radius: 50%; background: var(--gold); box-shadow: 0 2px 10px rgba(0,0,0,.3); border: 3px solid #fff; }

        .sw__foot { margin-top: 2.25rem; }
        .sw__spin-btn { background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .9375rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 1.125rem 3rem; border-radius: var(--r-btn); box-shadow: 0 10px 28px rgba(201,168,76,.4); transition: background .2s, transform .15s; }
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
