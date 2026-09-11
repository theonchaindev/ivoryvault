'use client'

import { useState } from 'react'
import CountdownTimer from '@/components/CountdownTimer'

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const CAP = 2000

export default function NumberPicker({
  gameId, title, price, poolSize, taken, signedIn, creditAvailable, loginHref, onCheckout,
  image = '', endsAt = null,
}: {
  gameId: string
  title: string
  price: number
  poolSize: number
  taken: number[]
  signedIn: boolean
  creditAvailable: number
  loginHref: string
  onCheckout: (numbers: number[], useCredit: boolean) => Promise<void>
  image?: string
  endsAt?: string | null
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [useCredit, setUseCredit] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const takenSet = new Set(taken)
  const count = poolSize > CAP ? CAP : poolSize
  const total = Math.round(selected.size * price * 100) / 100

  const toggle = (n: number) => {
    if (takenSet.has(n)) return
    setErr('')
    setSelected(s => { const next = new Set(s); if (next.has(n)) next.delete(n); else next.add(n); return next })
  }

  const buy = async () => {
    if (selected.size === 0) return
    setErr(''); setBusy(true)
    try { await onCheckout([...selected].sort((a, b) => a - b), useCredit) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); setBusy(false) }
  }

  return (
    <div className="np">
      {image && (
        <div className="np__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="np__hero-img" src={image} alt={title} />
        </div>
      )}
      <div className="np__head">
        <h2 className="np__title">{title}</h2>
        <p className="np__sub">Pick your lucky numbers — tap a ticket to select it. {money(price)} each.</p>
        {endsAt && (
          <div className="np__timer">
            <span className="np__timer-lbl">Game ends in</span>
            <CountdownTimer drawDate={endsAt} variant="pill" />
          </div>
        )}
      </div>

      <div className="np__legend">
        <span><i className="np__sw np__sw--free" /> Available</span>
        <span><i className="np__sw np__sw--sel" /> Selected</span>
        <span><i className="np__sw np__sw--taken" /> Taken</span>
      </div>

      <div className="np__grid" role="group" aria-label="Ticket numbers">
        {Array.from({ length: count }, (_, i) => i + 1).map(n => {
          const isTaken = takenSet.has(n)
          const isSel = selected.has(n)
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              disabled={isTaken}
              aria-pressed={isSel}
              className={`np__box${isSel ? ' is-sel' : ''}${isTaken ? ' is-taken' : ''}`}
            >{n}</button>
          )
        })}
      </div>
      {poolSize > CAP && <p className="np__cap">Showing the first {CAP} of {poolSize} tickets.</p>}

      {/* Sticky checkout bar */}
      <div className="np__bar">
        <div className="np__bar-inner">
          <div className="np__bar-info">
            <span className="np__bar-count">{selected.size}</span>
            <span className="np__bar-lbl">selected{selected.size > 0 ? ` · ${money(total)}` : ''}</span>
            {selected.size > 0 && <button className="np__clear" onClick={() => setSelected(new Set())}>Clear</button>}
          </div>
          <div className="np__bar-actions">
            {signedIn && creditAvailable > 0 && (
              <label className="np__credit">
                <input type="checkbox" checked={useCredit} onChange={e => setUseCredit(e.target.checked)} />
                Use credit ({money(creditAvailable)})
              </label>
            )}
            {!signedIn
              ? <a className="np__go" href={loginHref}>Log in to play</a>
              : <button className="np__go" onClick={buy} disabled={busy || selected.size === 0}>{busy ? 'Loading…' : selected.size === 0 ? 'Pick a number' : `Buy ${selected.size} · ${money(total)}`}</button>}
          </div>
        </div>
        {err && <p className="np__err">{err}</p>}
      </div>

      <style>{`
        .np, .np *{ box-sizing: border-box; }
        .np{ max-width: 760px; width: 100%; margin: 0 auto; color: var(--ink); }
        .np__hero{ width: 100%; margin: 0 auto 1.5rem; border-radius: 16px; overflow: hidden; background: linear-gradient(160deg,#f6f3ea,#efe9da); border: 1px solid var(--border,#e4e7ee); box-shadow: 0 10px 30px rgba(27,36,50,.08); }
        .np__hero-img{ display: block; width: 100%; height: auto; max-height: 70vh; object-fit: contain; object-position: center; }
        .np__head{ text-align: center; margin-bottom: 1.25rem; }
        .np__title{ font-family: var(--font-cormorant,serif); font-size: clamp(1.6rem,6vw,2rem); font-weight: 600; margin: 0; }
        .np__sub{ color: var(--ink3); font-size: .92rem; margin: .4rem 0 0; }
        .np__timer{ display: flex; flex-direction: column; align-items: center; gap: .5rem; margin-top: 1.1rem; }
        .np__timer-lbl{ font-size: .62rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--ink3); }
        .np__legend{ display: flex; justify-content: center; gap: 1.25rem; margin-bottom: 1rem; font-size: .72rem; color: var(--ink3); flex-wrap: wrap; }
        .np__legend span{ display: inline-flex; align-items: center; gap: .4rem; }
        .np__sw{ width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
        .np__sw--free{ background: var(--card,#fff); border: 1.5px solid var(--border,#e2e7ee); }
        .np__sw--sel{ background: var(--gold,#2563eb); border: 1.5px solid var(--gold-d,#1d4ed8); }
        .np__sw--taken{ background: #eceff3; border: 1.5px solid #dfe4ea; }

        .np__grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); gap: 8px; width: 100%; }
        .np__box{
          aspect-ratio: 1 / 1; border-radius: 10px; border: 1.5px solid var(--border,#e2e7ee);
          background: var(--card,#fff); color: var(--ink); font-family: inherit; font-weight: 700; font-size: .95rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .08s ease, background .12s, border-color .12s, box-shadow .12s;
        }
        .np__box:hover:not(:disabled){ border-color: var(--gold,#2563eb); transform: translateY(-1px); }
        .np__box.is-sel{ background: var(--gold,#2563eb); border-color: var(--gold-d,#1d4ed8); color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,.35); }
        .np__box.is-taken{ background: #eceff3; color: #aeb6c1; border-color: #e3e8ee; cursor: not-allowed; text-decoration: line-through; }
        .np__cap{ text-align: center; color: var(--ink3); font-size: .75rem; margin-top: .75rem; }

        .np__bar{ position: sticky; bottom: 0; margin-top: 1.5rem; background: var(--card,#fff); border: 1px solid var(--border,#e2e7ee); border-radius: 14px 14px 0 0; box-shadow: 0 -8px 24px rgba(0,0,0,.08); padding: .85rem 1rem; }
        .np__bar-inner{ display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .np__bar-info{ display: flex; align-items: center; gap: .6rem; }
        .np__bar-count{ font-family: var(--font-cormorant,serif); font-size: 1.6rem; line-height: 1; color: var(--ink); }
        .np__bar-lbl{ font-size: .85rem; color: var(--ink3); }
        .np__clear{ background: none; border: none; color: var(--ink3); font-size: .72rem; text-decoration: underline; cursor: pointer; font-family: inherit; }
        .np__bar-actions{ display: flex; align-items: center; gap: .9rem; flex-wrap: wrap; }
        .np__credit{ display: flex; align-items: center; gap: .4rem; font-size: .78rem; color: var(--ink2,var(--ink)); cursor: pointer; }
        .np__credit input{ width: 15px; height: 15px; accent-color: var(--gold,#2563eb); }
        .np__go{ background: var(--gold,#2563eb); color: #fff; border: none; border-radius: 10px; font-family: inherit; font-size: .78rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; padding: .9rem 1.6rem; cursor: pointer; text-decoration: none; box-shadow: 0 8px 20px rgba(37,99,235,.3); }
        .np__go:disabled{ opacity: .55; cursor: not-allowed; box-shadow: none; }
        .np__err{ color: #c0392b; font-size: .8rem; margin: .6rem 0 0; text-align: center; }

        @media (max-width: 560px){
          .np__grid{ grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
          .np__box{ font-size: .85rem; border-radius: 8px; }
          .np__bar-inner{ gap: .6rem; }
          .np__go{ flex: 1; text-align: center; padding: .85rem 1rem; }
          .np__bar-actions{ width: 100%; }
        }
      `}</style>
    </div>
  )
}
