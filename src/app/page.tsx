export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import HomeHero from '@/components/HomeHero'
import HowItWorks from '@/components/HowItWorks'
import StatsCounter from '@/components/StatsCounter'
import WinnerCard from '@/components/WinnerCard'
import FeaturedGrid from '@/components/FeaturedGrid'

async function getData() {
  try {
    const [comps, winners] = await Promise.all([
      prisma.competition.findMany({
        where: { status: 'active' },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
        take: 9,
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

  const serializedComps = comps.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
    heroImg: parseImgs(c.images)[0] ?? null,
  }))

  const featured = serializedComps.slice(0, 3)
  const rest = serializedComps.slice(3, 9)

  return (
    <>
      <Navbar />

      {/* Short punchy hero bar */}
      <HomeHero count={comps.length} />

      {/* ── Featured competitions masonry ── */}
      {featured.length > 0 && (
        <FeaturedGrid competitions={featured} />
      )}

      {/* ── All competitions grid ── */}
      {rest.length > 0 && (
        <section className="hp-all">
          <div className="hp-inner">
            <div className="hp-section-head">
              <div>
                <p className="hp-label">Browse</p>
                <h2 className="hp-title">All Live Competitions</h2>
              </div>
              <Link href="/competitions" className="hp-see-all">View all <span>→</span></Link>
            </div>
            <div className="hp-grid">
              {rest.map((c, i) => (
                <CompetitionCard key={c.id} competition={c} index={i} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href="/competitions" className="btn-dark">Browse All Competitions</Link>
            </div>
          </div>
        </section>
      )}

      {comps.length === 0 && (
        <section className="hp-all">
          <div className="hp-inner">
            <div className="hp-empty">
              New competitions launching soon — <Link href="/signup">sign up</Link> to be notified.
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <HowItWorks />

      {/* ── Stats ── */}
      <StatsCounter stats={[
        { v: '10,000+', l: 'Members' },
        { v: '£500k+', l: 'Prizes Awarded' },
        { v: '100%', l: 'Transparent Draws' },
        { v: '48hrs', l: 'Prize Delivery' },
      ]} />

      {/* ── Recent winners ── */}
      {winners.length > 0 && (
        <section className="hp-winners">
          <div className="hp-inner">
            <div className="hp-section-head">
              <div>
                <p className="hp-label">Previous Draws</p>
                <h2 className="hp-title">Recent Winners</h2>
              </div>
              <Link href="/winners" className="hp-see-all">All winners <span>→</span></Link>
            </div>
            <div className="hp-winners-grid">
              {winners.map((w, i) => (
                <WinnerCard key={w.id} index={i} winner={{ ...w, drawnAt: w.drawnAt.toISOString(), prizeTitle: w.prizeTitle ?? null, prizeValue: w.prizeValue ?? null }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="hp-cta">
        <p className="hp-cta__eyebrow">Don&apos;t miss out</p>
        <h2 className="hp-cta__title">Your next win starts<br />with one ticket.</h2>
        <div className="hp-cta__btns">
          <Link href="/competitions" className="btn-rg" style={{ padding: '1.0625rem 2.5rem', fontSize: '.6875rem' }}>Browse Competitions</Link>
          <Link href="/signup" className="hp-cta__ghost">Create free account →</Link>
        </div>
      </section>

      <Footer />

      <style>{`
        .hp-inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,4vw,5rem); }
        .hp-section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .hp-label { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: .625rem; }
        .hp-title { font-family: var(--font-cormorant,serif); font-size: clamp(2rem,4vw,3.25rem); font-weight: 300; line-height: .95; letter-spacing: -.02em; color: var(--ink); }
        .hp-see-all { font-size: .6875rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; white-space: nowrap; transition: color .2s, border-color .2s; }
        .hp-see-all:hover { color: var(--rg); border-color: var(--rg); }

        /* All comps section */
        .hp-all { padding: clamp(4rem,6vw,6rem) 0; background: var(--off); }
        .hp-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }
        @media (max-width: 1200px) { .hp-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 860px) { .hp-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) {
          .hp-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; gap: 1rem; padding-bottom: 1rem; scrollbar-width: none; }
          .hp-grid::-webkit-scrollbar { display: none; }
          .hp-grid > * { flex: 0 0 80vw; scroll-snap-align: start; }
        }
        .hp-empty { padding: 4rem 2rem; text-align: center; font-size: .9375rem; color: var(--ink3); border: 1px dashed var(--border); }
        .hp-empty a { color: var(--rg); }

        /* Stats */
        .stats-band { background: var(--ink); display: grid; grid-template-columns: repeat(4,1fr); }
        .stat-item { padding: clamp(2.5rem,5vw,4rem) clamp(1.5rem,3vw,3rem); text-align: center; border-right: 1px solid rgba(255,255,255,.07); }
        .stat-item:last-child { border-right: none; }
        .stat-v { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,5vw,4rem); font-weight: 300; color: var(--rg-pale); line-height: 1; margin-bottom: .5rem; }
        .stat-l { font-size: .5375rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.3); }
        @media (max-width: 640px) { .stats-band { grid-template-columns: 1fr 1fr; } }

        /* Winners */
        .hp-winners { padding: clamp(4rem,6vw,6rem) 0; background: var(--off); border-top: 1px solid var(--border); }
        .hp-winners-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 2rem; }
        @media (max-width: 1000px) { .hp-winners-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .hp-winners-grid { grid-template-columns: 1fr; } }

        /* CTA */
        .hp-cta { background: var(--ink); padding: clamp(5rem,9vw,9rem) clamp(1.5rem,5vw,5rem); text-align: center; }
        .hp-cta__eyebrow { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: 1.25rem; }
        .hp-cta__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.75rem,6vw,5.75rem); font-weight: 300; color: #fff; line-height: .95; letter-spacing: -.02em; margin-bottom: 2.5rem; }
        .hp-cta__btns { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .hp-cta__ghost { color: rgba(255,255,255,.5); font-size: .75rem; text-decoration: none; letter-spacing: .08em; transition: color .2s; }
        .hp-cta__ghost:hover { color: #fff; }
      `}</style>
    </>
  )
}
