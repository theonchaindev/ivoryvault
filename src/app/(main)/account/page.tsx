import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

async function getUserTickets(userId: string) {
  try {
    return await prisma.ticket.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            prizeValue: true,
            drawDate: true,
          },
        },
      },
    })
  } catch {
    return []
  }
}

export const metadata = {
  title: 'My Account — Ivory Vault',
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tickets = await getUserTickets(session.userId)

  const totalSpent = tickets.reduce((sum, t) => {
    return sum + t.quantity
  }, 0)

  return (
    <div style={{ backgroundColor: '#fdf6ef', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid #e8d8cc', backgroundColor: '#fffcf9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b76e79', marginBottom: '0.5rem' }}>
            Welcome Back
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: '#1c1a18' }}>
            {session.name}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9a8878', marginTop: '0.375rem' }}>{session.email}</p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {[
            { label: 'Total Entries', value: tickets.length },
            { label: 'Total Tickets', value: totalSpent.toLocaleString() },
            { label: 'Active Entries', value: tickets.filter(t => t.competition.status === 'active').length },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                padding: '2rem',
                backgroundColor: '#fffcf9',
                border: '1px solid #e8d8cc',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', fontWeight: 600, color: '#b76e79', lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', marginTop: '0.5rem' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Ticket history */}
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: '#1c1a18', marginBottom: '1.5rem' }}>
          My Entries
        </h2>

        {tickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: '#fffcf9',
                  border: '1px solid #e8d8cc',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <Link
                    href={`/competitions/${ticket.competition.slug}`}
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#1c1a18',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#b76e79')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#1c1a18')}
                  >
                    {ticket.competition.title}
                  </Link>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9a8878' }}>
                      Entered: {formatDate(ticket.purchasedAt)}
                    </span>
                    {ticket.competition.drawDate && (
                      <span style={{ fontSize: '0.8rem', color: '#9a8878' }}>
                        Draw: {formatDate(ticket.competition.drawDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>Tickets</p>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#1c1a18' }}>
                      {ticket.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>Prize</p>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#b76e79' }}>
                      {formatCurrency(ticket.competition.prizeValue)}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        backgroundColor: ticket.competition.status === 'active' ? 'rgba(183,110,121,0.1)' : '#f0e3d3',
                        color: ticket.competition.status === 'active' ? '#b76e79' : '#9a8878',
                        border: `1px solid ${ticket.competition.status === 'active' ? 'rgba(183,110,121,0.2)' : '#e8d8cc'}`,
                      }}
                    >
                      {ticket.competition.status === 'active' ? 'Live' : ticket.competition.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid #e8d8cc', backgroundColor: '#fffcf9' }}>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: '#9a8878', marginBottom: '0.5rem' }}>
              No entries yet
            </p>
            <p style={{ fontSize: '0.85rem', color: '#9a8878', marginBottom: '2rem' }}>
              Browse our live competitions and enter today.
            </p>
            <Link href="/competitions" className="btn-primary">
              Browse Competitions
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
