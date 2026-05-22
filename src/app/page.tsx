import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import AnimatedSection from '@/components/AnimatedSection'
import { formatCurrency } from '@/lib/utils'

async function getData() {
  try {
    const [comps, winners] = await Promise.all([
      prisma.competition.findMany({
        where: { status: 'active' },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
        take: 7,
      }),
      prisma.winner.findMany({
        where: { announced: true },
        orderBy: { drawnAt: 'desc' },
        take: 4,
        include: {
          user: { select: { name: true } },
          competition: { select: { title: true, prizeValue: true } },
        },
      }),
    ])
    return { comps, winners }
  } catch {
    return { comps: [], winners: [] }
  }
}

function parseImgs(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export default async function Home() {
  const { comps, winners } = await getData()
  const hero = comps[0] ?? null
  const heroImg = hero ? (parseImgs(hero.images)[0] ?? null) : null
  const rest = comps.slice(1)

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO  — full-screen featured competition
      ═══════════════════════════════════════════════════════════ */}
      <section className="hero">
        {/* BG image */}
        {heroImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImg} alt="" className="hero__bg" />
        )}
        <div className="hero__overlay" />

        {/* Top trust bar */}
        <div className="hero__trust">
          <span>UK Regulated</span>
          <span className="hero__dot" />
          <span>Free Entry Available</span>
          <span className="hero__dot" />
          <span>Draws Recorded Live</span>
          <span className="hero__dot" />
          <span>18+ Only</span>
        </div>

        <div className="hero__content">
          {hero ? (
            <>
              {/* Labels */}
              <div className="hero__eyebrow">
                <span className="hero__tag">Featured Competition</span>
                <span className="hero__tag hero__tag--rg">Live Now</span>
              </div>

              {/* Title */}
              <h1 className="hero__title">{hero.title}</h1>
              {hero.subtitle && <p className="hero__subtitle">{hero.subtitle}</p>}

              {/* Stats row */}
              <div className="hero__stats">
                <div className="hero__stat">
                  <span className="hero__stat-val">{formatCurrency(hero.prizeValue)}</span>
                  <span className="hero__stat-label">Prize Value</span>
                </div>
                <div className="hero__stat-divider" />
                <div className="hero__stat">
                  <span className="hero__stat-val">{formatCurrency(hero.ticketPrice)}</span>
                  <span className="hero__stat-label">Per Ticket</span>
                </div>
                <div className="hero__stat-divider" />
                <div className="hero__stat">
                  <span className="hero__stat-val">{(hero.maxTickets - hero.ticketsSold).toLocaleString()}</span>
                  <span className="hero__stat-label">Tickets Remaining</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="hero__progress-wrap">
                <div className="hero__progress-track">
                  <div className="hero__progress-fill" style={{ width: `${Math.min(100, Math.round((hero.ticketsSold / hero.maxTickets) * 100))}%` }} />
                </div>
                <span className="hero__progress-pct">{Math.round((hero.ticketsSold / hero.maxTickets) * 100)}% sold</span>
              </div>

              {/* CTAs */}
              <div className="hero__ctas">
                <Link href={`/competitions/${hero.slug}`} className="btn-rg hero__cta-primary">Enter This Competition →</Link>
                <Link href="/competitions" className="hero__cta-ghost">View All Competitions</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="hero__title hero__title--large">Win The<br /><em>Extraordinary</em></h1>
              <p className="hero__subtitle">Premium prize competitions. Transparent draws. Life-changing prizes.</p>
              <div className="hero__ctas">
                <Link href="/competitions" className="btn-rg hero__cta-primary">Browse Competitions →</Link>
              </div>
            </>
          )}
        </div>

        {/* Scroll cue */}
        <div className="hero__scroll">
          <span>Scroll</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE COMPETITIONS GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="comps-section">
        <div className="section-inner">

          {/* Header */}
          <AnimatedSection>
            <div className="section-head">
              <div>
                <p className="section-label">Live Now — {comps.length} Active</p>
                <h2 className="section-title">Open Competitions</h2>
              </div>
              <Link href="/competitions" className="section-link">
                See all competitions <span>→</span>
              </Link>
            </div>
          </AnimatedSection>

          {/* Grid */}
          {rest.length > 0 ? (
            <div className="comps-grid">
              {rest.map((c, i) => (
                <CompetitionCard
                  key={c.id}
                  competition={{ ...c, subtitle: c.subtitle ?? null, drawDate: c.drawDate?.toISOString() ?? null }}
                  index={i}
                />
              ))}
            </div>
          ) : comps.length === 0 ? (
            <div className="empty-state">
              <p>New competitions launching soon — <Link href="/signup">sign up</Link> to be notified.</p>
            </div>
          ) : null}

          {comps.length > 0 && (
            <AnimatedSection>
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/competitions" className="btn-dark">Browse All Competitions</Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — compact strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="how-strip">
        <div className="section-inner">
          <AnimatedSection>
            <div className="how-strip__head">
              <p className="section-label">Simple Process</p>
              <h2 className="section-title">How It Works</h2>
            </div>
            <div className="how-strip__steps">
              {[
                { n: '01', t: 'Choose', b: 'Browse our curated luxury competitions and pick the prize you want to win.' },
                { n: '02', t: 'Get Tickets', b: 'Select your ticket quantity. More entries = more chances to win.' },
                { n: '03', t: 'Pay Securely', b: 'Checkout via Stripe. All major cards, Apple Pay & Google Pay accepted.' },
                { n: '04', t: 'Watch the Draw', b: 'Live recorded draws. Winners notified instantly. Prizes dispatched in 48hrs.' },
              ].map((s, i) => (
                <div key={s.n} className="how-step">
                  <p className="how-step__n">{s.n}</p>
                  <div className="how-step__dot" />
                  <h3 className="how-step__t">{s.t}</h3>
                  <p className="how-step__b">{s.b}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/how-it-works" className="btn-ghost">Full Details →</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS — dark band
      ═══════════════════════════════════════════════════════════ */}
      <AnimatedSection>
        <section className="stats-band">
          {[
            { v: '10,000+', l: 'Members' },
            { v: '£500k+', l: 'Prizes Awarded' },
            { v: '100%', l: 'Transparent Draws' },
            { v: '48hrs', l: 'Prize Delivery' },
          ].map((s, i, a) => (
            <div key={s.l} className="stat-item" style={{ borderRight: i < a.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
              <p className="stat-v">{s.v}</p>
              <p className="stat-l">{s.l}</p>
            </div>
          ))}
        </section>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════
          WINNERS
      ═══════════════════════════════════════════════════════════ */}
      {winners.length > 0 && (
        <section className="winners-section">
          <div className="section-inner">
            <AnimatedSection>
              <div className="section-head">
                <div>
                  <p className="section-label">Previous Draws</p>
                  <h2 className="section-title">Recent Winners</h2>
                </div>
                <Link href="/winners" className="section-link">All winners <span>→</span></Link>
              </div>
            </AnimatedSection>
            <div className="winners-grid">
              {winners.map((w, i) => {
                const name = (() => { const p = w.user.name.trim().split(' '); return p.length > 1 ? `${p[0]} ${p[p.length-1][0]}.` : p[0] })()
                return (
                  <AnimatedSection key={w.id} delay={i * .07}>
                    <div className="winner-card">
                      <div className="winner-card__star">★</div>
                      <p className="winner-card__name">{name}</p>
                      <p className="winner-card__prize">{w.prizeTitle || w.competition.title}</p>
                      <p className="winner-card__val">{formatCurrency(w.prizeValue ?? w.competition.prizeValue)}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA BAND
      ═══════════════════════════════════════════════════════════ */}
      <section className="cta-band">
        <AnimatedSection>
          <p className="section-label" style={{ color: 'rgba(255,255,255,.5)' }}>Don&apos;t miss out</p>
          <h2 className="cta-band__title">Your next win starts with one ticket.</h2>
          <div className="cta-band__btns">
            <Link href="/competitions" className="btn-rg">Browse Competitions</Link>
            <Link href="/signup" className="cta-band__ghost">Create free account →</Link>
          </div>
        </AnimatedSection>
      </section>

      <Footer />

      <style>{`
        /* ─── HERO ─────────────────────────────── */
        .hero {
          position: relative; min-height: 100svh;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden;
          background: linear-gradient(145deg, #1a0f14 0%, #0e0a10 50%, #0d0c0b 100%);
        }
        .hero__bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 25%;
          opacity: .45;
        }
        .hero__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(12,11,10,.15) 0%,
            rgba(12,11,10,.05) 35%,
            rgba(12,11,10,.6) 70%,
            rgba(12,11,10,.88) 100%
          );
        }
        .hero__trust {
          position: absolute; top: 80px; left: 0; right: 0;
          display: flex; align-items: center; justify-content: center;
          gap: .875rem; z-index: 2;
          font-size: .5625rem; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.45);
        }
        .hero__dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,.25); flex-shrink: 0; }
        .hero__content {
          position: relative; z-index: 2;
          padding: 5rem clamp(1.5rem, 5vw, 5rem) clamp(3rem, 5vw, 4.5rem);
          max-width: 820px;
        }
        .hero__eyebrow { display: flex; gap: .5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .hero__tag {
          font-size: .5625rem; font-weight: 500; letter-spacing: .18em; text-transform: uppercase;
          padding: .3rem .75rem; border: 1px solid rgba(255,255,255,.2);
          color: rgba(255,255,255,.7);
        }
        .hero__tag--rg { background: var(--rg); border-color: var(--rg); color: #fff; }
        .hero__title {
          font-family: var(--font-cormorant,serif);
          font-size: clamp(2.75rem, 6vw, 5.5rem);
          font-weight: 300; line-height: 1;
          letter-spacing: -.02em; color: #fff;
          margin-bottom: .75rem;
        }
        .hero__title--large { font-size: clamp(3rem, 7vw, 6rem); }
        .hero__title em { font-style: italic; color: #f0d8dd; }
        .hero__subtitle {
          font-size: clamp(.875rem, 1.5vw, 1.0625rem); line-height: 1.65;
          color: rgba(255,255,255,.65); max-width: 500px;
          margin-bottom: 1.75rem;
        }
        .hero__stats {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,.07); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.1);
          width: fit-content; margin-bottom: 1.25rem;
        }
        .hero__stat { padding: .875rem 1.5rem; }
        .hero__stat-val { display: block; font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 500; color: #fff; line-height: 1; }
        .hero__stat-label { display: block; font-size: .5rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-top: .2rem; }
        .hero__stat-divider { width: 1px; align-self: stretch; background: rgba(255,255,255,.1); margin: .625rem 0; }
        .hero__progress-wrap { display: flex; align-items: center; gap: .875rem; margin-bottom: 1.75rem; max-width: 440px; }
        .hero__progress-track { flex: 1; height: 2px; background: rgba(255,255,255,.15); overflow: hidden; }
        .hero__progress-fill { height: 100%; background: var(--rg); transition: width .6s ease; }
        .hero__progress-pct { font-size: .5625rem; letter-spacing: .1em; color: rgba(255,255,255,.45); white-space: nowrap; }
        .hero__ctas { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .hero__cta-primary { padding: .9375rem 2rem; font-size: .6875rem; }
        .hero__cta-ghost {
          font-size: .6875rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.6); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.25);
          padding-bottom: 2px; transition: color .2s, border-color .2s;
        }
        .hero__cta-ghost:hover { color: #fff; border-color: rgba(255,255,255,.65); }
        .hero__scroll {
          position: absolute; bottom: 1.75rem; right: 2.5rem;
          display: flex; flex-direction: column; align-items: center; gap: .5rem;
          z-index: 2;
        }
        .hero__scroll span { font-size: .5rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.3); writing-mode: vertical-rl; }
        .hero__scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,.35), transparent); }

        /* ─── SECTIONS ─────────────────────────── */
        .section-inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem); }
        .section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: clamp(2rem,4vw,3.5rem); flex-wrap: wrap; gap: 1rem; }
        .section-label { font-size: .5625rem; letter-spacing: .2em; text-transform: uppercase; color: var(--rg); margin-bottom: .75rem; }
        .section-title { font-family: var(--font-cormorant,serif); font-size: clamp(2.25rem,4vw,3.75rem); font-weight: 300; line-height: .95; letter-spacing: -.02em; color: var(--ink); }
        .section-link { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; transition: border-color .2s, color .2s; white-space: nowrap; }
        .section-link:hover { color: var(--rg); border-color: var(--rg); }

        /* ─── COMPETITIONS SECTION ─────────────── */
        .comps-section { padding: clamp(4rem,7vw,7rem) 0; background: var(--off); }
        .comps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
        .comps-grid > * { background: var(--off); }
        @media (max-width: 1100px) { .comps-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .comps-grid { grid-template-columns: 1fr; } }
        .empty-state { padding: 4rem; text-align: center; font-size: .9375rem; color: var(--ink3); border: 1px dashed var(--border); }
        .empty-state a { color: var(--rg); }

        /* ─── HOW IT WORKS STRIP ───────────────── */
        .how-strip { padding: clamp(4rem,7vw,7rem) 0; background: #fff; border-top: 1px solid var(--border); }
        .how-strip__head { margin-bottom: clamp(2.5rem,4vw,3.5rem); }
        .how-strip__steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; border-top: 1px solid var(--border); }
        .how-step { padding: clamp(1.75rem,3vw,2.5rem) clamp(1.25rem,2vw,2rem); border-right: 1px solid var(--border); }
        .how-step:last-child { border-right: none; }
        .how-step__n { font-family: var(--font-cormorant,serif); font-size: clamp(3.5rem,5vw,5.5rem); font-weight: 300; color: #ede8e0; line-height: 1; margin-bottom: 1rem; letter-spacing: -.02em; }
        .how-step__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--rg); margin-bottom: 1rem; }
        .how-step__t { font-family: var(--font-cormorant,serif); font-size: clamp(1.25rem,2vw,1.5rem); font-weight: 500; color: var(--ink); margin-bottom: .625rem; }
        .how-step__b { font-size: .8125rem; line-height: 1.75; color: var(--ink2); }
        @media (max-width: 768px) { .how-strip__steps { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .how-strip__steps { grid-template-columns: 1fr; } }

        /* ─── STATS BAND ───────────────────────── */
        .stats-band { background: var(--ink); display: grid; grid-template-columns: repeat(4,1fr); }
        .stat-item { padding: clamp(2.5rem,5vw,4rem) clamp(1.5rem,3vw,3rem); text-align: center; }
        .stat-v { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,5vw,4rem); font-weight: 300; color: var(--rg-pale,#f2e8ea); line-height: 1; margin-bottom: .5rem; }
        .stat-l { font-size: .5625rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.35); }
        @media (max-width: 640px) { .stats-band { grid-template-columns: 1fr 1fr; } }

        /* ─── WINNERS ──────────────────────────── */
        .winners-section { padding: clamp(4rem,7vw,7rem) 0; background: var(--off); border-top: 1px solid var(--border); }
        .winners-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); margin-top: clamp(2rem,4vw,3rem); }
        .winner-card { background: #fff; padding: 2.25rem; }
        .winner-card__star { font-size: .875rem; color: var(--rg); margin-bottom: 1rem; }
        .winner-card__name { font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 400; color: var(--ink); line-height: 1.1; margin-bottom: .375rem; }
        .winner-card__prize { font-size: .8125rem; color: var(--ink3); margin-bottom: 1.25rem; line-height: 1.5; }
        .winner-card__val { font-family: var(--font-cormorant,serif); font-size: 1.25rem; font-weight: 500; color: var(--rg); padding-top: 1rem; border-top: 1px solid var(--border); }
        @media (max-width: 900px) { .winners-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .winners-grid { grid-template-columns: 1fr; } }

        /* ─── CTA BAND ─────────────────────────── */
        .cta-band { background: var(--ink); padding: clamp(5rem,9vw,9rem) clamp(1.5rem,5vw,5rem); text-align: center; }
        .cta-band__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.5rem,6vw,5.5rem); font-weight: 300; color: #fff; line-height: .95; letter-spacing: -.02em; margin: 1rem 0 2.5rem; }
        .cta-band__btns { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .cta-band__ghost { color: rgba(255,255,255,.6); font-size: .75rem; text-decoration: none; letter-spacing: .06em; align-self: center; transition: color .2s; }
        .cta-band__ghost:hover { color: #fff; }

        @media (max-width: 640px) {
          .hero__stats { flex-wrap: wrap; }
          .hero__trust { display: none; }
        }
      `}</style>
    </>
  )
}
