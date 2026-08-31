'use client'

import { useState } from 'react'

export interface TicketResult {
  win: boolean
  type?: 'custom' | 'credit'
  amount?: number
  name?: string
  image?: string
  ticketNumber?: number
}

const GOLD = '#d9b64a'
const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)

interface Slot { result: TicketResult | null; revealed: boolean }

export interface TicketRevealProps {
  price: number
  maxQty?: number
  title?: string
  /** Demo mode: outcomes decided client-side up front. */
  drawTickets?: (n: number) => Promise<TicketResult[] | null>
  /** Real mode: start a purchase (usually redirects to checkout). */
  onCheckout?: (n: number, useCredit: boolean) => Promise<void>
  /** Real mode: reveal the next unrevealed play, decided server-side. */
  onRevealNext?: () => Promise<TicketResult | null>
  /** Real mode: unrevealed plays the player already holds. */
  pending?: number
  signedIn?: boolean
  creditAvailable?: number
}

export default function TicketReveal({
  drawTickets, price, maxQty = 10, title = 'Ivory Vault Instant Tickets',
  onCheckout, onRevealNext, pending = 0, signedIn = true, creditAvailable = 0,
}: TicketRevealProps) {
  const realMode = !!onRevealNext
  const [phase, setPhase] = useState<'choose' | 'play'>(realMode && pending > 0 ? 'play' : 'choose')
  const [qty, setQty] = useState(3)
  const [slots, setSlots] = useState<Slot[]>(realMode && pending > 0 ? Array.from({ length: pending }, () => ({ result: null, revealed: false })) : [])
  const [balance, setBalance] = useState(0)
  const [popup, setPopup] = useState<TicketResult[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [useCredit, setUseCredit] = useState(false)
  const [err, setErr] = useState('')

  const start = async () => {
    setErr(''); setBusy(true)
    try {
      if (realMode) {
        if (onCheckout) await onCheckout(qty, useCredit) // usually redirects away
        return
      }
      if (!drawTickets) return
      const res = await drawTickets(qty)
      if (!res) { setErr('Not enough tickets left. Reset the pool in setup.'); return }
      setSlots(res.map(r => ({ result: r, revealed: false })))
      setBalance(0); setPhase('play')
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.') }
    finally { setBusy(false) }
  }

  const applyResult = (r: TicketResult, silent: boolean) => {
    if (r.win && r.type === 'credit' && r.amount) setBalance(b => b + r.amount!)
    if (!silent && r.win) setTimeout(() => setPopup([r]), 300)
  }

  const reveal = async (i: number, silent = false) => {
    if (slots[i].revealed || revealing) return
    if (realMode) {
      if (!onRevealNext) return
      setRevealing(true); setErr('')
      try {
        const r = await onRevealNext()
        if (!r) { setErr('No tickets left to reveal.'); return }
        setSlots(s => s.map((sl, idx) => (idx === i ? { result: r, revealed: true } : sl)))
        applyResult(r, silent)
      } catch { setErr('Could not reveal — please try again.') }
      finally { setRevealing(false) }
      return
    }
    const r = slots[i].result
    if (!r) return
    setSlots(s => s.map((sl, idx) => (idx === i ? { ...sl, revealed: true } : sl)))
    applyResult(r, silent)
  }

  const revealAll = async () => {
    if (realMode) {
      if (!onRevealNext || revealing) return
      setRevealing(true); setErr('')
      const won: TicketResult[] = []
      try {
        const indices = slots.map((s, i) => (s.revealed ? -1 : i)).filter(i => i >= 0)
        for (const i of indices) {
          const r = await onRevealNext()
          if (!r) break
          setSlots(s => s.map((sl, idx) => (idx === i ? { result: r, revealed: true } : sl)))
          if (r.win && r.type === 'credit' && r.amount) setBalance(b => b + r.amount!)
          if (r.win) won.push(r)
        }
      } catch { setErr('Could not reveal all — please try again.') }
      finally { setRevealing(false) }
      if (won.length) setTimeout(() => setPopup(won), 350)
      return
    }
    const won = slots.filter(s => !s.revealed && s.result?.win).map(s => s.result!).filter(Boolean)
    slots.forEach((s, i) => { if (!s.revealed) reveal(i, true) })
    if (won.length) setTimeout(() => setPopup(won), 350)
  }

  const revealedCount = slots.filter(s => s.revealed).length
  const wins = slots.filter(s => s.revealed && s.result?.win).length
  const total = qty * price

  const stub = (n: number, back = false) => (
    <div className={`tk-stub${back ? ' tk-stub--back' : ''}`}>
      <span className="tk-barcode" />
      <span className="tk-no">Nº {String(n).padStart(4, '0')}</span>
    </div>
  )

  return (
    <div className="tk">
      <h2 className="tk__title">{title}</h2>

      {phase === 'choose' && (
        <div className="tk__product">
          {/* LEFT — ticket showcase */}
          <div className="tk__stage">
            <div className="tk__stage-ticket">
              <div className="tk-face tk-front">
                <span className="tk-notch tk-notch--t" /><span className="tk-notch tk-notch--b" />
                <div className="tk-body">
                  <div className="tk-brand">IVORY VAULT</div>
                  <div className="tk-headline">Instant Win</div>
                  <div className="tk-tap">Tap to reveal ›</div>
                </div>
                {stub(1)}
              </div>
            </div>
            <p className="tk__stage-cap">Reveal instantly — every ticket could be a prize or site credit, straight away.</p>
          </div>

          {/* RIGHT — payment panel */}
          <div className="tk__buy">
            <div className="tk__buy-head">
              <span className="tk__buy-eyebrow">Instant Win Tickets</span>
              <div className="tk__buy-price">{money(price)}<span> / ticket</span></div>
            </div>
            <div className="tk__buy-field">
              <span className="tk__buy-label">Quantity</span>
              <div className="tk__qty">
                <button className="tk__step" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Fewer">−</button>
                <div className="tk__qty-val"><span className="tk__qty-n">{qty}</span></div>
                <button className="tk__step" onClick={() => setQty(q => Math.min(maxQty, q + 1))} aria-label="More">+</button>
              </div>
            </div>
            <div className="tk__buy-summary">
              <div className="tk__buy-row"><span>{qty} × {money(price)}</span><span>{money(total)}</span></div>
              <div className="tk__buy-row tk__buy-row--total"><span>Total</span><span>{money(total)}</span></div>
            </div>
            {realMode && signedIn && creditAvailable > 0 && (
              <label className="tk__credit-opt">
                <input type="checkbox" checked={useCredit} onChange={e => setUseCredit(e.target.checked)} />
                Use my site credit ({money(creditAvailable)} available)
              </label>
            )}
            {realMode && !signedIn ? (
              <a className="tk__go tk__go--link" href="/login?from=/instant-tickets">Log in to play</a>
            ) : (
              <button className="tk__go" onClick={start} disabled={busy}>{busy ? 'Loading…' : realMode ? `Pay ${money(total)} · ${qty} ticket${qty === 1 ? '' : 's'}` : `Pay ${money(total)} · Reveal ${qty} ticket${qty === 1 ? '' : 's'}`}</button>
            )}
            {err && <p className="tk__err">{err}</p>}
            <p className="tk__trust">🔒 Secure checkout · Instant reveal after payment</p>
          </div>
        </div>
      )}

      {phase === 'play' && (
        <div className="tk__product tk__product--play">
          {/* LEFT — the tickets */}
          <div className="tk__stage-play">
            <div className="tk__grid">
            {slots.map((s, i) => {
              const n = i + 1, r = s.result
              return (
                <button key={i} className={`tk-tkt${s.revealed ? ' is-open' : ''}`} onClick={() => reveal(i)} disabled={s.revealed || revealing} aria-label={`Ticket ${n}`}>
                  <div className="tk-flip">
                    {/* FRONT — sealed ticket */}
                    <div className="tk-face tk-front">
                      <span className="tk-notch tk-notch--t" /><span className="tk-notch tk-notch--b" />
                      <div className="tk-body">
                        <div className="tk-brand">IVORY VAULT</div>
                        <div className="tk-headline">Instant Win</div>
                        <div className="tk-tap">Tap to reveal ›</div>
                      </div>
                      {stub(n)}
                    </div>
                    {/* BACK — result */}
                    <div className={`tk-face tk-back ${r?.win ? 'is-win' : 'is-lose'}`}>
                      <span className="tk-notch tk-notch--t" /><span className="tk-notch tk-notch--b" />
                      <div className={`tk-body${r?.win && r.type === 'custom' ? ' tk-body--prize' : ''}`}>
                        {r?.win ? (r.type === 'credit' ? (
                          <><div className="tk-win-k">You won</div><div className="tk-credit">{money(r.amount || 0)}</div><div className="tk-credit-l">site credit</div></>
                        ) : (
                          <>
                            {r.image
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={r.image} alt="" className="tk-prize-img" />
                              : <span className="tk-prize-emoji">🎁</span>}
                            <div className="tk-prize-txt"><div className="tk-win-k">Winner</div><div className="tk-prize-name">{r.name || money(r.amount || 0)}</div></div>
                          </>
                        )) : (
                          <><span className="tk-lose-x">✕</span><span className="tk-lose">No win</span></>
                        )}
                      </div>
                      {stub(n, true)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          </div>

          {/* RIGHT — status + actions (same panel style as checkout) */}
          <div className="tk__buy tk__buy--status">
            <div className="tk__buy-head">
              <span className="tk__buy-eyebrow">Your tickets</span>
              <div className="tk__buy-price">{wins}<span> won</span></div>
            </div>
            <div className="tk__buy-summary">
              <div className="tk__buy-row"><span>Revealed</span><span>{revealedCount}/{slots.length}</span></div>
              <div className="tk__buy-row tk__buy-row--total"><span>Prizes won</span><span>{wins}</span></div>
              {balance > 0 && <div className="tk__buy-row"><span>Site credit</span><span>{money(balance)}</span></div>}
            </div>
            <div className="tk__panel-actions">
              {revealedCount < slots.length && <button className="tk__go" onClick={revealAll} disabled={revealing}>{revealing ? 'Revealing…' : 'Reveal all'}</button>}
              <button className="tk__btn tk__btn--ghost tk__btn-full" onClick={() => setPhase('choose')}>New tickets</button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="tk-pop-overlay" onClick={() => setPopup(null)}>
          <div className="tk-pop" onClick={e => e.stopPropagation()}>
            <div className="tk-pop-glow" aria-hidden />
            {popup.length === 1 ? (() => { const p = popup[0]; return (
              <>
                <div className="tk-pop-eyebrow">You&rsquo;re a winner</div>
                <div className="tk-pop-media">
                  {p.type === 'credit'
                    ? <span className="tk-pop-emoji">💰</span>
                    : p.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.image} alt="" className="tk-pop-img" />
                      : <span className="tk-pop-emoji">🎁</span>}
                </div>
                <div className="tk-pop-name">{p.type === 'credit' ? money(p.amount || 0) : (p.name || money(p.amount || 0))}</div>
                <div className="tk-pop-sub">
                  {p.type === 'credit' ? 'Site credit added to your account balance' : 'Prize won — we’ll be in touch to arrange it'}
                </div>
                <button className="tk-pop-close" onClick={() => setPopup(null)}>Continue</button>
              </>
            ) })() : (
              <>
                <div className="tk-pop-eyebrow">You&rsquo;re a winner</div>
                <div className="tk-pop-name">{popup.length} winning tickets!</div>
                <ul className="tk-pop-list">
                  {popup.map((p, i) => (
                    <li key={i} className="tk-pop-row">
                      <span className="tk-pop-thumb">
                        {p.type === 'credit'
                          ? <span className="tk-pop-thumb-emoji">💰</span>
                          : p.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.image} alt="" className="tk-pop-thumb-img" />
                            : <span className="tk-pop-thumb-emoji">🎁</span>}
                      </span>
                      <span className="tk-pop-row-name">{p.type === 'credit' ? `${money(p.amount || 0)} site credit` : (p.name || money(p.amount || 0))}</span>
                      {p.ticketNumber != null && <span className="tk-pop-row-no">Nº {String(p.ticketNumber).padStart(4, '0')}</span>}
                    </li>
                  ))}
                </ul>
                {balance > 0 && <div className="tk-pop-sub">{money(balance)} site credit added to your account balance</div>}
                <button className="tk-pop-close" onClick={() => setPopup(null)}>Continue</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .tk{ text-align:center; color:var(--ink); }
        .tk__title{ font-family:var(--font-cormorant,serif); font-size:2rem; font-weight:600; margin-bottom:1.25rem; }
        .tk__sub{ color:var(--ink3); font-size:.95rem; margin:0 auto 1.75rem; max-width:44ch; }

        /* ── PRODUCT LAYOUT ── tickets left, payment right ── */
        .tk__product{ display:grid; grid-template-columns:1.25fr 1fr; gap:2.5rem; align-items:center; max-width:900px; margin:0 auto; text-align:left; }
        .tk__stage{ display:flex; flex-direction:column; gap:1.1rem; }
        .tk__stage-ticket{ position:relative; aspect-ratio:24/10; filter:drop-shadow(0 18px 34px rgba(0,0,0,.18)); }
        .tk__stage-ticket .tk-face{ position:absolute; inset:0; }
        .tk__stage-cap{ color:var(--ink3); font-size:.9rem; line-height:1.5; margin:0; }

        .tk__buy{ background:var(--card,#fff); border:1px solid var(--border); border-radius:16px; padding:1.6rem 1.5rem; box-shadow:0 12px 40px rgba(0,0,0,.07); }
        .tk__buy-head{ display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; padding-bottom:1.1rem; border-bottom:1px solid var(--border); }
        .tk__buy-eyebrow{ font-size:.62rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--ink3); }
        .tk__buy-price{ font-family:var(--font-cormorant,serif); font-size:1.7rem; line-height:1; white-space:nowrap; }
        .tk__buy-price span{ font-family:var(--font-mono,monospace); font-size:.62rem; letter-spacing:.06em; color:var(--ink3); }
        .tk__buy-field{ display:flex; align-items:center; justify-content:space-between; margin:1.2rem 0; }
        .tk__buy-label{ font-size:.62rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ink3); }
        .tk__qty{ display:flex; align-items:center; gap:.9rem; }
        .tk__step{ width:38px; height:38px; border-radius:10px; border:1.5px solid var(--border); background:var(--card,#fff); font-size:1.2rem; cursor:pointer; color:var(--ink2,var(--ink)); font-family:inherit; line-height:1; display:flex; align-items:center; justify-content:center; }
        .tk__step:hover{ border-color:var(--ink); }
        .tk__qty-val{ min-width:44px; text-align:center; }
        .tk__qty-n{ display:block; font-family:var(--font-cormorant,serif); font-size:2rem; line-height:1; }
        .tk__buy-summary{ display:flex; flex-direction:column; gap:.5rem; padding:1rem 0 1.25rem; border-top:1px solid var(--border); }
        .tk__buy-row{ display:flex; justify-content:space-between; font-size:.9rem; color:var(--ink3); }
        .tk__buy-row span:last-child{ font-variant-numeric:tabular-nums; }
        .tk__buy-row--total{ color:var(--ink); font-weight:700; font-size:1rem; }
        .tk__go{ width:100%; background:var(--gold); color:#fff; border:none; border-radius:var(--r-btn,10px); font-family:inherit; font-size:.78rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; padding:1.05rem 1.5rem; cursor:pointer; box-shadow:0 10px 28px rgba(37,99,235,.3); }
        .tk__go:hover:not(:disabled){ background:var(--gold-d,#1d4ed8); }
        .tk__go:disabled{ opacity:.6; cursor:not-allowed; }
        .tk__go--link{ display:block; text-align:center; text-decoration:none; }
        .tk__credit-opt{ display:flex; align-items:center; gap:.5rem; font-size:.8rem; color:var(--ink2,var(--ink)); margin:0 0 .9rem; cursor:pointer; }
        .tk__credit-opt input{ width:16px; height:16px; accent-color:var(--gold); }
        .tk__trust{ text-align:center; margin:.9rem 0 0; font-size:.72rem; color:var(--ink3); }
        .tk__err{ margin:.85rem 0 0; font-size:.8rem; color:#c0392b; text-align:center; }
        .tk__product--play{ align-items:start; }
        .tk__buy--status .tk__buy-summary{ border-top:none; padding-top:.4rem; }
        .tk__panel-actions{ display:flex; flex-direction:column; gap:.6rem; }
        .tk__btn-full{ width:100%; }
        @media (max-width:720px){ .tk__product{ grid-template-columns:1fr; gap:1.75rem; } .tk__stage-ticket{ max-width:340px; margin:0 auto; width:100%; } }

        .tk__bar{ display:flex; justify-content:space-between; align-items:center; max-width:560px; margin:0 auto 1.75rem; padding:.9rem 1.25rem; background:var(--card,#fff); border:1px solid var(--border); border-radius:12px; }
        .tk__bar-k{ display:block; font-family:var(--font-mono,monospace); font-size:.6rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ink3); }
        .tk__bar-v{ font-weight:700; font-size:.95rem; }
        .tk__bar-r{ text-align:right; }
        .tk__bar-credit{ font-family:var(--font-cormorant,serif); font-size:1.5rem; color:#166534; line-height:1; }
        .tk__bar-note{ display:block; font-family:var(--font-mono,monospace); font-size:.58rem; letter-spacing:.04em; color:var(--ink3); margin-top:2px; }

        /* ── TICKETS ── landscape, tear-off stub, perforation notches, barcode ── */
        .tk__grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px; }
        .tk-tkt{ background:none; border:none; padding:0; cursor:pointer; perspective:1100px; aspect-ratio:24/10; font-family:inherit; }
        .tk-tkt:disabled{ cursor:default; }
        .tk-flip{ position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform .55s cubic-bezier(.22,1,.36,1); }
        .tk-tkt.is-open .tk-flip{ transform:rotateY(180deg); }
        .tk-face{ position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border-radius:10px; display:flex; overflow:visible; }
        .tk-front{ background:linear-gradient(135deg,#ecd99a,#c9a94e); box-shadow:0 10px 24px rgba(0,0,0,.16); color:#4a3a12; }
        .tk-back{ transform:rotateY(180deg); background:linear-gradient(150deg,#1c2534,#0e1420); color:#fff; }
        /* main body + tear-off stub */
        .tk-body{ flex:1; min-width:0; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:0 clamp(12px,4%,20px); text-align:left; gap:2px; }
        .tk-body--prize{ flex-direction:row; align-items:center; gap:10px; }
        .tk-stub{ position:relative; width:27%; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; border-left:2px dashed rgba(74,58,18,.45); }
        .tk-stub--back{ border-left-color:rgba(255,255,255,.28); }
        /* notches punched at the perforation (top + bottom) */
        .tk-notch{ position:absolute; left:73%; width:18px; height:18px; border-radius:50%; background:var(--bg,#f2f4f7); transform:translateX(-50%); z-index:2; }
        .tk-notch--t{ top:-9px; } .tk-notch--b{ bottom:-9px; }
        .tk-brand{ font-family:Georgia,serif; letter-spacing:.2em; font-size:.6rem; font-weight:700; color:#5a4718; }
        .tk-headline{ font-family:var(--font-cormorant,serif); font-size:clamp(1.05rem,4.4vw,1.5rem); font-weight:600; line-height:1; }
        .tk-tap{ font-size:.6rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#6a531c; margin-top:3px; }
        .tk-barcode{ width:70%; height:26px; background:repeating-linear-gradient(90deg,#4a3a12 0 2px, transparent 2px 5px); }
        .tk-stub--back .tk-barcode{ background:repeating-linear-gradient(90deg,rgba(255,255,255,.75) 0 2px, transparent 2px 5px); }
        .tk-no{ font-family:var(--font-mono,monospace); font-size:.58rem; letter-spacing:.06em; color:#6a531c; }
        .tk-stub--back .tk-no{ color:rgba(255,255,255,.55); }
        .tk-back.is-win{ box-shadow:inset 0 0 0 2px ${GOLD}; }
        .tk-win-k{ font-size:.52rem; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:${GOLD}; }
        .tk-credit{ font-family:var(--font-cormorant,serif); font-size:1.8rem; line-height:1; }
        .tk-credit-l{ font-size:.52rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.6); }
        .tk-prize-img{ width:46px; height:46px; object-fit:contain; border-radius:6px; flex-shrink:0; }
        .tk-prize-emoji{ font-size:2rem; flex-shrink:0; }
        .tk-prize-name{ font-family:var(--font-cormorant,serif); font-size:1.05rem; line-height:1.1; }
        .tk-lose-x{ width:30px; height:30px; border-radius:50%; border:2px solid rgba(255,255,255,.25); color:rgba(255,255,255,.45); display:flex; align-items:center; justify-content:center; font-size:.9rem; margin-bottom:2px; }
        .tk-lose{ font-size:.72rem; color:rgba(255,255,255,.5); }

        .tk__actions{ display:flex; justify-content:center; gap:.75rem; margin-top:2rem; }
        .tk__btn{ background:var(--gold); color:#fff; border:none; border-radius:var(--r-btn,10px); font-family:inherit; font-size:.75rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; padding:.9rem 1.8rem; cursor:pointer; }
        .tk__btn--ghost{ background:transparent; color:var(--ink2); border:1.5px solid var(--border); }
        .tk__btn--ghost:hover{ background:var(--ink); color:#fff; border-color:var(--ink); }

        .tk-pop-overlay{ position:fixed; inset:0; z-index:3000; background:rgba(8,10,16,.74); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:tkf .22s ease; }
        @keyframes tkf{ from{opacity:0} to{opacity:1} }
        .tk-pop{ position:relative; overflow:hidden; background:radial-gradient(130% 90% at 50% -10%,#242a16 0%,#14120c 55%,#0e0d08 100%); border:1px solid rgba(217,182,74,.55); border-radius:22px; padding:2.5rem 2rem 2rem; max-width:360px; width:100%; text-align:center; color:#fff; box-shadow:0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06); animation:tkp .4s cubic-bezier(.22,1,.36,1); }
        @keyframes tkp{ from{opacity:0; transform:scale(.92) translateY(8px)} to{opacity:1; transform:none} }
        .tk-pop-glow{ position:absolute; top:-40%; left:50%; width:320px; height:320px; transform:translateX(-50%); background:radial-gradient(circle,rgba(217,182,74,.4),transparent 62%); pointer-events:none; }
        .tk-pop-eyebrow{ position:relative; font-size:.62rem; font-weight:800; letter-spacing:.24em; text-transform:uppercase; color:${GOLD}; }
        .tk-pop-media{ position:relative; width:132px; height:132px; margin:1.1rem auto .3rem; border-radius:20px; display:flex; align-items:center; justify-content:center; background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.02)); border:1px solid rgba(217,182,74,.35); box-shadow:inset 0 0 22px rgba(217,182,74,.14); overflow:hidden; }
        .tk-pop-img{ display:block; max-width:80%; max-height:80%; width:auto; height:auto; object-fit:contain; }
        .tk-pop-emoji{ font-size:3.6rem; line-height:1; filter:drop-shadow(0 6px 14px rgba(0,0,0,.4)); }
        .tk-pop-name{ position:relative; font-family:var(--font-cormorant,serif); font-size:2rem; line-height:1.1; margin-top:.5rem; text-wrap:balance; }
        .tk-pop-sub{ position:relative; color:rgba(255,255,255,.68); font-size:.85rem; line-height:1.4; margin:.5rem auto 0; max-width:26ch; }
        .tk-pop-close{ position:relative; margin-top:1.5rem; width:100%; background:linear-gradient(180deg,#e6c85e,${GOLD}); color:#241c05; border:none; border-radius:11px; padding:.85rem 1.8rem; font-size:.72rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; font-family:inherit; box-shadow:0 8px 20px rgba(217,182,74,.3); transition:transform .15s ease, box-shadow .15s ease; }
        .tk-pop-close:hover{ transform:translateY(-1px); box-shadow:0 12px 26px rgba(217,182,74,.4); }
        .tk-pop-list{ position:relative; list-style:none; margin:1.1rem 0 0; padding:0; display:flex; flex-direction:column; gap:.55rem; max-height:46vh; overflow-y:auto; }
        .tk-pop-row{ display:flex; align-items:center; gap:.75rem; text-align:left; background:rgba(255,255,255,.05); border:1px solid rgba(217,182,74,.22); border-radius:12px; padding:.55rem .7rem; }
        .tk-pop-thumb{ flex-shrink:0; width:42px; height:42px; border-radius:9px; display:flex; align-items:center; justify-content:center; background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.02)); border:1px solid rgba(217,182,74,.3); overflow:hidden; }
        .tk-pop-thumb-img{ display:block; max-width:82%; max-height:82%; width:auto; height:auto; object-fit:contain; }
        .tk-pop-thumb-emoji{ font-size:1.4rem; line-height:1; }
        .tk-pop-row-name{ flex:1; min-width:0; font-family:var(--font-cormorant,serif); font-size:1.05rem; line-height:1.15; }
        .tk-pop-row-no{ flex-shrink:0; font-family:var(--font-mono,monospace); font-size:.58rem; letter-spacing:.06em; color:rgba(255,255,255,.45); }
      `}</style>
    </div>
  )
}
