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
import { motion } from 'motion/react'

async function getData() {
  try {
    const [comps, winners] = await Promise.all([
      prisma.competition.findMany({
        where: { status: 'active' },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
        take: 8,
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

export default async function Home() {
  const { comps, winners } = await getData()

  const serialized = comps.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
  }))

  return (
    <>
      <Navbar />
      <HomeHero count={comps.length} />

      {/* ── Live competitions ── */}
      <section className="hp-section hp-section--light">
        <div className="hp-inner">
          <div className="hp-head">
            <div>
              <p className="hp-label">Live Now</p>
              <h2 className="hp-h2">Open Competitions</h2>
            </div>
            <Link href="/competitions" className="hp-view-all">View all competitions →</Link>
          </div>

          {serialized.length > 0 ? (
            <div className="hp-grid">
              {serialized.map((c, i) => (
                <CompetitionCard key={c.id} competition={c} index={i} />
              ))}
            </div>
          ) : (
            <div className="hp-empty">
              New competitions coming soon. <Link href="/signup">Sign up</Link> to be notified.
            </div>
          )}

          {serialized.length > 0 && (
            <div className="hp-grid-cta">
              <Link href="/competitions" className="btn-rg">Browse All Competitions</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <HowItWorks />

      {/* ── Stats ── */}
      <StatsCounter stats={[
        { v: '10,000+', l: 'Happy Members' },
        { v: '£500k+', l: 'Prizes Awarded' },
        { v: '100%', l: 'Transparent Draws' },
        { v: '48hrs', l: 'Prize Delivery' },
      ]} />

      {/* ── Recent winners ── */}
      {winners.length > 0 && (
        <section className="hp-section hp-section--light">
          <div className="hp-inner">
            <div className="hp-head">
              <div>
                <p className="hp-label">Real People, Real Prizes</p>
                <h2 className="hp-h2">Recent Winners</h2>
              </div>
              <Link href="/winners" className="hp-view-all">All winners →</Link>
            </div>
            <div className="hp-winners-grid">
              {winners.map((w, i) => (
                <WinnerCard
                  key={w.id} index={i}
                  winner={{ ...w, drawnAt: w.drawnAt.toISOString(), prizeTitle: w.prizeTitle ?? null, prizeValue: w.prizeValue ?? null }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="hp-cta">
        <div className="hp-cta__inner">
          <p className="hp-cta__label">Start Winning Today</p>
          <h2 className="hp-cta__title">Your extraordinary win<br />starts with one ticket.</h2>
          <p className="hp-cta__sub">Join thousands of members who&apos;ve already won luxury prizes.</p>
          <div className="hp-cta__btns">
            <Link href="/competitions" className="hp-cta__btn-primary">Browse Competitions</Link>
            <Link href="/signup" className="hp-cta__btn-ghost">Create Free Account →</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .hp-inner { max-width: 1440px; margin: 0 auto; padding: 0 clamp(1.5rem,3vw,3rem); }
        .hp-section { padding: clamp(3rem,5vw,5rem) 0; }
        .hp-section--light { background: var(--off); border-top: 1px solid var(--border); }
        .hp-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .hp-label { font-size: .5375rem; letter-spacing: .2em; text-transform: uppercase; color: var(--rg); margin-bottom: .5rem; }
        .hp-h2 { font-family: var(--font-cormorant,serif); font-size: clamp(1.75rem,3.5vw,2.75rem); font-weight: 300; color: var(--ink); line-height: 1; letter-spacing: -.02em; }
        .hp-view-all { font-size: .625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); text-decoration: none; white-space: nowrap; transition: color .2s; align-self: flex-end; }
        .hp-view-all:hover { color: var(--rg); }
        .hp-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; }
        @media (max-width: 1200px) { .hp-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 820px) { .hp-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 520px) { .hp-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; padding-bottom: .5rem; scrollbar-width: none; } .hp-grid::-webkit-scrollbar{display:none} .hp-grid>*{flex:0 0 78vw;scroll-snap-align:start} }
        .hp-grid-cta { text-align: center; margin-top: 2.5rem; }
        .hp-empty { padding: 3rem 2rem; text-align: center; font-size: .9375rem; color: var(--ink3); border: 1px dashed var(--border); background: #fff; }
        .hp-empty a { color: var(--rg); }

        /* Stats */
        .stats-band { background: var(--ink); display: grid; grid-template-columns: repeat(4,1fr); }
        .stat-item { padding: clamp(2.5rem,5vw,4rem) clamp(1.5rem,3vw,3rem); text-align: center; border-right: 1px solid rgba(255,255,255,.07); }
        .stat-item:last-child { border-right: none; }
        .stat-v { font-family: var(--font-cormorant,serif); font-size: clamp(2.5rem,5vw,3.75rem); font-weight: 300; color: var(--rg-pale); line-height: 1; margin-bottom: .5rem; }
        .stat-l { font-size: .5375rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.35); }
        @media (max-width: 640px) { .stats-band { grid-template-columns: 1fr 1fr; } }

        /* Winners */
        .hp-winners-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; }
        @media (max-width: 1000px) { .hp-winners-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .hp-winners-grid { grid-template-columns: 1fr; } }

        /* CTA band */
        .hp-cta { background: var(--ink); padding: clamp(4rem,8vw,8rem) clamp(1.5rem,4vw,4rem); text-align: center; }
        .hp-cta__inner { max-width: 680px; margin: 0 auto; }
        .hp-cta__label { font-size: .5375rem; letter-spacing: .22em; text-transform: uppercase; color: var(--rg); margin-bottom: 1rem; }
        .hp-cta__title { font-family: var(--font-cormorant,serif); font-size: clamp(2.5rem,5.5vw,5rem); font-weight: 300; color: #fff; line-height: .95; letter-spacing: -.025em; margin-bottom: 1rem; }
        .hp-cta__sub { font-size: .875rem; color: rgba(255,255,255,.45); margin-bottom: 2.5rem; line-height: 1.6; }
        .hp-cta__btns { display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
        .hp-cta__btn-primary { background: var(--rg); color: #fff; font-size: .6875rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; padding: 1rem 2.25rem; text-decoration: none; transition: background .2s, transform .15s; }
        .hp-cta__btn-primary:hover { background: var(--rg-dark); transform: translateY(-1px); }
        .hp-cta__btn-ghost { color: rgba(255,255,255,.55); font-size: .75rem; text-decoration: none; letter-spacing: .08em; transition: color .2s; }
        .hp-cta__btn-ghost:hover { color: #fff; }
      `}</style>
    </>
  )
}
