import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import CountdownTimer from '@/components/CountdownTimer'
import TicketSelector from './TicketSelector'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCompetition(slug: string) {
  try {
    return await prisma.competition.findUnique({
      where: { slug },
      include: {
        _count: { select: { tickets: true } },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const competition = await getCompetition(slug)
  if (!competition) return { title: 'Not Found — Ivory Vault' }
  return {
    title: `${competition.title} — Ivory Vault`,
    description: competition.description,
  }
}

export default async function CompetitionPage({ params }: PageProps) {
  const { slug } = await params
  const competition = await getCompetition(slug)

  if (!competition) notFound()

  const images = (() => {
    try { return JSON.parse(competition.images) as string[] }
    catch { return [] }
  })()

  const heroImage = images[0]
  const remaining = competition.maxTickets - competition.ticketsSold
  const percentSold = Math.round((competition.ticketsSold / competition.maxTickets) * 100)

  return (
    <div style={{ backgroundColor: '#fdf6ef', minHeight: 'calc(100vh - 72px)' }}>
      {/* Hero */}
      <div
        style={{
          height: 'clamp(300px, 45vw, 520px)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#e8d8cc',
        }}
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt={competition.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f0e3d3 0%, #e8d8cc 50%, #d4c4b8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.4 }}>
              <circle cx="40" cy="40" r="38" stroke="#b76e79" strokeWidth="1" />
              <path d="M25 40 L33 32 L40 42 L48 28 L55 40" stroke="#b76e79" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}
        {/* Prize badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            backgroundColor: '#b76e79',
            color: 'white',
            padding: '0.75rem 1.5rem',
          }}
        >
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Prize Value</p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1 }}>
            {formatCurrency(competition.prizeValue)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '4rem', alignItems: 'start' }}>
          {/* Left: Details */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 600,
                color: '#1c1a18',
                lineHeight: 1.1,
                marginBottom: '0.5rem',
              }}
            >
              {competition.title}
            </h1>
            {competition.subtitle && (
              <p style={{ fontSize: '1.1rem', color: '#9a8878', fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', marginBottom: '2rem' }}>
                {competition.subtitle}
              </p>
            )}

            {competition.drawDate && (
              <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', marginBottom: '0.75rem' }}>
                  Draw closes in
                </p>
                <CountdownTimer drawDate={competition.drawDate.toISOString()} />
                <p style={{ fontSize: '0.8rem', color: '#9a8878', marginTop: '0.5rem' }}>
                  Draw date: {formatDate(competition.drawDate)}
                </p>
              </div>
            )}

            {/* Progress */}
            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#fffcf9', border: '1px solid #e8d8cc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>Tickets Sold</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#1c1a18' }}>
                    {competition.ticketsSold.toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>Remaining</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#b76e79' }}>
                    {remaining.toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ height: '4px', backgroundColor: '#e8d8cc', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentSold}%`,
                    background: 'linear-gradient(90deg, #b76e79, #d4959e)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9a8878', marginTop: '0.5rem', textAlign: 'right' }}>
                {percentSold}% sold of {competition.maxTickets.toLocaleString()} total tickets
              </p>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1c1a18',
                  marginBottom: '1rem',
                }}
              >
                About This Prize
              </h2>
              <div
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  color: '#5c524a',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {competition.description}
              </div>
            </div>

            {/* How the draw works */}
            <div style={{ padding: '2rem', backgroundColor: '#fffcf9', border: '1px solid #e8d8cc' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.375rem',
                  fontWeight: 600,
                  color: '#1c1a18',
                  marginBottom: '1.25rem',
                }}
              >
                How the Draw Works
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'All tickets are assigned a unique number at the time of purchase.',
                  'When the competition closes (or all tickets are sold), a winner is drawn at random.',
                  'Draws are conducted using verified random number generation and recorded live.',
                  'The winner is contacted within 24 hours and prizes dispatched within 7 days.',
                  'Full audit trail available — every ticket is verifiable.',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1rem',
                        color: '#b76e79',
                        fontWeight: 600,
                        minWidth: '20px',
                        lineHeight: 1.5,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <p style={{ fontSize: '0.875rem', color: '#5c524a', lineHeight: 1.7 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Ticket purchase */}
          <div style={{ position: 'sticky', top: '96px' }}>
            <TicketSelector competition={{
              id: competition.id,
              title: competition.title,
              ticketPrice: competition.ticketPrice,
              maxTickets: competition.maxTickets,
              ticketsSold: competition.ticketsSold,
              status: competition.status,
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
