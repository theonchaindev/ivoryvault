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

// Simple wheel: alternating WINNER / NO WINNER segments
const SEG_DATA: { win: boolean }[] = [
  { win: true }, { win: false },
  { win: true }, { win: false },
  { win: true }, { win: false },
  { win: true }, { win: false },
]
const N = SEG_DATA.length
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
  const [spins, setSpins] = useState(initial)
  const [status, setStatus] = useState(initialStatus)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ win: boolean; amount: number; kind: 'credit' | 'cash' } | null>(null)
  const [highlight, setHighlight] = useState(0)
  const [error, setError] = useState('')

  const cx = 150, cy = 150, r = 146
  const winIdx = SEG_DATA.map((s, i) => (s.win ? i : -1)).filter(i => i >= 0)
  const loseIdx = SEG_DATA.map((s, i) => (!s.win ? i : -1)).filter(i => i >= 0)

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
      setHighlight(-1)
      setTimeout(() => {
        setResult({ win: data.win, amount: data.amount, kind: data.kind === 'cash' ? 'cash' : 'credit' })
        setHighlight(data.win ? target : -1)
        setSpins(data.spinsLeft ?? Math.max(0, spins - 1))
        if (data.status) setStatus(data.status)
        setSpinning(false)
      }, 4400)
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
        <span className="ir__badge">⚡ Instant Spin</span>
        <h1 className="ir__title">{title.replace(/!$/, '')}</h1>
        <p className="ir__sub">Spin the wheel and win instant cash prizes.<br />Prizes are added to your site credit instantly.</p>
      </div>

      {/* Wheel card */}
      <div className="iw2-card">
        <div className="iw2-topbar">
          <span className="iw2-gift">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="9" width="16" height="11" rx="1" stroke="var(--gold)" strokeWidth="1.7"/><rect x="3" y="6" width="18" height="4" rx="1" stroke="var(--gold)" strokeWidth="1.7"/><path d="M12 6v14" stroke="var(--gold)" strokeWidth="1.7"/><path d="M12 6s-3.2-3.6-5-2 1.8 2 5 2Zm0 0s3.2-3.6 5-2-1.8 2-5 2Z" stroke="var(--gold)" strokeWidth="1.7" strokeLinejoin="round"/></svg>
          </span>
          <div className="iw2-spins">
            <span className="iw2-spins-l">Spins Left</span>
            <span className="iw2-spins-n">{spins}</span>
          </div>
        </div>

        <div className="iw2-wheelbox">
          {/* Pin pointer */}
          <div className="iw2-pin">
            <svg width="38" height="48" viewBox="0 0 40 50" fill="none"><path d="M20 49C20 49 34 29 34 17A14 14 0 1 0 6 17C6 29 20 49 20 49Z" fill="var(--gold)"/><circle cx="20" cy="17" r="6" fill="#fff"/></svg>
          </div>

          {/* Wheel (centre anchored at box bottom) */}
          <div className="iw2-wheel-pos">
            <motion.div className="iw2-wheel" animate={{ rotate: rotation }} transition={{ duration: 4.2, ease: [0.16, 0.9, 0.2, 1] }}>
              <svg viewBox="0 0 300 300" width="100%" height="100%">
                {SEG_DATA.map((s, i) => {
                  const mid = i * SEG + SEG / 2
                  const flip = mid > 90 && mid < 270
                  const lp = polar(cx, cy, r * 0.66, mid)
                  const hot = s.win && i === highlight
                  const fill = s.win ? (hot ? '#2f6bf0' : '#e9f0fd') : (i % 2 ? '#f1f4f9' : '#e9edf3')
                  return (
                    <g key={i}>
                      <path d={segPath(i, cx, cy, r)} fill={fill} stroke="#fff" strokeWidth="2.5" />
                      <g transform={`rotate(${flip ? mid + 90 : mid - 90} ${lp.x} ${lp.y})`} textAnchor="middle" dominantBaseline="middle">
                        {s.win ? (
                          <text x={lp.x} y={lp.y} fill={hot ? '#fff' : '#1d4ed8'} fontSize="13" fontWeight="900" letterSpacing=".5">WINNER</text>
                        ) : (
                          <>
                            <text x={lp.x} y={lp.y - 5} fill="#aab6c8" fontSize="10.5" fontWeight="800" letterSpacing=".3">NO</text>
                            <text x={lp.x} y={lp.y + 8} fill="#aab6c8" fontSize="10.5" fontWeight="800" letterSpacing=".3">WINNER</text>
                          </>
                        )}
                      </g>
                    </g>
                  )
                })}
                {/* rim dots */}
                {Array.from({ length: N }).map((_, i) => {
                  const p = polar(cx, cy, r - 6, i * SEG)
                  return <circle key={i} cx={p.x} cy={p.y} r="2.4" fill="#c3d0e4" />
                })}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4eaf2" strokeWidth="3" />
              </svg>
            </motion.div>
          </div>

          {/* TAP TO SPIN hub button */}
          <button className="iw2-tap" onClick={spin} disabled={spinning || spins < 1}>
            {spinning ? <span className="iw2-tap-dots">…</span> : <><strong>TAP</strong><span>TO SPIN</span></>}
          </button>
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.win ? 'w' : 'l'} className={`iw2-banner ${result.win ? 'win' : 'lose'}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <span className="iw2-banner-icon">{result.win ? '✓' : '×'}</span>
            <div>
              <p className="iw2-banner-title">{result.win ? `You won ${formatPrize(result.amount)}${result.kind === 'cash' ? ' cash' : ''}!` : 'No win this time'}</p>
              <p className="iw2-banner-sub">{result.win ? (result.kind === 'cash' ? "We'll be in touch to arrange your cash payment." : 'Added to your site credit.') : 'Thanks for playing — try your next spin.'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="ir__error">{error}</p>}
      {spins < 1 && !spinning && (
        <div className="iw2-outofspins">
          <Link href={`/competitions/${slug}`} className="ir__reveal-btn">Buy More Spins</Link>
        </div>
      )}

      {/* Prizes available */}
      {totalPrizeCount > 0 && (
        <div className="ir__prizes">
          <div className="ir__prizes-head">
            <p className="ir__prizes-title">Prizes Available</p>
            <span className="ir__prizes-meta">{prizesLeft} of {totalPrizeCount} left</span>
          </div>
          <ul className="ir__prize-list">
            {status.map(t => (
              <li key={`${t.amount}:${t.kind}`} className={`ir__prize-row${t.left === 0 ? ' gone' : ''}`}>
                <span className="ir__prize-amt">
                  {formatPrize(t.amount)}
                  <span className={`ir__prize-kind ${t.kind}`}>{t.kind === 'cash' ? 'cash' : 'credit'}</span>
                </span>
                <span className="ir__prize-bar"><span className="ir__prize-bar-fill" style={{ width: `${(t.left / t.total) * 100}%` }} /></span>
                <span className="ir__prize-count">{t.left} / {t.total} to be won</span>
              </li>
            ))}
          </ul>
          <p className="ir__prizes-foot">Prizes and odds may vary. Rewards are non-transferable.</p>
        </div>
      )}

      <style>{`
        .ir { max-width: 560px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .ir__badge { display: inline-block; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .55rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; padding: .35rem .9rem; border-radius: 999px; }
        .ir__title { font-size: clamp(1.9rem,5vw,3rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); margin-top: .875rem; line-height: 1.02; }
        .ir__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; margin: .875rem auto 0; }
        .ir__error { color: #c0392b; font-size: .8125rem; margin-top: .75rem; }
        .ir__reveal-btn { display: inline-block; background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .8125rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 1rem 2.25rem; border-radius: var(--r-btn); text-decoration: none; box-shadow: 0 10px 28px rgba(37,99,235,.3); transition: background .2s, transform .15s; }
        .ir__reveal-btn:hover { background: var(--gold-d); transform: translateY(-2px); }

        /* Wheel card */
        .iw2-card { position: relative; margin: 1.75rem auto 0; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem 1.5rem 3rem; box-shadow: var(--shadow-md); }
        .iw2-topbar { display: flex; align-items: center; gap: .75rem; }
        .iw2-gift { width: 44px; height: 44px; border-radius: 50%; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; }
        .iw2-spins { display: flex; flex-direction: column; text-align: left; line-height: 1; }
        .iw2-spins-l { font-size: .5rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); }
        .iw2-spins-n { font-size: 1.375rem; font-weight: 900; color: var(--ink); margin-top: 3px; }

        .iw2-wheelbox { position: relative; width: 100%; padding-bottom: 54%; margin-top: .5rem; overflow: hidden; }
        .iw2-pin { position: absolute; top: -2px; left: 50%; transform: translateX(-50%); z-index: 5; filter: drop-shadow(0 3px 4px rgba(0,0,0,.18)); }
        .iw2-wheel-pos { position: absolute; left: 0; bottom: 0; width: 100%; aspect-ratio: 1; transform: translateY(50%); }
        .iw2-wheel { width: 100%; height: 100%; }
        .iw2-tap { position: absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%); z-index: 6; width: 30%; max-width: 118px; aspect-ratio: 1; border-radius: 50%; background: #fff; border: 3px solid var(--gold-pale); box-shadow: 0 6px 18px rgba(20,28,42,.18); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-family: inherit; transition: transform .12s, border-color .2s; }
        .iw2-tap:hover:not(:disabled) { transform: translate(-50%,50%) scale(1.05); border-color: var(--gold); }
        .iw2-tap:active:not(:disabled) { transform: translate(-50%,50%) scale(.96); }
        .iw2-tap:disabled { cursor: default; }
        .iw2-tap strong { font-size: clamp(.8rem,3vw,1.05rem); font-weight: 900; color: var(--ink); letter-spacing: .02em; }
        .iw2-tap span { font-size: clamp(.42rem,1.6vw,.55rem); font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); }
        .iw2-tap-dots { font-size: 1.5rem; color: var(--gold); font-weight: 900; }

        /* Result banner */
        .iw2-banner { display: flex; align-items: center; gap: .875rem; text-align: left; margin: 1.25rem auto 0; padding: .875rem 1.125rem; border-radius: 14px; }
        .iw2-banner.win { background: #ecfdf3; border: 1px solid #b7f0cf; }
        .iw2-banner.lose { background: var(--bg2); border: 1px solid var(--border); }
        .iw2-banner-icon { flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 1.1rem; }
        .iw2-banner.win .iw2-banner-icon { background: #16a34a; }
        .iw2-banner.lose .iw2-banner-icon { background: var(--ink3); }
        .iw2-banner-title { font-size: 1.0625rem; font-weight: 800; color: var(--ink); }
        .iw2-banner-sub { font-size: .8125rem; color: var(--ink3); margin-top: 1px; }
        .iw2-outofspins { margin-top: 1.5rem; }

        /* Prizes available */
        .ir__prizes { margin-top: 1.75rem; text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem 1.25rem 1rem; box-shadow: var(--shadow-sm); }
        .ir__prizes-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1rem; }
        .ir__prizes-title { font-size: .6875rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--ink2); }
        .ir__prizes-meta { font-size: .6875rem; color: var(--ink3); font-weight: 600; }
        .ir__prize-list { list-style: none; padding: 0; margin: 0; }
        .ir__prize-row { display: grid; grid-template-columns: 92px 1fr auto; align-items: center; gap: .875rem; padding: .75rem 0; border-bottom: 1px solid var(--border); }
        .ir__prize-row:last-child { border-bottom: none; }
        .ir__prize-row.gone { opacity: .45; }
        .ir__prize-amt { font-size: 1.25rem; font-weight: 800; color: var(--gold); display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1; }
        .ir__prize-kind { font-size: .5rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; margin-top: 3px; }
        .ir__prize-kind.credit { background: var(--gold-pale); color: var(--gold-d); }
        .ir__prize-kind.cash { background: #dcfce7; color: #15803d; }
        .ir__prize-row.gone .ir__prize-amt { color: var(--ink3); text-decoration: line-through; }
        .ir__prize-bar { height: 6px; background: var(--bg2); border-radius: 999px; overflow: hidden; }
        .ir__prize-bar-fill { display: block; height: 100%; background: var(--gold); border-radius: 999px; }
        .ir__prize-count { font-size: .6875rem; color: var(--ink3); font-weight: 600; white-space: nowrap; }
        .ir__prizes-foot { font-size: .625rem; color: var(--ink3); margin-top: 1rem; }
      `}</style>
    </div>
  )
}
