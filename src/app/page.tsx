import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CompetitionCard from '@/components/CompetitionCard'
import HowItWorks from '@/components/HowItWorks'
import WinnerCard from '@/components/WinnerCard'
import AnimatedSection from '@/components/AnimatedSection'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

async function getFeaturedCompetitions() {
  try {
    return await prisma.competition.findMany({
      where: { status: 'active', featured: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    })
  } catch {
    return []
  }
}

async function getRecentWinners() {
  try {
    return await prisma.winner.findMany({
      where: { announced: true },
      orderBy: { drawnAt: 'desc' },
      take: 3,
      include: {
        user: { select: { name: true } },
        competition: { select: { title: true, prizeValue: true } },
      },
    })
  } catch {
    return []
  }
}

const stats = [
  { value: '10,000+', label: 'Members' },
  { value: '£500k+', label: 'Prizes Awarded' },
  { value: '100%', label: 'Transparent Draws' },
  { value: '48hrs', label: 'Prize Delivery' },
]

export default async function HomePage() {
  const [competitions, winners] = await Promise.all([
    getFeaturedCompetitions(),
    getRecentWinners(),
  ])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* ── HERO ────────────────────────────────────────────── */}
        <section
          style={{
            minHeight: 'calc(100vh - 72px)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: '#fdf6ef',
          }}
        >
          {/* Geometric rose gold lines */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1440 900"
            fill="none"
          >
            <line x1="0" y1="200" x2="600" y2="0" stroke="#b76e79" strokeWidth="0.5" />
            <line x1="600" y1="0" x2="1440" y2="400" stroke="#b76e79" strokeWidth="0.5" />
            <line x1="0" y1="600" x2="800" y2="900" stroke="#b76e79" strokeWidth="0.5" />
            <line x1="800" y1="900" x2="1440" y2="500" stroke="#b76e79" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="1200" y2="900" stroke="#b76e79" strokeWidth="0.3" />
            <line x1="1200" y1="0" x2="200" y2="900" stroke="#b76e79" strokeWidth="0.3" />
            <circle cx="1100" cy="150" r="200" stroke="#b76e79" strokeWidth="0.4" fill="none" />
            <circle cx="1100" cy="150" r="120" stroke="#b76e79" strokeWidth="0.3" fill="none" />
            <circle cx="300" cy="700" r="160" stroke="#b76e79" strokeWidth="0.4" fill="none" />
          </svg>

          {/* Champagne gradient overlays */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 70% 40%, rgba(212,149,158,0.08) 0%, transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 20% 80%, rgba(183,110,121,0.06) 0%, transparent 50%)',
            }}
          />

          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '4rem 2rem',
              position: 'relative',
              zIndex: 1,
              width: '100%',
            }}
          >
            <div style={{ maxWidth: '700px' }}>
              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '1px', backgroundColor: '#b76e79' }} />
                <span
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: '#b76e79',
                    fontWeight: 500,
                  }}
                >
                  UK Luxury Prize Competitions
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                  fontWeight: 300,
                  lineHeight: 1.0,
                  color: '#1c1a18',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.25rem',
                }}
              >
                Win The
              </h1>
              <h1
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                  fontWeight: 600,
                  lineHeight: 1.0,
                  letterSpacing: '-0.01em',
                  marginBottom: '2rem',
                  background: 'linear-gradient(135deg, #c9848e 0%, #b76e79 40%, #d4a0a8 70%, #9a5a64 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Extraordinary
              </h1>

              {/* Subtext */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  lineHeight: 1.7,
                  color: '#5c524a',
                  marginBottom: '3rem',
                  maxWidth: '480px',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-cormorant)',
                }}
              >
                Curated luxury prizes. Transparent draws. One ticket could change everything.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <Link href="/competitions" className="btn-primary">
                  Browse Competitions
                </Link>
                <Link href="/how-it-works" className="btn-outline">
                  How It Works
                </Link>
              </div>

              {/* Trust note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                <div style={{ width: '24px', height: '1px', backgroundColor: '#e8d8cc' }} />
                <span style={{ fontSize: '0.75rem', color: '#9a8878', letterSpacing: '0.05em' }}>
                  UK regulated · Free entry available · Draws recorded live
                </span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a8878' }}>Scroll</span>
            <div
              style={{
                width: '1px',
                height: '40px',
                background: 'linear-gradient(to bottom, #b76e79, transparent)',
              }}
            />
          </div>
        </section>

        {/* ── LIVE COMPETITIONS ──────────────────────────────── */}
        <section style={{ padding: '6rem 2rem', backgroundColor: '#fdf6ef' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <AnimatedSection>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '3rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#b76e79',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Live Now
                  </p>
                  <h2
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      fontWeight: 600,
                      color: '#1c1a18',
                      lineHeight: 1.1,
                    }}
                  >
                    Featured Competitions
                  </h2>
                </div>
                <Link
                  href="/competitions"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#b76e79',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  View All
                  <span>→</span>
                </Link>
              </div>
            </AnimatedSection>

            {competitions.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {competitions.map((comp, i) => (
                  <CompetitionCard
                    key={comp.id}
                    competition={{
                      ...comp,
                      subtitle: comp.subtitle ?? null,
                      drawDate: comp.drawDate ? comp.drawDate.toISOString() : null,
                    }}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <AnimatedSection>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    border: '1px solid #e8d8cc',
                    backgroundColor: '#fffcf9',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: '#9a8878' }}>
                    New competitions launching soon
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#9a8878', marginTop: '0.5rem' }}>
                    Check back shortly or sign up to be notified.
                  </p>
                  <Link href="/signup" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                    Get Notified
                  </Link>
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section style={{ backgroundColor: '#fffcf9', borderTop: '1px solid #e8d8cc', borderBottom: '1px solid #e8d8cc' }}>
          <HowItWorks />
        </section>

        {/* ── STATS ─────────────────────────────────────────── */}
        <section style={{ padding: '5rem 2rem', backgroundColor: '#fdf6ef' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <AnimatedSection>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0',
                  border: '1px solid #e8d8cc',
                  backgroundColor: '#fffcf9',
                }}
              >
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      borderRight: i < stats.length - 1 ? '1px solid #e8d8cc' : 'none',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                        fontWeight: 600,
                        color: '#b76e79',
                        lineHeight: 1,
                        marginBottom: '0.5rem',
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#9a8878',
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── RECENT WINNERS ────────────────────────────────── */}
        {winners.length > 0 && (
          <section style={{ padding: '6rem 2rem', backgroundColor: '#fffcf9', borderTop: '1px solid #e8d8cc' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <AnimatedSection>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#b76e79',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Success Stories
                  </p>
                  <h2
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      fontWeight: 600,
                      color: '#1c1a18',
                    }}
                  >
                    Recent Winners
                  </h2>
                </div>
              </AnimatedSection>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {winners.map((winner, i) => (
                  <AnimatedSection key={winner.id} delay={i * 0.1}>
                    <WinnerCard
                      winner={{
                        ...winner,
                        drawnAt: winner.drawnAt.toISOString(),
                        prizeTitle: winner.prizeTitle ?? null,
                        prizeValue: winner.prizeValue ?? null,
                      }}
                    />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA BANNER ────────────────────────────────────── */}
        <section
          style={{
            padding: '6rem 2rem',
            background: 'linear-gradient(135deg, #b76e79 0%, #8a4f58 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative pattern */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}
            viewBox="0 0 800 300"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <circle cx="100" cy="150" r="100" stroke="white" strokeWidth="0.5" />
            <circle cx="700" cy="150" r="150" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="800" y2="250" stroke="white" strokeWidth="0.5" />
          </svg>

          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <AnimatedSection>
              <p
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '1rem',
                }}
              >
                Your Moment Awaits
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 600,
                  color: 'white',
                  lineHeight: 1.1,
                  marginBottom: '1.5rem',
                }}
              >
                Your next win is one ticket away
              </h2>
              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '2.5rem',
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                }}
              >
                Join thousands of members competing for extraordinary prizes.
              </p>
              <Link
                href="/competitions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem 2.5rem',
                  backgroundColor: 'white',
                  color: '#b76e79',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                Enter a Competition
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
