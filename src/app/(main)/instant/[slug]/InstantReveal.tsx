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

// 8-segment wheel like 7Days: WINNER / LUCKY / UNLUCKY
const SEGMENTS = ['WINNER', 'UNLUCKY', 'LUCKY', 'UNLUCKY', 'WINNER', 'UNLUCKY', 'LUCKY', 'UNLUCKY']
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

  const cx = 150, cy = 150, r = 148
  const winIdx = SEGMENTS.map((s, i) => (s === 'WINNER' ? i : -1)).filter(i => i >= 0)
  const loseIdx = SEGMENTS.map((s, i) => (s !== 'WINNER' ? i : -1)).filter(i => i >= 0)

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
      // 6 full turns then decelerate onto the target segment at the top pointer
      const final = rotation + 6 * 360 + ((360 - (rotation % 360)) - segCentre + 360) % 360
      setRotation(final)
      setTimeout(() => {
        setResult({ win: data.win, amount: data.amount })
        setSpins(data.spinsLeft ?? Math.max(0, spins - 1))
        if (data.status) setStatus(data.status)
        setSpinning(false)
      }, 4600)
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
          {/* Blue wheel card (7Days style) */}
          <div className="iw-card">
            <span className="iw-spins">{spins} Spin{spins === 1 ? '' : 's'} left</span>
            <div className="iw-gift">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M20 8H4v12h16V8Z" stroke="#fff" strokeWidth="1.6"/><path d="M2 8h20v3H2z" fill="#fff" opacity=".5"/><path d="M12 8v12M12 8s-3-5-5-3 2 3 5 3Zm0 0s3-5 5-3-2 3-5 3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            </div>

            <div className="iw-wheel-wrap">
              <motion.div className="iw-wheel" animate={{ rotate: rotation }} transition={{ duration: 4.4, ease: [0.15, 0.9, 0.2, 1] }}>
                <svg viewBox="0 0 300 300" width="100%" height="100%">
                  {SEGMENTS.map((s, i) => {
                    const mid = i * SEG + SEG / 2
                    const win = s === 'WINNER'
                    const flip = mid > 90 && mid < 270
                    const lp = polar(cx, cy, r * 0.6, mid)
                    return (
                      <g key={i}>
                        <path d={segPath(i, cx, cy, r)} fill={win ? '#cfe0fb' : (i % 2 ? '#eef4fd' : '#e2ecfb')} stroke="#fff" strokeWidth="2" />
                        <text x={lp.x} y={lp.y} fill={win ? '#1d4ed8' : '#9db4d6'} fontSize="12.5" fontWeight="800"
                          textAnchor={flip ? 'end' : 'start'} dominantBaseline="middle"
                          transform={`rotate(${flip ? mid + 90 : mid - 90} ${lp.x} ${lp.y})`}>{s}</text>
                      </g>
                    )
                  })}
                </svg>
              </motion.div>

              {/* Fixed dark pointer wedge — tap to spin */}
              <button className="iw-pointer" onClick={spin} disabled={spinning || spins < 1} aria-label="Tap to spin">
                <svg viewBox="0 0 120 250" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                  <polygon points="10,6 110,6 60,244" fill="#152134" stroke="#0d1726" strokeWidth="2" strokeLinejoin="round"/>
                  <text x="60" y="70" fill="#fff" fontSize="21" fontWeight="900" textAnchor="middle">TAP</text>
                  <text x="60" y="98" fill="#9fc0ff" fontSize="13" fontWeight="800" textAnchor="middle">TO</text>
                  <text x="60" y="128" fill="#fff" fontSize="24" fontWeight="900" textAnchor="middle">SPIN</text>
                </svg>
              </button>
              <div className="iw-hub" />
            </div>
          </div>

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

      {/* Prizes available — list */}
      {totalPrizeCount > 0 && (
        <div className="ir__prizes">
          <div className="ir__prizes-head">
            <p className="ir__prizes-title">Prizes Available</p>
            <span className="ir__prizes-meta">{prizesLeft} of {totalPrizeCount} left</span>
          </div>
          <ul className="ir__prize-list">
            {status.map(t => (
              <li key={t.amount} className={`ir__prize-row${t.left === 0 ? ' gone' : ''}`}>
                <span className="ir__prize-amt">{formatPrize(t.amount)}</span>
                <span className="ir__prize-bar"><span className="ir__prize-bar-fill" style={{ width: `${(t.left / t.total) * 100}%` }} /></span>
                <span className="ir__prize-count">{t.left} / {t.total} to be won</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {started && spins < 1 && (
        <div className="ir__done">
          <Link href={`/competitions/${slug}`} className="ir__reveal-btn">Buy More Spins</Link>
          <Link href="/account" className="ir__done-link">View my account →</Link>
        </div>
      )}

      <style>{`
        .ir { max-width: 560px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .ir__badge { display: inline-block; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .55rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; padding: .35rem .9rem; border-radius: 999px; }
        .ir__title { font-size: clamp(1.75rem,4.5vw,2.75rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); margin-top: .875rem; line-height: 1.05; }
        .ir__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; max-width: 440px; margin: .875rem auto 0; }

        .ir__gate { margin-top: 2.5rem; }
        .ir__gate-count { font-size: 1.125rem; font-weight: 700; color: var(--ink); margin-bottom: 1rem; }
        .ir__reveal-btn { display: inline-block; background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .8125rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 1.125rem 2.5rem; border-radius: var(--r-btn); text-decoration: none; box-shadow: 0 10px 28px rgba(37,99,235,.35); transition: background .2s, transform .15s; }
        .ir__reveal-btn:hover { background: var(--gold-d); transform: translateY(-2px); }

        /* Blue wheel card */
        .iw-card { position: relative; margin: 2rem auto 0; width: 100%; max-width: 420px; height: 360px; background: linear-gradient(180deg,#2f6bf0,#1f5fe0); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(31,95,224,.35); }
        .iw-spins { position: absolute; top: 14px; right: 14px; z-index: 6; background: #eef4ff; color: var(--ink); font-weight: 800; font-size: .75rem; padding: .35rem .75rem; border-radius: 999px; }
        .iw-gift { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); z-index: 5; width: 74px; height: 74px; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; }

        .iw-wheel-wrap { position: absolute; left: 50%; top: 360px; transform: translate(-50%,-50%); width: 560px; height: 560px; }
        .iw-wheel { width: 100%; height: 100%; }
        .iw-hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 80px; height: 80px; border-radius: 50%; background: #fff; box-shadow: 0 3px 10px rgba(0,0,0,.2); z-index: 3; }

        /* Pointer wedge (fixed, tappable) — from top down to the hub */
        .iw-pointer { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 128px; height: 290px; z-index: 4; background: none; border: none; padding: 0; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,.3)); transition: transform .12s; }
        .iw-pointer:hover:not(:disabled) { transform: translateX(-50%) scale(1.03); }
        .iw-pointer:active:not(:disabled) { transform: translateX(-50%) scale(.97); }
        .iw-pointer:disabled { cursor: default; }

        .ir__result { margin-top: 1.25rem; }
        .ir__result-big { font-size: 1.375rem; font-weight: 800; color: var(--ink); }
        .ir__result.win .ir__result-big { color: var(--gold); }
        .ir__result-sub { font-size: .875rem; color: var(--ink3); margin-top: .25rem; }
        .ir__error { color: #c0392b; font-size: .8125rem; margin-top: .75rem; }

        /* Prize list */
        .ir__prizes { margin-top: 2.5rem; text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem 1.25rem 1rem; box-shadow: var(--shadow-sm); }
        .ir__prizes-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1rem; }
        .ir__prizes-title { font-size: .6875rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--ink2); }
        .ir__prizes-meta { font-size: .6875rem; color: var(--ink3); font-weight: 600; }
        .ir__prize-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
        .ir__prize-row { display: grid; grid-template-columns: 64px 1fr auto; align-items: center; gap: .875rem; padding: .75rem 0; border-bottom: 1px solid var(--border); }
        .ir__prize-row:last-child { border-bottom: none; }
        .ir__prize-row.gone { opacity: .45; }
        .ir__prize-amt { font-size: 1.25rem; font-weight: 800; color: var(--gold); }
        .ir__prize-row.gone .ir__prize-amt { color: var(--ink3); text-decoration: line-through; }
        .ir__prize-bar { height: 6px; background: var(--bg2); border-radius: 999px; overflow: hidden; }
        .ir__prize-bar-fill { display: block; height: 100%; background: var(--gold); border-radius: 999px; }
        .ir__prize-count { font-size: .6875rem; color: var(--ink3); font-weight: 600; white-space: nowrap; }

        .ir__done { margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: .875rem; }
        .ir__done-link { font-size: .8125rem; color: var(--gold); text-decoration: none; }
      `}</style>
    </div>
  )
}
