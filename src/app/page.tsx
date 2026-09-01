export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SiteAlert from '@/components/SiteAlert'
import { effectiveNow, isCompHidden } from '@/lib/outage'
import { ENTER_WINDOW_MS } from '@/lib/compState'
import CompetitionCard from '@/components/CompetitionCard'
import { getPublishedGameCards } from '@/lib/instantGames'
import { getListingOrder, sortByListingOrder } from '@/lib/listing'
import HomeHero from '@/components/HomeHero'
import HowItWorks from '@/components/HowItWorks'
// import StatsCounter from '@/components/StatsCounter' // hidden for now
import WinnerCard from '@/components/WinnerCard'
import AnimatedSection from '@/components/AnimatedSection'
import StarDivider from '@/components/StarDivider'

async function getData() {
  try {
    const now = new Date(effectiveNow())
    const [comps, winners] = await Promise.all([
      prisma.competition.findMany({
        where: {
          status: 'active',
          // Show only enterable comps: exclude past-draw and "Enter Soon" (>30 days out).
          OR: [
            { drawDate: null },
            { type: 'instant', drawDate: { gt: now } },
            { type: { not: 'instant' }, drawDate: { gt: now, lte: new Date(now.getTime() + ENTER_WINDOW_MS) } },
          ],
        },
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
    return { comps: comps.filter(c => !isCompHidden(c.slug)), winners }
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
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? null,
    prizeValue: c.prizeValue,
    ticketPrice: c.ticketPrice,
    maxTickets: c.maxTickets,
    ticketsSold: c.ticketsSold,
    heroImg: parseImgs(c.images)[0] ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
  }))

  const serialize = (c: typeof comps[number]) => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate?.toISOString() ?? null,
  })
  const [gameCards, order] = await Promise.all([getPublishedGameCards(), getListingOrder()])
  // Everything (comps + ticket/instant games) in one list: saved manual order
  // first, then earliest finishing first.
  const withGames = sortByListingOrder([...gameCards, ...comps.map(serialize)], order, effectiveNow())
  const swiperComps = withGames                  // horizontal swiper — all
  const gridComps = withGames.slice(0, 4)        // 2x2 grid — first 4

  return (
    <>
      <SiteAlert />
      <Navbar />

      {/* Crystal Comps-style carousel hero */}
      <div style={{ paddingTop: 'calc(68px + var(--banner-h, 0px))' }}>
        <HomeHero comps={heroComps} />
      </div>

      {/* Live competitions grid */}
      <section className="page-section page-section--cream">
        <div className="section-inner">
          <AnimatedSection>
            <div className="section-head">
              <div>
                <p className="section-head__label">Live Now — {comps.length} Active</p>
                <h2 className="section-head__title">Open Competitions</h2>
              </div>
              <Link href="/competitions" className="section-head__link">View all →</Link>
            </div>
          </AnimatedSection>

          <div style={{ marginBottom: '2rem' }}><StarDivider /></div>

          {swiperComps.length > 0 ? (
            <>
              {/* Horizontal swiper — all competitions */}
              <div className="comp-swiper">
                {swiperComps.map((c, i) => <CompetitionCard key={c.id} competition={c} index={i} />)}
              </div>

              {/* 2x2 grid below */}
              <div className="comp-grid-2x2">
                {gridComps.map((c, i) => <CompetitionCard key={`g-${c.id}`} competition={c} index={i} />)}
              </div>
            </>
          ) : (
            <div className="empty-state">
              New competitions coming soon — <Link href="/signup">sign up</Link> to be notified.
            </div>
          )}

          {gridComps.length > 0 && (
            <AnimatedSection delay={0.1}>
              <div className="comp-grid-cta">
                <Link href="/competitions" className="btn-gold">Browse All Competitions</Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      <HowItWorks />

      {/* Stats section hidden for now
      <StatsCounter stats={[
        { v: '10,000+', l: 'Happy Members' },
        { v: '£500k+', l: 'Prizes Awarded' },
        { v: '100%', l: 'Transparent Draws' },
        { v: '48hrs', l: 'Prize Delivery' },
      ]} /> */}

      {/* Winners hidden for now — re-enable once we have winners to show */}
      {false && winners.length > 0 && (
        <section className="page-section page-section--cream">
          <div className="section-inner">
            <AnimatedSection>
              <div className="section-head">
                <div>
                  <p className="section-head__label">Real People, Real Prizes</p>
                  <h2 className="section-head__title">Recent Winners</h2>
                </div>
                <Link href="/winners" className="section-head__link">All winners →</Link>
              </div>
            </AnimatedSection>

            <div style={{ marginBottom: '2rem' }}><StarDivider /></div>

            <div className="winners-grid">
              {winners.map((w, i) => (
                <WinnerCard key={w.id} index={i} winner={{ ...w, drawnAt: w.drawnAt.toISOString(), prizeTitle: w.prizeTitle ?? null, prizeValue: w.prizeValue ?? null }} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <AnimatedSection>
          <p className="cta-band__label">Start Winning Today</p>
          <h2 className="cta-band__title">Your extraordinary win<br />starts with one ticket.</h2>
          <p className="cta-band__sub">Join thousands of members who&apos;ve already won luxury prizes.</p>
          <div className="cta-band__btns">
            <Link href="/competitions" className="btn-gold">Browse Competitions</Link>
            <Link href="/signup" className="cta-band__ghost">Create Free Account →</Link>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </>
  )
}
