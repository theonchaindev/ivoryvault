'use client'

import { useEffect, useState } from 'react'

/**
 * Competition-page promo popup for an active "buy X get Y free" bundle — dark
 * navy + gold luxury treatment, matching the offer popup. Shows once per
 * browser session (keyed by comp + offer numbers).
 */
export default function BundlePopup({ buyQty, freeQty, storageKey }: { buyQty: number; freeQty: number; storageKey: string }) {
  const [open, setOpen] = useState(false)
  const key = `ivv-bundle-${storageKey}-${buyQty}-${freeQty}`

  useEffect(() => {
    if (!buyQty || !freeQty) return
    let dismissed = false
    try { dismissed = sessionStorage.getItem(key) === '1' } catch { /* ignore */ }
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 1800)
      return () => clearTimeout(t)
    }
  }, [buyQty, freeQty, key])

  const close = () => {
    setOpen(false)
    try { sessionStorage.setItem(key, '1') } catch { /* ignore */ }
  }

  if (!buyQty || !freeQty || !open) return null

  return (
    <div className="ivbp" role="dialog" aria-modal="true" aria-label="Bundle offer" onClick={close}>
      <div className="ivbp__panel" onClick={e => e.stopPropagation()}>
        <div className="ivbp__frame">
          <button className="ivbp__x" onClick={close} aria-label="Close">✕</button>
          <div className="ivbp__word ivbp__gold">IVORY VAULT</div>
          <div className="ivbp__eb ivbp__gold ivbp__num">BUY {buyQty} TICKETS</div>
          <div className="ivbp__hero ivbp__gold"><span className="ivbp__n ivbp__num">{freeQty}</span><span className="ivbp__free">FREE</span></div>
          <div className="ivbp__row">
            <span className="ivbp__ln" />
            <span className="ivbp__qual ivbp__gold">ENTRIES</span>
            <span className="ivbp__ln ivbp__ln--r" />
          </div>
          <button className="ivbp__cta" onClick={close}>Shop This Competition</button>
        </div>
      </div>

      <style>{`
        .ivbp{ position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center;
          padding:1.25rem; background:rgba(6,9,16,.72); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:ivbpFade .25s ease; }
        .ivbp__panel{ position:relative; width:100%; max-width:430px; padding:20px; border-radius:20px;
          background:radial-gradient(120% 80% at 50% 0%, rgba(70,95,140,.20), transparent 60%), linear-gradient(160deg,#101a2e 0%,#0b1120 60%,#0a0f1b 100%);
          box-shadow:0 46px 110px rgba(0,0,0,.7); animation:ivbpPop .34s cubic-bezier(.2,.9,.3,1.2); }
        .ivbp__frame{ position:relative; border-radius:16px; padding:2rem 1.4rem 2.05rem; text-align:center; }
        .ivbp__frame::before{ content:''; position:absolute; inset:0; border-radius:16px; padding:1.5px;
          background:linear-gradient(160deg,#f0d488,#a9772e 45%,#f0d488 90%);
          -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
        .ivbp__gold{ background:linear-gradient(178deg,#fbeeb0,#f0d074 30%,#e2b455 52%,#c1913a 72%,#e9c877); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; filter:drop-shadow(0 1px 1px rgba(0,0,0,.35)); }
        .ivbp__num{ font-feature-settings:"lnum" 1,"tnum" 1; }
        .ivbp__x{ position:absolute; top:12px; right:14px; width:36px; height:36px; border-radius:999px; cursor:pointer;
          border:1.5px solid rgba(224,184,102,.7); color:#e7c877; background:rgba(231,200,120,.06); display:flex; align-items:center; justify-content:center; font-size:1rem; line-height:1; z-index:2; }
        .ivbp__word{ font-family:var(--font-cormorant,serif); font-weight:600; letter-spacing:.3em; text-indent:.3em; font-size:1.2rem; margin:.1rem 0 1.3rem; }
        .ivbp__eb{ font-family:var(--font-cormorant,serif); font-weight:700; font-size:clamp(1.5rem,7vw,1.95rem); line-height:1; letter-spacing:.03em; }
        .ivbp__hero{ font-family:var(--font-cormorant,serif); font-weight:700; line-height:.9; margin:.25rem 0 .1rem; }
        .ivbp__n{ font-size:clamp(4.5rem,20vw,6.4rem); } .ivbp__free{ font-size:clamp(2.6rem,12vw,3.7rem); margin-left:.08em; }
        .ivbp__row{ display:flex; align-items:center; justify-content:center; gap:.9rem; margin-top:.1rem; }
        .ivbp__ln{ height:1.5px; width:48px; background:linear-gradient(90deg,transparent,#c9a24b); } .ivbp__ln--r{ background:linear-gradient(90deg,#c9a24b,transparent); }
        .ivbp__qual{ font-family:var(--font-cormorant,serif); font-weight:700; font-size:clamp(1.5rem,7vw,1.95rem); letter-spacing:.18em; text-indent:.18em; line-height:1; }
        .ivbp__cta{ display:inline-block; margin-top:1.7rem; width:80%; text-align:center; border:none; cursor:pointer;
          font-weight:800; font-size:.85rem; letter-spacing:.1em; text-transform:uppercase; color:#231a08; padding:1rem; border-radius:11px;
          background:linear-gradient(180deg,#f6e39d,#caa049); box-shadow:0 12px 30px rgba(180,133,47,.45), inset 0 1px 0 rgba(255,255,255,.6); }
        .ivbp__cta:hover{ filter:brightness(1.05); }
        @keyframes ivbpFade{ from{opacity:0} to{opacity:1} }
        @keyframes ivbpPop{ from{opacity:0; transform:translateY(14px) scale(.96)} to{opacity:1; transform:none} }
        @media (prefers-reduced-motion: reduce){ .ivbp, .ivbp__panel{ animation:none } }
      `}</style>
    </div>
  )
}
