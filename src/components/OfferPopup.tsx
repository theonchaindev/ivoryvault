'use client'

import { useEffect, useState } from 'react'

export interface OfferPopupData {
  id: string
  percentOff: number
  scope: 'site' | 'comp'
  targetTitle: string
}

/**
 * Homepage promo popup for an active "% off" offer — dark navy + gold luxury
 * treatment. Shows once per browser session (keyed by offer id).
 */
export default function OfferPopup({ offer }: { offer: OfferPopupData | null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!offer) return
    let dismissed = false
    try { dismissed = sessionStorage.getItem(`ivv-offer-${offer.id}`) === '1' } catch { /* ignore */ }
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 700)
      return () => clearTimeout(t)
    }
  }, [offer])

  const close = () => {
    setOpen(false)
    try { if (offer) sessionStorage.setItem(`ivv-offer-${offer.id}`, '1') } catch { /* ignore */ }
  }

  if (!offer || !open) return null

  return (
    <div className="ivop" role="dialog" aria-modal="true" aria-label="Special offer" onClick={close}>
      <div className="ivop__panel" onClick={e => e.stopPropagation()}>
        <div className="ivop__frame">
          <button className="ivop__x" onClick={close} aria-label="Close">✕</button>
          <div className="ivop__word ivop__gold">IVORY VAULT</div>
          <div className="ivop__got ivop__gold">YOU’VE GOT</div>
          <div className="ivop__pct ivop__gold">{offer.percentOff}%<span className="ivop__spark" /></div>
          <div className="ivop__offrow">
            <span className="ivop__ln" />
            <span className="ivop__off ivop__gold">OFF</span>
            <span className="ivop__ln ivop__ln--r" />
          </div>
          <a className="ivop__btn" href="/competitions" onClick={close}>Shop Competitions</a>
        </div>
      </div>

      <style>{`
        .ivop{ position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center;
          padding:1.25rem; background:rgba(6,9,16,.7); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
          animation:ivopFade .25s ease; }
        .ivop__panel{ position:relative; width:100%; max-width:452px; padding:22px; border-radius:20px;
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(70,95,140,.20), transparent 60%),
            linear-gradient(160deg,#101a2e 0%,#0b1120 60%,#0a0f1b 100%);
          box-shadow:0 46px 110px rgba(0,0,0,.7);
          animation:ivopPop .34s cubic-bezier(.2,.9,.3,1.2); }
        .ivop__frame{ position:relative; border-radius:16px; padding:2rem 1.5rem 2.1rem; text-align:center; }
        .ivop__frame::before{ content:''; position:absolute; inset:0; border-radius:16px; padding:1.5px;
          background:linear-gradient(160deg,#f0d488,#a9772e 45%,#f0d488 90%);
          -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
        .ivop__gold{ background:linear-gradient(178deg,#fbeeb0 0%,#f0d074 30%,#e2b455 52%,#c1913a 72%,#e9c877 100%);
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent;
          filter:drop-shadow(0 1px 1px rgba(0,0,0,.35)); }
        .ivop__x{ position:absolute; top:12px; right:14px; width:38px; height:38px; border-radius:999px; cursor:pointer;
          border:1.5px solid rgba(224,184,102,.7); color:#e7c877; background:rgba(231,200,120,.06);
          display:flex; align-items:center; justify-content:center; font-size:1.05rem; line-height:1; z-index:2; }
        .ivop__x:hover{ background:rgba(231,200,120,.14); }
        .ivop__word{ font-family:var(--font-cormorant,serif); font-weight:600; letter-spacing:.32em; text-indent:.32em;
          font-size:1.28rem; margin:.1rem 0 1.4rem; }
        .ivop__got{ font-family:var(--font-cormorant,serif); font-weight:700; font-size:clamp(2.2rem,9vw,2.9rem); line-height:1; }
        .ivop__pct{ position:relative; display:inline-block; font-family:var(--font-cormorant,serif); font-weight:700;
          font-size:clamp(5rem,22vw,7.2rem); line-height:.92; margin:.3rem 0 .1rem; }
        .ivop__spark{ position:absolute; top:6%; right:-6%; width:42px; height:42px; }
        .ivop__spark::before,.ivop__spark::after{ content:''; position:absolute; inset:0; margin:auto; background:#fff8df;
          box-shadow:0 0 14px 4px rgba(247,224,140,.85); }
        .ivop__spark::before{ width:100%; height:7%; border-radius:50%; }
        .ivop__spark::after{ width:7%; height:100%; border-radius:50%; }
        .ivop__offrow{ display:flex; align-items:center; justify-content:center; gap:1rem; margin-top:.1rem; }
        .ivop__ln{ height:1.5px; width:52px; background:linear-gradient(90deg,transparent,#c9a24b); }
        .ivop__ln--r{ background:linear-gradient(90deg,#c9a24b,transparent); }
        .ivop__off{ font-family:var(--font-cormorant,serif); font-weight:700; font-size:clamp(2.2rem,9vw,2.9rem);
          letter-spacing:.14em; text-indent:.14em; line-height:1; }
        .ivop__btn{ display:inline-block; margin-top:1.9rem; width:78%; text-decoration:none; text-align:center;
          font-weight:800; font-size:.9rem; letter-spacing:.1em; text-transform:uppercase; color:#231a08;
          padding:1.05rem 1.5rem; border-radius:12px;
          background:linear-gradient(180deg,#f6e39d 0%,#e7c368 45%,#caa049 100%);
          box-shadow:0 12px 30px rgba(180,133,47,.45), inset 0 1px 0 rgba(255,255,255,.6); }
        .ivop__btn:hover{ filter:brightness(1.05); }
        @keyframes ivopFade{ from{opacity:0} to{opacity:1} }
        @keyframes ivopPop{ from{opacity:0; transform:translateY(14px) scale(.96)} to{opacity:1; transform:none} }
        @media (prefers-reduced-motion: reduce){ .ivop, .ivop__panel{ animation:none } }
      `}</style>
    </div>
  )
}
