import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CompetitionCard from '@/components/CompetitionCard'
import HowItWorks from '@/components/HowItWorks'
import WinnerCard from '@/components/WinnerCard'
import AnimatedSection from '@/components/AnimatedSection'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatCurrency } from '@/lib/utils'

async function getFeaturedCompetitions() {
  try {
    return await prisma.competition.findMany({
      where: { status: 'active', featured: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    })
  } catch { return [] }
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
  } catch { return [] }
}

export default async function HomePage() {
  const [competitions, winners] = await Promise.all([getFeaturedCompetitions(), getRecentWinners()])

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100svh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', backgroundColor: '#faf5ee' }}>

          {/* Left — text column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: 'clamp(2rem, 5vw, 5rem) clamp(1.5rem, 4vw, 5rem)',
              paddingTop: '120px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '32px', height: '1px', background: '#b76e79' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.625rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b76e79' }}>
                UK Luxury Prize Competitions
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4.5rem, 9vw, 9rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
                color: '#141210',
                marginBottom: '0.15em',
              }}
            >
              Win
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4.5rem, 9vw, 9rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
                marginBottom: '0.15em',
                background: 'linear-gradient(120deg, #c9848e 0%, #b76e79 45%, #cc8f99 80%, #8a4f58 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The Extra
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4.5rem, 9vw, 9rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.025em',
                color: '#141210',
                marginBottom: '3rem',
              }}
            >
              ordinary
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.1rem, 2vw, 1.375rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#4a423c',
                lineHeight: 1.6,
                maxWidth: '400px',
                marginBottom: '3rem',
              }}
            >
              Curated competitions for watches, cash & premium electronics. One ticket. Life-changing prizes.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/competitions" className="btn-primary">
                Browse Competitions
              </Link>
              <Link href="/how-it-works" className="btn-outline">
                How It Works
              </Link>
            </div>

            {/* Fine print */}
            <p style={{ marginTop: '2.5rem', fontSize: '0.6875rem', color: '#8a7f76', letterSpacing: '0.04em' }}>
              UK regulated · Free postal entry available · All draws recorded
            </p>
          </div>

          {/* Right — visual column */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background image or abstract pattern */}
            {competitions[0] && (() => {
              const imgs = (() => { try { return JSON.parse(competitions[0].images) as string[] } catch { return [] } })()
              return imgs[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgs[0]}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : null
            })()}

            {/* Champagne overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(250,245,238,0.15) 0%, rgba(183,110,121,0.08) 100%)' }} />

            {/* Floating stat card */}
            <div
              style={{
                position: 'absolute',
                bottom: '3rem',
                left: '-2rem',
                background: 'white',
                padding: '1.5rem 2rem',
                borderLeft: '3px solid #b76e79',
                boxShadow: '0 20px 60px rgba(20,18,16,0.12)',
                minWidth: '220px',
              }}
            >
              {competitions[0] && (
                <>
                  <p style={{ fontSize: '0.5625rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7f76', marginBottom: '0.5rem' }}>Featured Prize</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: '#141210', lineHeight: 1 }}>
                    {formatCurrency(competitions[0].prizeValue)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#4a423c', marginTop: '0.25rem' }}>{competitions[0].title}</p>
                </>
              )}
            </div>

            {/* Decorative vertical text */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '1.5rem',
                transform: 'translateY(-50%) rotate(90deg)',
                transformOrigin: 'center',
                fontSize: '0.5625rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                whiteSpace: 'nowrap',
              }}
            >
              Ivory Vault · Est. 2025
            </div>
          </div>

          {/* Thin decorative rose gold line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #b76e79 40%, #b76e79 60%, transparent)' }} />

          {/* Mobile: hide right column and show full width */}
          <style>{`
            @media (max-width: 768px) {
              section > div:nth-child(2) { display: none; }
              section { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>

        {/* ── TICKER / MARQUEE ──────────────────────────── */}
        <div style={{ backgroundColor: '#141210', padding: '1.125rem 0', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
          <div style={{ display: 'inline-flex', animation: 'marquee 30s linear infinite', gap: '4rem' }}>
            {Array.from({ length: 3 }).flatMap(() => [
              '✦ Rolex Submariner',
              '✦ £10,000 Cash',
              '✦ MacBook Pro M4',
              '✦ 100% Transparent Draws',
              '✦ UK Regulated',
              '✦ Free Entry Available',
            ]).map((item, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-inter)', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,245,238,0.55)' }}>
                {item}
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
          `}</style>
        </div>

        {/* ── LIVE COMPETITIONS ─────────────────────────── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 5rem)', backgroundColor: '#faf5ee' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

            {/* Section header */}
            <AnimatedSection>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(2.5rem, 5vw, 4rem)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <div style={{ width: '24px', height: '1px', background: '#b76e79' }} />
                    <span style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b76e79' }}>Live Now</span>
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(2.75rem, 5vw, 4.5rem)',
                      fontWeight: 300,
                      lineHeight: 0.95,
                      letterSpacing: '-0.02em',
                      color: '#141210',
                    }}
                  >
                    Featured<br />
                    <span style={{ fontStyle: 'italic' }}>Competitions</span>
                  </h2>
                </div>
                <Link href="/competitions" className="iv-view-all">
                  View All
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>→</span>
                </Link>
                <style>{`.iv-view-all{display:flex;align-items:center;gap:.625rem;font-family:var(--font-inter);font-size:.6875rem;letter-spacing:.13em;text-transform:uppercase;color:#141210;text-decoration:none;padding-bottom:2px;border-bottom:1px solid #141210;transition:color .2s,border-color .2s}.iv-view-all:hover{color:#b76e79;border-color:#b76e79}`}</style>
              </div>
            </AnimatedSection>

            {competitions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '1px', background: '#e2d0c0' }}>
                {competitions.map((comp, i) => (
                  <div key={comp.id} style={{ background: '#faf5ee' }}>
                    <CompetitionCard
                      competition={{ ...comp, subtitle: comp.subtitle ?? null, drawDate: comp.drawDate ? comp.drawDate.toISOString() : null }}
                      index={i}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatedSection>
                <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px solid #e2d0c0', backgroundColor: 'white' }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: '#8a7f76', marginBottom: '0.5rem' }}>
                    New competitions launching soon
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#8a7f76' }}>Sign up to be notified first.</p>
                  <Link href="/signup" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>Get Notified</Link>
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────── */}
        <section style={{ backgroundColor: 'white', borderTop: '1px solid #e2d0c0' }}>
          <HowItWorks />
        </section>

        {/* ── STATS STRIP ───────────────────────────────── */}
        <AnimatedSection>
          <section style={{ backgroundColor: '#141210', padding: 'clamp(4rem, 7vw, 7rem) clamp(1.5rem, 4vw, 5rem)' }}>
            <div
              style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0',
              }}
            >
              {[
                { n: '10,000+', label: 'Members' },
                { n: '£500k+', label: 'Prizes Awarded' },
                { n: '100%', label: 'Transparent Draws' },
                { n: '48hrs', label: 'Prize Delivery' },
              ].map((s, i, arr) => (
                <div
                  key={s.label}
                  style={{
                    padding: 'clamp(2rem, 4vw, 3.5rem)',
                    textAlign: 'center',
                    borderRight: i < arr.length - 1 ? '1px solid rgba(250,245,238,0.08)' : 'none',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                      fontWeight: 300,
                      lineHeight: 1,
                      marginBottom: '0.5rem',
                      background: 'linear-gradient(120deg, #c9848e 0%, #b76e79 45%, #cc8f99 80%, #8a4f58 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {s.n}
                  </p>
                  <p style={{ fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,245,238,0.45)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ── RECENT WINNERS ─────────────────────────────── */}
        {winners.length > 0 && (
          <section style={{ padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 5rem)', backgroundColor: '#faf5ee', borderTop: '1px solid #e2d0c0' }}>
            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
              <AnimatedSection>
                <div style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <div style={{ width: '24px', height: '1px', background: '#b76e79' }} />
                    <span style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b76e79' }}>Success Stories</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em', color: '#141210' }}>
                    Recent<br /><span style={{ fontStyle: 'italic' }}>Winners</span>
                  </h2>
                </div>
              </AnimatedSection>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1px', background: '#e2d0c0' }}>
                {winners.map((winner, i) => (
                  <div key={winner.id} style={{ background: '#faf5ee' }}>
                    <AnimatedSection delay={i * 0.1}>
                      <WinnerCard winner={{ ...winner, drawnAt: winner.drawnAt.toISOString(), prizeTitle: winner.prizeTitle ?? null, prizeValue: winner.prizeValue ?? null }} />
                    </AnimatedSection>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ────────────────────────────────────────── */}
        <section
          style={{
            position: 'relative',
            padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 4vw, 5rem)',
            backgroundColor: '#faf5ee',
            borderTop: '1px solid #e2d0c0',
            overflow: 'hidden',
          }}
        >
          {/* Large decorative "IV" */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: '-2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(12rem, 22vw, 22rem)',
              fontWeight: 300,
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px #e2d0c0',
              userSelect: 'none',
              pointerEvents: 'none',
              letterSpacing: '-0.05em',
            }}
          >
            IV
          </div>

          <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <AnimatedSection>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
                <div style={{ width: '24px', height: '1px', background: '#b76e79' }} />
                <span style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b76e79' }}>Your Moment Awaits</span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(3rem, 6vw, 6rem)',
                  fontWeight: 300,
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  color: '#141210',
                  marginBottom: '2.5rem',
                  maxWidth: '700px',
                }}
              >
                Your next win is<br />
                <span style={{ fontStyle: 'italic' }}>one ticket away.</span>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/competitions" className="btn-primary">
                  Enter a Competition
                </Link>
                <Link href="/signup" className="btn-outline">
                  Create Account
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
