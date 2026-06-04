export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import AnimatedSection from '@/components/AnimatedSection'
import HomeHero from '@/components/HomeHero'
import StatsCounter from '@/components/StatsCounter'
import WinnerCard from '@/components/WinnerCard'
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
          competition: { select: { title: true, prizeValue: true, images: true, slug: true, ticketsSold: true, maxTickets: true } },
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
  const heroComps = comps.map(c => ({
    slug: c.slug, title: c.title, subtitle: c.subtitle ?? null,
    prizeValue: c.prizeValue, ticketPrice: c.ticketPrice,
    maxTickets: c.maxTickets, ticketsSold: c.ticketsSold,
    heroImg: parseImgs(c.images)[0] ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
  }))
  const rest = comps.slice(0, 6)

  return (
    <>
      <Navbar />

      <HomeHero comps={heroComps} />

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
          STATS — dark band with animated counters
      ═══════════════════════════════════════════════════════════ */}
      <StatsCounter stats={[
        { v: '10,000+', l: 'Members' },
        { v: '£500k+', l: 'Prizes Awarded' },
        { v: '100%', l: 'Transparent Draws' },
        { v: '48hrs', l: 'Prize Delivery' },
      ]} />

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
              {winners.map((w, i) => (
                <WinnerCard
                  key={w.id}
                  index={i}
                  winner={{
                    ...w,
                    drawnAt: w.drawnAt.toISOString(),
                    prizeTitle: w.prizeTitle ?? null,
                    prizeValue: w.prizeValue ?? null,
                  }}
                />
              ))}
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
        /* ─── SECTIONS ─────────────────────────── */
        .section-inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem); }
        .section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: clamp(2rem,4vw,3.5rem); flex-wrap: wrap; gap: 1rem; }
        .section-label { font-size: .5625rem; letter-spacing: .2em; text-transform: uppercase; color: var(--rg); margin-bottom: .75rem; }
        .section-title { font-family: var(--font-cormorant,serif); font-size: clamp(2.25rem,4vw,3.75rem); font-weight: 300; line-height: .95; letter-spacing: -.02em; color: var(--ink); }
        .section-link { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; transition: border-color .2s, color .2s; white-space: nowrap; }
        .section-link:hover { color: var(--rg); border-color: var(--rg); }

        /* ─── COMPETITIONS SECTION ─────────────── */
        .comps-section { padding: clamp(4rem,7vw,7rem) 0; background: var(--off); }
        .comps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 1100px) { .comps-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .comps-grid {
            display: flex; overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 1rem; padding-bottom: 1rem;
            scrollbar-width: none;
          }
          .comps-grid::-webkit-scrollbar { display: none; }
          .comps-grid > * { flex: 0 0 78vw; scroll-snap-align: start; }
        }
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
        .winners-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: clamp(2rem,4vw,3rem); }
        @media (max-width: 900px) { .winners-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .winners-grid { grid-template-columns: 1fr; } }

        /* ─── CTA BAND ─────────────────────────── */
        .cta-band { background: var(--ink); padding: clamp(5rem,9vw,9rem) clamp(1.5rem,5vw,5rem); text-align: center; }
        .cta-band__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.5rem,6vw,5.5rem); font-weight: 300; color: #fff; line-height: .95; letter-spacing: -.02em; margin: 1rem 0 2.5rem; }
        .cta-band__btns { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .cta-band__ghost { color: rgba(255,255,255,.6); font-size: .75rem; text-decoration: none; letter-spacing: .06em; align-self: center; transition: color .2s; }
        .cta-band__ghost:hover { color: #fff; }

      `}</style>
    </>
  )
}
