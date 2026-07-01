'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { WHEEL_SEGMENTS, formatPrize } from '@/lib/wheel'

const N = WHEEL_SEGMENTS.length
const SEG = 360 / N

// Vibrant casino-wheel palette (per segment). Even = WINNER, odd = NO WIN.
const COLORS = ['#e11d74', '#f5920b', '#7b2ff7', '#f6c50a', '#2563eb', '#0ea5a5', '#16a34a', '#c026d3', '#dc2626', '#0891b2']

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

  const cx = 150, cy = 150
  const rSeg = 116      // coloured segment radius
  const rBulb = 130     // light-bulb ring radius
  const BULBS = 16

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

  const canSpin = spins > 0 && !spinning && !result

  return (
    <div className="sw">
      <div className="sw__head">
        <p className="sw__eyebrow">Spin &amp; Win</p>
        <h1 className="sw__title">Spin the <em>Wheel</em></h1>
        <p className="sw__sub">Land a WIN and we&apos;ll drop site credit straight into your account. Earn more spins by climbing tiers and every 50 tickets.</p>
        <div className="sw__spins-pill">{spins} free spin{spins === 1 ? '' : 's'} available</div>
      </div>

      <div className="sw__stage">
        {/* Pointer */}
        <div className="sw__pointer">
          <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
            <path d="M22 50 L6 24 A16 16 0 1 1 38 24 Z" fill="url(#pinGold)" stroke="#8a5a10" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="22" cy="18" r="6" fill="#7a4e0e" />
            <defs>
              <linearGradient id="pinGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe89a"/><stop offset=".5" stopColor="#e8b64a"/><stop offset="1" stopColor="#b8862e"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wheel */}
        <motion.div className="sw__wheel" animate={{ rotate: rotation }} transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <radialGradient id="goldRim" cx="50%" cy="42%" r="60%">
                <stop offset="0" stopColor="#fbe4a0"/>
                <stop offset=".55" stopColor="#e0b24e"/>
                <stop offset="1" stopColor="#a9791f"/>
              </radialGradient>
              <radialGradient id="bulb" cx="50%" cy="40%" r="60%">
                <stop offset="0" stopColor="#fffdf0"/>
                <stop offset=".5" stopColor="#ffe98a"/>
                <stop offset="1" stopColor="#e0a83a"/>
              </radialGradient>
            </defs>

            {/* Gold rim disc */}
            <circle cx={cx} cy={cy} r={143} fill="url(#goldRim)" />
            <circle cx={cx} cy={cy} r={143} fill="none" stroke="#8a5f18" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={rSeg + 2} fill="none" stroke="#8a5f18" strokeWidth="2" />

            {/* Coloured segments */}
            {WHEEL_SEGMENTS.map((seg, i) => {
              const mid = i * SEG + SEG / 2
              const lp = polar(cx, cy, rSeg * 0.64, mid)
              return (
                <g key={i}>
                  <path d={segmentPath(i, cx, cy, rSeg)} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={lp.x} y={lp.y}
                    fill={seg.win ? '#ffe14d' : '#fff'}
                    fontSize={seg.win ? 11.5 : 11}
                    fontWeight="800"
                    textAnchor="middle" dominantBaseline="middle"
                    stroke="rgba(0,0,0,.35)" strokeWidth="0.5" paintOrder="stroke"
                    transform={`rotate(${mid} ${lp.x} ${lp.y})`}
                  >
                    {seg.win ? (
                      <tspan x={lp.x} dy="0">WINNER</tspan>
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

            {/* Light bulbs around the rim */}
            {Array.from({ length: BULBS }).map((_, i) => {
              const p = polar(cx, cy, rBulb, (360 / BULBS) * i)
              return <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="url(#bulb)" stroke="#a9791f" strokeWidth="0.75" />
            })}
          </svg>
        </motion.div>

        {/* Central SPIN! button (static — the trigger) */}
        <button
          className={`sw__spin-center${canSpin ? '' : ' disabled'}`}
          onClick={spin}
          disabled={!canSpin}
          aria-label="Spin"
        >
          {spinning ? '…' : 'SPIN!'}
        </button>
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
            {error && <p className="sw__error">{error}</p>}
            <p className="sw__terms">Tap <strong>SPIN!</strong> · 18+ · Credit applies at checkout</p>
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
        .sw__pointer { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); z-index: 4; filter: drop-shadow(0 3px 5px rgba(0,0,0,.4)); }

        .sw__wheel { width: 100%; height: 100%; position: relative; border-radius: 50%; box-shadow: 0 24px 60px rgba(0,0,0,.35); }

        /* Central SPIN! button */
        .sw__spin-center {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          z-index: 3; width: 27%; aspect-ratio: 1; border-radius: 50%;
          background: radial-gradient(circle at 50% 38%, #ff5b5b 0%, #e01f1f 45%, #a80f0f 100%);
          border: 5px solid; border-color: #f7d066 #c99a2e #a9791f #e0b24e;
          color: #ffe14d; font-family: inherit; font-weight: 900; font-size: clamp(.9rem,3.4vw,1.35rem);
          letter-spacing: .02em; cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,.4), inset 0 2px 6px rgba(255,255,255,.35), inset 0 -6px 12px rgba(0,0,0,.35);
          text-shadow: 0 1px 2px rgba(0,0,0,.5);
          transition: transform .12s;
        }
        .sw__spin-center:hover:not(.disabled) { transform: translate(-50%,-50%) scale(1.06); }
        .sw__spin-center:active:not(.disabled) { transform: translate(-50%,-50%) scale(.96); }
        .sw__spin-center.disabled { cursor: not-allowed; filter: grayscale(.4) brightness(.9); opacity: .85; }

        .sw__foot { margin-top: 2.25rem; }
        .sw__spin-btn { background: var(--gold); color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: .9375rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 1.125rem 3rem; border-radius: var(--r-btn); box-shadow: 0 10px 28px rgba(201,168,76,.4); transition: background .2s, transform .15s; }
        .sw__spin-btn:hover:not(:disabled) { background: var(--gold-d); transform: translateY(-2px); }
        .sw__terms { font-size: .6875rem; color: var(--ink3); margin-top: 1rem; letter-spacing: .03em; }
        .sw__terms strong { color: var(--gold); }
        .sw__error { color: #c0392b; font-size: .8125rem; margin-top: .875rem; }
        .sw__result-big { font-size: 1.5rem; font-weight: 800; color: var(--ink); }
        .sw__result-sub { font-size: .9375rem; color: var(--ink2); margin-top: .5rem; }
        .sw__result-sub strong { color: var(--gold); }
      `}</style>
    </div>
  )
}
