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
import AnimatedSection from '@/components/AnimatedSection'

async function getData() {
  try {
    const [comps, winners] = await Promise.all([
      prisma.competition.findMany({ where: { status: 'active' }, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }], take: 8 }),
      prisma.winner.findMany({ where: { announced: true }, orderBy: { drawnAt: 'desc' }, take: 4, include: { user: { select: { name: true } }, competition: { select: { title: true, prizeValue: true, images: true, slug: true, ticketsSold: true, maxTickets: true } } } }),
    ])
    return { comps, winners }
  } catch { return { comps: [], winners: [] } }
}

export default async function Home() {
  const { comps, winners } = await getData()
  const serialized = comps.map(c => ({ ...c, subtitle: c.subtitle ?? null, drawDate: c.drawDate?.toISOString() ?? null }))

  return (
    <>
      <Navbar />
      <HomeHero count={comps.length} />

      {/* Live competitions */}
      <section className="page-section page-section--cream">
        <div className="section-inner">
          <AnimatedSection>
            <div className="section-head">
              <div>
                <p className="section-head__label">Live Now</p>
                <h2 className="section-head__title">Open Competitions</h2>
              </div>
              <Link href="/competitions" className="section-head__link">View all →</Link>
            </div>
          </AnimatedSection>

          {serialized.length > 0 ? (
            <div className="comp-grid">
              {serialized.map((c, i) => <CompetitionCard key={c.id} competition={c} index={i} />)}
            </div>
          ) : (
            <div className="empty-state">
              New competitions coming soon — <Link href="/signup">sign up</Link> to be notified.
            </div>
          )}

          {serialized.length > 0 && (
            <AnimatedSection delay={0.1}>
              <div className="comp-grid-cta">
                <Link href="/competitions" className="btn-gold">Browse All Competitions</Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      <HowItWorks />

      <StatsCounter stats={[
        { v: '10,000+', l: 'Happy Members' },
        { v: '£500k+', l: 'Prizes Awarded' },
        { v: '100%', l: 'Transparent Draws' },
        { v: '48hrs', l: 'Prize Delivery' },
      ]} />

      {winners.length > 0 && (
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
