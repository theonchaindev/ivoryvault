'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { formatPrize, type PrizeStatus } from '@/lib/instant'

interface Props {
  competitionId: string
  slug: string
  title: string
  spinsLeft: number
  status: PrizeStatus[]
}

// 8-segment wheel: alternating WINNER / UNLUCKY
const SEGMENTS = ['WINNER', 'UNLUCKY', 'WINNER', 'UNLUCKY', 'WINNER', 'UNLUCKY', 'WINNER', 'UNLUCKY']
const N = SEGMENTS.length
const SEG = 360 / N

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function segPath(i: number, cx: number, cy: number, r: number) {
  const a = polar(cx, cy, r, i * SEG), b = polar(cx, cy, r, (i + 1) * SEG)
  return `M${cx},${cy} L${a.x},${a.y} A${r},${r} 0 0 1 ${b.x},${b.y} Z`
}

export default function InstantReveal({ competitionId, slug, title, spinsLeft: initial, status: initialStatus }: Props) {
  const [started, setStarted] = useState(false)
  const [spins, setSpins] = useState(initial)
  const [status, setStatus] = useState(initialStatus)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null)
  const [error, setError] = useState('')

  const cx = 150, cy = 150, r = 145
  const winIdx = SEGMENTS.map((s, i) => (s === 'WINNER' ? i : -1)).filter(i => i >= 0)
  const loseIdx = SEGMENTS.map((s, i) => (s === 'UNLUCKY' ? i : -1)).filter(i => i >= 0)

  const spin = async () => {
    if (spinning || spins < 1) return
    setSpinning(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/instant/reveal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId }),
      })
      const data = await res.json()
      if (res.status === 401) { window.location.href = `/login?from=/instant/${slug}`; return }
      if (!res.ok) { setError(data.error === 'no-spins' ? 'No spins left.' : (data.error || 'Reveal failed')); setSpinning(false); return }

      const pool = data.win ? winIdx : loseIdx
      const target = pool[Math.floor(Math.random() * pool.length)]
      const segCentre = target * SEG + SEG / 2
      const final = rotation + 6 * 360 + ((360 - (rotation % 360)) - segCentre + 360) % 360
      setRotation(final)
      setTimeout(() => {
        setResult({ win: data.win, amount: data.amount })
        setSpins(data.spinsLeft ?? Math.max(0, spins - 1))
        if (data.status) setStatus(data.status)
        setSpinning(false)
      }, 3800)
    } catch {
      setError('Something went wrong. Please try again.')
      setSpinning(false)
    }
  }

  const totalPrizeCount = status.reduce((s, t) => s + t.total, 0)
  const prizesLeft = status.reduce((s, t) => s + t.left, 0)

  return (
    <div className="ir">
      <div className="ir__head">
        <span className="ir__badge">Instant Spin</span>
        <h1 className="ir__title">{title}</h1>
        <p className="ir__sub">Spin &amp; win instantly — prizes drop straight into your account as site credit.</p>
      </div>

      {/* Pre-reveal gate (like the Thank-you page CTA) */}
      {!started ? (
        <div className="ir__gate">
          {spins > 0 ? (
            <>
              <p className="ir__gate-count">{spins} instant spin{spins === 1 ? '' : 's'} ready</p>
              <button className="ir__reveal-btn" onClick={() => setStarted(true)}>Reveal Instant Spin Results</button>
            </>
          ) : (
            <>
              <p className="ir__gate-count">You have no spins for this competition.</p>
              <Link href={`/competitions/${slug}`} className="btn-gold" style={{ marginTop: '1rem' }}>Buy Spins</Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="ir__stage">
            <div className="ir__pointer" />
            <motion.div className="ir__wheel" animate={{ rotate: rotation }} transition={{ duration: 3.6, ease: [0.16, 1, 0.3, 1] }}>
              <svg viewBox="0 0 300 300" width="100%" height="100%">
                {SEGMENTS.map((s, i) => {
                  const mid = i * SEG + SEG / 2
                  const win = s === 'WINNER'
                  const flip = mid > 90 && mid < 270
                  const lp = polar(cx, cy, r * 0.52, mid)
                  return (
                    <g key={i}>
                      <path d={segPath(i, cx, cy, r)} fill={win ? '#2563eb' : '#e8eef7'} stroke="#fff" strokeWidth="2" />
                      <text x={lp.x} y={lp.y} fill={win ? '#fff' : '#9aa7ba'} fontSize="12" fontWeight="800"
                        textAnchor={flip ? 'end' : 'start'} dominantBaseline="middle"
                        transform={`rotate(${flip ? mid + 90 : mid - 90} ${lp.x} ${lp.y})`}>{s}</text>
                    </g>
                  )
                })}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth="3" />
              </svg>
              <button className="ir__center" onClick={spin} disabled={spinning || spins < 1}>{spinning ? '…' : 'TAP TO SPIN'}</button>
            </motion.div>
          </div>

          <p className="ir__spins">{spins} spin{spins === 1 ? '' : 's'} left</p>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={result.win ? 'w' : 'l'} className={`ir__result ${result.win ? 'win' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {result.win
                  ? <p className="ir__result-big">🎉 You won {formatPrize(result.amount)}!</p>
                  : <p className="ir__result-big">No prize this time</p>}
                <p className="ir__result-sub">{result.win ? 'Added to your site credit.' : 'Thanks for playing — try your next spin!'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="ir__error">{error}</p>}
        </>
      )}

      {/* Prizes still to be won */}
      {totalPrizeCount > 0 && (
        <div className="ir__prizes">
          <p className="ir__prizes-title">Prizes still to be won</p>
          <div className="ir__prizes-row">
            {status.map(t => (
              <div key={t.amount} className={`ir__prize${t.left === 0 ? ' gone' : ''}`}>
                <span className="ir__prize-amt">{formatPrize(t.amount)}</span>
                <span className="ir__prize-left">{t.left}/{t.total} to be won</span>
              </div>
            ))}
          </div>
          <p className="ir__prizes-meta">{prizesLeft} of {totalPrizeCount} instant prizes remaining</p>
        </div>
      )}

      {started && spins < 1 && (
        <div className="ir__done">
          <Link href={`/competitions/${slug}`} className="ir__reveal-btn">Buy More Spins</Link>
          <Link href="/account" className="ir__done-link">View my account →</Link>
        </div>
      )}

      <style>{`
        .ir { max-width: 620px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .ir__badge { display: inline-block; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .55rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; padding: .35rem .9rem; border-radius: 999px; }
        .ir__title { font-size: clamp(1.75rem,4.5vw,2.75rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); margin-top: .875rem; line-height: 1.05; }
        .ir__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; max-width: 440px; margin: .875rem auto 0; }

        .ir__gate { margin-top: 2.5rem; }
        .ir__gate-count { font-size: 1.125rem; font-weight: 700; color: var(--ink); margin-bottom: 1rem; }
        .ir__reveal-btn { display: inline-block; background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .8125rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 1.125rem 2.5rem; border-radius: var(--r-btn); text-decoration: none; box-shadow: 0 10px 28px rgba(37,99,235,.35); transition: background .2s, transform .15s; }
        .ir__reveal-btn:hover { background: var(--gold-d); transform: translateY(-2px); }

        .ir__stage { position: relative; width: min(400px,90vw); aspect-ratio: 1; margin: 2rem auto 0; }
        .ir__pointer { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 3; width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 24px solid var(--gold); filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }
        .ir__wheel { width: 100%; height: 100%; position: relative; border-radius: 50%; box-shadow: 0 20px 50px rgba(0,0,0,.2), 0 0 0 8px #fff, 0 0 0 10px var(--gold); }
        .ir__center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 2; width: 34%; aspect-ratio: 1; border-radius: 50%; background: var(--ink); color: #fff; border: 4px solid #fff; font-family: inherit; font-weight: 800; font-size: clamp(.6rem,2.4vw,.8rem); letter-spacing: .04em; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.3); transition: transform .12s; padding: 0; }
        .ir__center:hover:not(:disabled) { transform: translate(-50%,-50%) scale(1.05); }
        .ir__center:disabled { opacity: .8; cursor: default; }
        .ir__spins { margin-top: 1.25rem; font-size: .8125rem; font-weight: 700; color: var(--ink2); letter-spacing: .04em; }

        .ir__result { margin-top: 1rem; }
        .ir__result-big { font-size: 1.375rem; font-weight: 800; color: var(--ink); }
        .ir__result.win .ir__result-big { color: var(--gold); }
        .ir__result-sub { font-size: .875rem; color: var(--ink3); margin-top: .25rem; }
        .ir__error { color: #c0392b; font-size: .8125rem; margin-top: .75rem; }

        .ir__prizes { margin-top: 2.5rem; background: var(--ink); border-radius: var(--r-card); padding: 1.5rem 1.25rem; }
        .ir__prizes-title { font-size: .6875rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #fff; margin-bottom: 1.25rem; }
        .ir__prizes-row { display: flex; gap: .75rem; overflow-x: auto; scrollbar-width: none; padding-bottom: .5rem; }
        .ir__prizes-row::-webkit-scrollbar { display: none; }
        .ir__prize { flex: 0 0 130px; background: linear-gradient(150deg,#3b82f6,#1d4ed8); border-radius: 14px; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: center; gap: .625rem; }
        .ir__prize.gone { background: rgba(255,255,255,.06); }
        .ir__prize-amt { font-size: 1.75rem; font-weight: 800; color: #fff; }
        .ir__prize.gone .ir__prize-amt { color: rgba(255,255,255,.3); text-decoration: line-through; }
        .ir__prize-left { font-size: .5625rem; font-weight: 700; letter-spacing: .04em; color: #fff; background: rgba(0,0,0,.25); padding: .25rem .625rem; border-radius: 999px; }
        .ir__prizes-meta { font-size: .6875rem; color: rgba(255,255,255,.5); margin-top: 1rem; }

        .ir__done { margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: .875rem; }
        .ir__done-link { font-size: .8125rem; color: var(--gold); text-decoration: none; }
      `}</style>
    </div>
  )
}
