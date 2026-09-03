'use client'

// Premium navy + gold "Fancy Another Go? / Repeat This Order!" reorder prompt,
// shown after a player finishes the ticket/instant games or the spin wheel.
export default function RepeatOrderPopup({
  onRepeat, onClose, subtitle, buttonLabel = 'Repeat This Order!',
}: {
  onRepeat: () => void
  onClose: () => void
  subtitle?: string
  buttonLabel?: string
}) {
  return (
    <div className="ro-overlay" onClick={onClose}>
      <div className="ro" onClick={e => e.stopPropagation()}>
        <div className="ro-pattern" aria-hidden />
        {['3%,8%', '88%,10%', '10%,30%', '92%,34%', '6%,62%', '90%,66%', '14%,86%', '86%,88%'].map((p, i) => {
          const [l, t] = p.split(',')
          return <span key={i} className="ro-star" style={{ left: l, top: t, animationDelay: `${i * 0.4}s` }}>✦</span>
        })}

        <button className="ro-x" onClick={onClose} aria-label="Close">✕</button>

        <div className="ro-brand">IVORY VAULT</div>
        <div className="ro-subbrand"><span className="ro-dash" />Competitions<span className="ro-dash" /></div>

        <h2 className="ro-head">
          <span className="ro-fancy">Fancy</span>
          <span className="ro-go">Another Go?</span>
        </h2>

        <div className="ro-rule"><span>✦</span></div>

        <p className="ro-text">{subtitle || 'Try your luck again — hit repeat and you’re back at checkout!'}</p>

        <button className="ro-btn" onClick={onRepeat}>{buttonLabel}</button>

        <div className="ro-foot"><span className="ro-dash" />✉&nbsp; FREE postal entry available<span className="ro-dash" /></div>
      </div>

      <style>{`
        .ro-overlay{ position:fixed; inset:0; z-index:3000; background:rgba(4,8,20,.8); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1.25rem; animation:ro-f .22s ease; }
        @keyframes ro-f{ from{opacity:0} to{opacity:1} }
        .ro{ position:relative; overflow:hidden; width:100%; max-width:380px; text-align:center; color:#fff;
          background:radial-gradient(120% 80% at 50% 0%, #14284e 0%, #0c1c3c 45%, #081428 100%);
          border-radius:26px; padding:2.1rem 1.9rem 1.5rem;
          border:2px solid #caa24e;
          box-shadow:0 30px 90px rgba(0,0,0,.6), inset 0 0 0 4px rgba(202,162,78,.18);
          animation:ro-p .4s cubic-bezier(.22,1,.36,1); }
        @keyframes ro-p{ from{opacity:0; transform:scale(.92) translateY(10px)} to{opacity:1; transform:none} }
        .ro-pattern{ position:absolute; inset:0; opacity:.10; pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='68' height='82' viewBox='0 0 68 82'%3E%3Cg fill='none' stroke='%23caa24e' stroke-width='1'%3E%3Crect x='22' y='28' width='24' height='24' transform='rotate(45 34 40)'/%3E%3C/g%3E%3Ctext x='34' y='45' text-anchor='middle' font-family='Georgia,serif' font-weight='700' font-size='15' fill='%23caa24e'%3EIV%3C/text%3E%3C/svg%3E"); }
        .ro-star{ position:absolute; color:#f4d789; font-size:.7rem; text-shadow:0 0 6px rgba(244,215,137,.9); pointer-events:none; animation:ro-tw 2.6s ease-in-out infinite; }
        @keyframes ro-tw{ 0%,100%{opacity:.35; transform:scale(.85)} 50%{opacity:1; transform:scale(1.15)} }

        .ro-x{ position:absolute; top:.9rem; right:.9rem; z-index:2; width:34px; height:34px; border-radius:50%; border:1.5px solid rgba(202,162,78,.8); background:rgba(255,255,255,.04); color:#e9d9a6; font-size:.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .ro-x:hover{ background:rgba(202,162,78,.18); }

        .ro-brand{ position:relative; font-family:var(--font-cormorant,'Cormorant Garamond',serif); font-size:1.35rem; font-weight:600; letter-spacing:.22em; color:#fff; }
        .ro-subbrand{ position:relative; display:flex; align-items:center; justify-content:center; gap:.5rem; font-size:.56rem; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#caa24e; margin-top:.35rem; }
        .ro-dash{ display:inline-block; width:26px; height:1px; background:linear-gradient(90deg,transparent,#caa24e,transparent); }

        .ro-head{ position:relative; margin:1.15rem 0 0; line-height:.92; font-family:'Arial Black','Archivo Black','Helvetica Neue',sans-serif; font-weight:900; letter-spacing:-.01em; }
        .ro-fancy{ display:block; font-size:clamp(2.4rem,13vw,3.1rem); color:#fff; text-shadow:0 2px 10px rgba(120,180,255,.35), 0 1px 0 rgba(0,0,0,.3); }
        .ro-go{ display:block; font-size:clamp(2.4rem,13vw,3.1rem);
          background:linear-gradient(180deg,#fbeaa6 0%,#eacb68 42%,#cb9f3e 72%,#b6862c 100%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          filter:drop-shadow(0 2px 2px rgba(0,0,0,.35)); }

        .ro-rule{ position:relative; height:1px; margin:1rem auto 0; max-width:220px; background:linear-gradient(90deg,transparent,#caa24e,transparent); }
        .ro-rule span{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#f4d789; font-size:.7rem; text-shadow:0 0 8px rgba(244,215,137,.9); }

        .ro-text{ position:relative; color:#eaf0fb; font-size:1rem; line-height:1.5; margin:1.1rem auto 0; max-width:24ch; font-weight:500; }

        .ro-btn{ position:relative; display:block; width:100%; margin:1.4rem 0 0; cursor:pointer; font-family:'Arial Black','Archivo Black',sans-serif; font-weight:900; color:#fff; font-size:1.15rem; letter-spacing:.01em;
          padding:.95rem 1rem; border-radius:14px; border:2px solid #caa24e;
          background:linear-gradient(180deg,#3d7fe0 0%,#2a5fbf 52%,#1f4aa0 100%);
          box-shadow:0 10px 24px rgba(31,74,160,.5), inset 0 1px 0 rgba(255,255,255,.35), 0 0 22px rgba(202,162,78,.25);
          text-shadow:0 1px 2px rgba(0,0,0,.35); transition:transform .15s ease, box-shadow .15s ease; }
        .ro-btn:hover{ transform:translateY(-1px); box-shadow:0 14px 30px rgba(31,74,160,.6), inset 0 1px 0 rgba(255,255,255,.4), 0 0 30px rgba(202,162,78,.4); }

        .ro-foot{ position:relative; display:flex; align-items:center; justify-content:center; gap:.55rem; margin-top:1.25rem; font-size:.66rem; font-weight:600; letter-spacing:.02em; color:#cdb877; }
      `}</style>
    </div>
  )
}
