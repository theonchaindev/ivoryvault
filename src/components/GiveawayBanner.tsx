'use client'

import { useState, useEffect } from 'react'
import { SOCIAL } from '@/lib/social'

// Temporary promo banner — remove this component (and its use in the (main)
// layout) once the giveaway ends.
const PHRASE = 'ENTER OUR FREE GIVEAWAY HERE'
const REPEATS = 8

export default function GiveawayBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open])

  const items = Array.from({ length: REPEATS })

  return (
    <>
      <button className="gwb" onClick={() => setOpen(true)} aria-label="Enter our free giveaway">
        <span className="gwb__gift" aria-hidden="true">🎁</span>
        <span className="gwb__marquee">
          <span className="gwb__track">
            {items.map((_, i) => (
              <span className="gwb__item" key={i}>{PHRASE}<span className="gwb__sep" aria-hidden="true">✦</span></span>
            ))}
            {items.map((_, i) => (
              <span className="gwb__item" key={`d${i}`} aria-hidden="true">{PHRASE}<span className="gwb__sep">✦</span></span>
            ))}
          </span>
        </span>
        <span className="gwb__arrow" aria-hidden="true">›</span>
      </button>

      {open && (
        <div className="gwm" role="dialog" aria-modal="true" aria-label="How to enter the giveaway" onClick={() => setOpen(false)}>
          <div className="gwm__card" onClick={e => e.stopPropagation()}>
            <button className="gwm__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>

            <h2 className="gwm__title">HOW TO <span>ENTER</span></h2>
            <div className="gwm__rule"><span>✦</span></div>

            <ol className="gwm__steps">
              <li><span className="gwm__num">1</span><p>Tag <b className="b">3</b> friends on our giveaway post</p></li>
              <li><span className="gwm__num">2</span><p>Sign up for a <b className="g">FREE</b> account here on our website</p></li>
              <li><span className="gwm__num">3</span><p>Share our profile to your social media profile story, whether that&apos;s <b className="b">Facebook</b> or <b className="b">Instagram</b> &amp; tag us</p></li>
            </ol>

            <div className="gwm__rule"><span>✦</span></div>

            <p className="gwm__prizes"><b>3</b> PRIZES. <b>3</b> WINNERS.</p>
            <p className="gwm__ann">Winners announced 12th August live on <b className="b">Instagram</b>.</p>

            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="gwm__cta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
              View Giveaway Post
            </a>
          </div>
        </div>
      )}

      <style>{`
        /* ── Banner ── */
        .gwb { position: relative; z-index: 1; display: flex; align-items: center; gap: .75rem; width: 100%; border: none; cursor: pointer;
          background: linear-gradient(90deg,#15307a,#2a4fbf); color: #fff; padding: .7rem 1rem; overflow: hidden;
          border-top: 1px solid rgba(255,255,255,.1); border-bottom: 1px solid rgba(0,0,0,.25); font-family: inherit; }
        .gwb::before, .gwb::after { content: ''; position: absolute; top: 0; bottom: 0; width: 42px; z-index: 2; pointer-events: none; }
        .gwb::before { left: 34px; background: linear-gradient(90deg,#1b378f,rgba(27,55,143,0)); }
        .gwb::after { right: 34px; background: linear-gradient(270deg,#274ab3,rgba(39,74,179,0)); }
        .gwb__gift { flex-shrink: 0; font-size: 1.15rem; filter: drop-shadow(0 0 6px rgba(230,180,34,.6)); }
        .gwb__arrow { flex-shrink: 0; font-size: 1.5rem; font-weight: 700; color: #ffd873; line-height: 1; }
        .gwb__marquee { flex: 1; overflow: hidden; -webkit-mask-image: none; }
        .gwb__track { display: inline-flex; white-space: nowrap; will-change: transform; animation: gwb-scroll 22s linear infinite; }
        .gwb__item { display: inline-flex; align-items: center; font-size: .8125rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
        .gwb__sep { color: #ffd873; margin: 0 1.5rem; font-size: .7rem; }
        .gwb:hover .gwb__track { animation-play-state: paused; }
        @keyframes gwb-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .gwb__track { animation: none; } }

        /* ── Modal ── */
        .gwm { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.25rem;
          background: rgba(4,8,18,.72); backdrop-filter: blur(4px); animation: gwm-fade .2s ease; }
        @keyframes gwm-fade { from { opacity: 0; } to { opacity: 1; } }
        .gwm__card { position: relative; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; text-align: center;
          background: radial-gradient(120% 100% at 50% 0%, #142446 0%, #0a1122 70%); border: 1px solid rgba(201,162,74,.55);
          border-radius: 22px; padding: 2.5rem 2rem 2rem; box-shadow: 0 30px 80px rgba(0,0,0,.6); animation: gwm-pop .25s cubic-bezier(.22,1,.36,1); }
        @keyframes gwm-pop { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
        .gwm__close { position: absolute; top: 1rem; right: 1.1rem; background: none; border: none; color: rgba(255,255,255,.7); font-size: 1.4rem; cursor: pointer; line-height: 1; transition: color .2s; }
        .gwm__close:hover { color: #fff; }
        .gwm__title { font-size: clamp(1.9rem,6vw,2.6rem); font-weight: 800; color: #fff; letter-spacing: .02em; }
        .gwm__title span { color: #2f6bf0; }
        .gwm__rule { display: flex; align-items: center; justify-content: center; gap: .75rem; margin: 1rem 0; }
        .gwm__rule::before, .gwm__rule::after { content: ''; height: 1px; width: 90px; background: linear-gradient(90deg,transparent,rgba(201,162,74,.7),transparent); }
        .gwm__rule span { color: #c9a24a; font-size: .8rem; }
        .gwm__steps { list-style: none; padding: 0; margin: 0; text-align: left; }
        .gwm__steps li { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,.08); }
        .gwm__steps li:last-child { border-bottom: none; }
        .gwm__num { flex-shrink: 0; width: 42px; height: 42px; border: 2px solid #c9a24a; color: #c9a24a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; }
        .gwm__steps p { font-size: 1rem; line-height: 1.45; color: rgba(255,255,255,.9); }
        .gwm__steps b.b { color: #2f6bf0; }
        .gwm__steps b.g { color: #e6b422; }
        .gwm__prizes { font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: .01em; }
        .gwm__prizes b { color: #2f6bf0; }
        .gwm__ann { font-size: 1rem; color: rgba(255,255,255,.8); margin-top: .25rem; }
        .gwm__ann b { color: #2f6bf0; font-weight: 700; }
        .gwm__cta { display: inline-flex; align-items: center; justify-content: center; gap: .75rem; margin-top: 1.75rem; width: 100%;
          background: #fff; color: #0a1122; text-decoration: none; font-size: .9375rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          padding: 1.05rem 1.5rem; border-radius: 14px; transition: transform .15s, box-shadow .2s; }
        .gwm__cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,.4); }
      `}</style>
    </>
  )
}
