'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const GOLD = '#d9b64a'

export default function FreePostalEntryModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <>
      <button className="fpe-btn" onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
        Free Postal Entry
      </button>

      {open && (
        <div className="fpe-overlay" role="dialog" aria-modal="true" aria-label="Free postal entry" onClick={() => setOpen(false)}>
          <div className="fpe-card" onClick={e => e.stopPropagation()}>
            <button className="fpe-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>

            <div className="fpe-head">
              <span className="fpe-head-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={GOLD} strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke={GOLD} strokeWidth="1.7" strokeLinejoin="round"/></svg>
              </span>
              <h2 className="fpe-title">Free Postal Entry Available</h2>
            </div>
            <p className="fpe-sub">You may enter this competition free of charge by post. No purchase is necessary.</p>

            <div className="fpe-rule"><span>✦</span></div>

            <p className="fpe-label">Send your handwritten entry to:</p>
            <p className="fpe-addr"><strong>IVORY VAULT COMPETITIONS</strong><br/>68 Laburnum Crescent<br/>Northampton<br/>NN3 2LF</p>

            <div className="fpe-rule"><span>✦</span></div>

            <p className="fpe-label">Include:</p>
            <ul className="fpe-list">
              {['Full name', 'Postal address', 'Email address', 'Telephone number', 'Date of birth (18+)', 'Competition name', 'Correct answer to the competition question'].map(i => (
                <li key={i}>{i}</li>
              ))}
            </ul>

            <div className="fpe-notes">
              <p className="fpe-note"><span className="fpe-note-i">✉</span> Limit: 1 postal entry per competition.</p>
              <p className="fpe-note"><span className="fpe-note-i">🎟</span> Each valid postal entry will receive one entry into the competition.</p>
              <p className="fpe-note"><span className="fpe-note-i">📅</span> Postal entries must be received before the competition closing date.</p>
              <p className="fpe-note"><span className="fpe-note-i">⚖</span> Subject to the full <Link href="/terms" className="fpe-tc">Competition Terms &amp; Conditions</Link>.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fpe-btn { display: flex; align-items: center; justify-content: center; gap: .55rem; width: 100%; padding: .875rem 1rem;
          background: var(--card); border: 1.5px solid var(--border); border-radius: var(--r-card); color: var(--ink2);
          font-family: inherit; font-size: .72rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
          transition: border-color .2s, color .2s, background .2s; }
        .fpe-btn:hover { border-color: var(--ink); color: var(--ink); }

        .fpe-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.25rem;
          background: rgba(0,0,0,.72); backdrop-filter: blur(4px); animation: fpe-fade .2s ease; }
        @keyframes fpe-fade { from { opacity: 0 } to { opacity: 1 } }
        .fpe-card { position: relative; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
          background: radial-gradient(130% 90% at 82% 0%, #16130a 0%, #0a0a0c 62%); border: 1px solid rgba(217,182,74,.5);
          border-radius: 18px; padding: 2.25rem 2rem 2rem; box-shadow: 0 26px 70px rgba(0,0,0,.6), inset 0 0 40px rgba(217,182,74,.05);
          color: #efe9dc; font-family: Georgia, 'Times New Roman', serif; animation: fpe-pop .25s cubic-bezier(.22,1,.36,1); }
        @keyframes fpe-pop { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
        .fpe-close { position: absolute; top: 1rem; right: 1.1rem; background: none; border: none; color: rgba(217,182,74,.7); font-size: 1.25rem; cursor: pointer; font-family: sans-serif; line-height: 1; }
        .fpe-close:hover { color: ${GOLD}; }

        .fpe-head { display: flex; align-items: center; gap: .875rem; padding-right: 1.5rem; }
        .fpe-head-icon { flex-shrink: 0; width: 44px; height: 44px; border: 1.5px solid rgba(217,182,74,.6); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .fpe-title { font-size: clamp(1.25rem,4.4vw,1.6rem); font-weight: 700; color: ${GOLD}; letter-spacing: .02em; line-height: 1.1; }
        .fpe-sub { font-size: .95rem; line-height: 1.55; color: #e8e2d4; margin-top: 1rem; }

        .fpe-rule { display: flex; align-items: center; justify-content: center; margin: 1.25rem 0; }
        .fpe-rule::before, .fpe-rule::after { content: ''; height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(217,182,74,.5), transparent); }
        .fpe-rule span { color: ${GOLD}; padding: 0 .75rem; font-size: .8rem; }

        .fpe-label { font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: ${GOLD}; font-weight: 700; margin-bottom: .625rem; }
        .fpe-addr { font-size: 1rem; line-height: 1.6; color: #efe9dc; }
        .fpe-addr strong { display: inline-block; margin-bottom: .2rem; font-size: 1.1rem; color: #fff; }

        .fpe-list { list-style: none; padding: 0; margin: 0; }
        .fpe-list li { position: relative; padding: .3rem 0 .3rem 1.6rem; font-size: .95rem; color: #e8e2d4; }
        .fpe-list li::before { content: '✦'; position: absolute; left: 0; color: ${GOLD}; font-size: .8rem; top: .45rem; }

        .fpe-notes { margin-top: 1.5rem; display: flex; flex-direction: column; gap: .75rem; border-top: 1px solid rgba(217,182,74,.2); padding-top: 1.25rem; }
        .fpe-note { display: flex; gap: .75rem; font-size: .875rem; line-height: 1.5; color: #d8d2c4; }
        .fpe-note-i { flex-shrink: 0; filter: grayscale(.2); }
        .fpe-tc { color: ${GOLD}; text-decoration: underline; }
        .fpe-tc:hover { color: #f0d98a; }
      `}</style>
    </>
  )
}
