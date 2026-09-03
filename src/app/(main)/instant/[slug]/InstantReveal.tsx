'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { formatPrize, type PrizeStatus } from '@/lib/instant'
import RepeatOrderPopup from '@/components/RepeatOrderPopup'

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

// Vibrant casino-wheel segment colours (index 0 = top, going clockwise)
const SEG_COLORS = ['#e23140', '#6c3ce0', '#f5871f', '#159fd0', '#33a852', '#f2b70c', '#c62bb0', '#2f57d8']
const GOLD = '#e6b422'
const BULBS = 16

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
  const [highlight, setHighlight] = useState(-1)
  const [error, setError] = useState('')
  const [showReorder, setShowReorder] = useState(false)

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
        const left = data.spinsLeft ?? Math.max(0, spins - 1)
        setSpins(left)
        if (data.status) setStatus(data.status)
        setSpinning(false)
        // Out of spins → prompt to reorder.
        if (left < 1) setTimeout(() => setShowReorder(true), 1100)
      }, 4400)
    } catch {
      setError('Something went wrong. Please try again.')
      setSpinning(false)
    }
  }


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
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <path d="M20 49C20 49 34 29 34 17A14 14 0 1 0 6 17C6 29 20 49 20 49Z" fill={GOLD} stroke="#a9791c" strokeWidth="1.5"/>
              <circle cx="20" cy="17" r="6" fill="#fff"/>
            </svg>
          </div>

          {/* Wheel (centre anchored at box bottom) */}
          <div className="iw2-wheel-pos">
            <motion.div className="iw2-wheel" animate={{ rotate: rotation }} transition={{ duration: 4.2, ease: [0.16, 0.9, 0.2, 1] }}>
              <svg viewBox="0 0 300 300" width="100%" height="100%">
                <defs>
                  <linearGradient id="iw2gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe9a8" />
                    <stop offset=".5" stopColor="#e6b422" />
                    <stop offset="1" stopColor="#a9791c" />
                  </linearGradient>
                </defs>
                {SEG_DATA.map((s, i) => {
                  const mid = i * SEG + SEG / 2
                  const flip = mid > 90 && mid < 270
                  const lp = polar(cx, cy, r * 0.62, mid)
                  const hot = i === highlight
                  const fill = SEG_COLORS[i % SEG_COLORS.length]
                  return (
                    <g key={i}>
                      <path d={segPath(i, cx, cy, r)} fill={fill} stroke={hot ? '#fff' : '#d9b64a'} strokeWidth={hot ? 3 : 1.5} />
                      <g transform={`rotate(${flip ? mid + 90 : mid - 90} ${lp.x} ${lp.y})`} textAnchor="middle" dominantBaseline="middle" style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,.45))' }}>
                        {s.win ? (
                          <text x={lp.x} y={lp.y} fill="#fff" fontSize="13" fontWeight="900" letterSpacing=".5">WINNER</text>
                        ) : (
                          <>
                            <text x={lp.x} y={lp.y - 5} fill="#fff" fontSize="10.5" fontWeight="800" letterSpacing=".3">NO</text>
                            <text x={lp.x} y={lp.y + 8} fill="#fff" fontSize="10.5" fontWeight="800" letterSpacing=".3">WIN</text>
                          </>
                        )}
                      </g>
                    </g>
                  )
                })}
                {/* gold rim + bulbs */}
                <circle cx={cx} cy={cy} r={r - 5} fill="none" stroke="url(#iw2gold)" strokeWidth="10" />
                <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke="#8a6d1e" strokeWidth="1" opacity=".5" />
                {Array.from({ length: BULBS }).map((_, i) => {
                  const p = polar(cx, cy, r - 5, (360 / BULBS) * i)
                  return <circle key={i} cx={p.x} cy={p.y} r="2.8" fill="#fff7dd" stroke="#a9791c" strokeWidth=".8" />
                })}
              </svg>
            </motion.div>
          </div>

          {/* SPIN hub button */}
          <button className="iw2-tap" onClick={spin} disabled={spinning || spins < 1}>
            {spinning ? <span className="iw2-tap-dots">…</span> : <strong>SPIN!</strong>}
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

      {/* Reorder prompt after the wheel is spun */}
      {showReorder && (
        <RepeatOrderPopup onRepeat={() => { window.location.href = `/competitions/${slug}` }} onClose={() => setShowReorder(false)} />
      )}

      {/* Prize breakdown intentionally hidden from customers — pool logic still runs server-side. */}

      <style>{`
        .ir { max-width: 560px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 4rem; text-align: center; }
        .ir__badge { display: inline-block; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .55rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; padding: .35rem .9rem; border-radius: 999px; }
        .ir__title { font-size: clamp(1.9rem,5vw,3rem); font-weight: 800; letter-spacing: -.02em; color: var(--ink); margin-top: .875rem; line-height: 1.02; }
        .ir__sub { font-size: .9375rem; color: var(--ink3); line-height: 1.6; margin: .875rem auto 0; }
        .ir__error { color: #c0392b; font-size: .8125rem; margin-top: .75rem; }
        .ir__reveal-btn { display: inline-block; background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .8125rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 1rem 2.25rem; border-radius: var(--r-btn); text-decoration: none; box-shadow: 0 10px 28px rgba(37,99,235,.3); transition: background .2s, transform .15s; }
        .ir__reveal-btn:hover { background: var(--gold-d); transform: translateY(-2px); }

        .ir-pop-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(8,10,16,.72); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: irf .2s ease; }
        @keyframes irf { from { opacity: 0 } to { opacity: 1 } }
        .ir-pop { position: relative; background: radial-gradient(130% 90% at 50% -10%,#242a16 0%,#14120c 60%,#0e0d08 100%); border: 1px solid rgba(217,182,74,.55); border-radius: 20px; padding: 2.25rem 1.9rem 1.75rem; max-width: 340px; width: 100%; text-align: center; color: #fff; box-shadow: 0 30px 80px rgba(0,0,0,.55); animation: irp .38s cubic-bezier(.22,1,.36,1); }
        @keyframes irp { from { opacity: 0; transform: scale(.92) translateY(8px) } to { opacity: 1; transform: none } }
        .ir-pop-emoji { font-size: 3rem; line-height: 1; }
        .ir-pop-eyebrow { font-size: .6rem; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: #d9b64a; margin-top: .6rem; }
        .ir-pop-title { font-family: var(--font-cormorant,serif); font-size: 1.9rem; line-height: 1.1; margin-top: .25rem; }
        .ir-pop-sub { color: rgba(255,255,255,.68); font-size: .85rem; line-height: 1.4; margin: .5rem auto 1.25rem; max-width: 26ch; }
        .ir-pop-btn { display: block; width: 100%; background: linear-gradient(180deg,#e6c85e,#d9b64a); color: #241c05; border: none; border-radius: 11px; padding: .85rem 1.8rem; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; text-decoration: none; box-shadow: 0 8px 20px rgba(217,182,74,.3); }
        .ir-pop-later { display: block; width: 100%; margin-top: .6rem; background: none; border: none; color: rgba(255,255,255,.6); font-size: .78rem; cursor: pointer; font-family: inherit; }
        .ir-pop-later:hover { color: #fff; }

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
        .iw2-tap { position: absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%); z-index: 6; width: 30%; max-width: 118px; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 50% 38%, #ff5a5a, #d61f2b 62%, #a3121c); border: 5px solid #e6b422; box-shadow: 0 6px 18px rgba(20,28,42,.28), inset 0 2px 6px rgba(255,255,255,.35); cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: inherit; transition: transform .12s, filter .2s; }
        .iw2-tap:hover:not(:disabled) { transform: translate(-50%,50%) scale(1.05); filter: brightness(1.08); }
        .iw2-tap:active:not(:disabled) { transform: translate(-50%,50%) scale(.96); }
        .iw2-tap:disabled { cursor: default; opacity: .85; }
        .iw2-tap strong { font-size: clamp(.85rem,3.2vw,1.15rem); font-weight: 900; color: #fff; letter-spacing: .02em; text-shadow: 0 1px 2px rgba(0,0,0,.4); }
        .iw2-tap-dots { font-size: 1.5rem; color: #fff; font-weight: 900; }

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
