import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import AdminDrawButton from './AdminDrawButton'
import AdminAnnounceButton from './AdminAnnounceButton'

async function getWinnersData() {
  const [winners, competitions] = await Promise.all([
    prisma.winner.findMany({
      orderBy: { drawnAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        competition: { select: { title: true, prizeValue: true, slug: true } },
      },
    }),
    prisma.competition.findMany({
      where: {
        status: { in: ['active', 'completed'] },
        winner: null,
      },
      select: { id: true, title: true, status: true, ticketsSold: true },
    }),
  ])
  return { winners, competitions }
}

export default async function AdminWinnersPage() {
  const { winners, competitions } = await getWinnersData()
  const drawableCompetitions = competitions.filter(c => c.ticketsSold > 0)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          Winners
        </h1>
        <p style={{ color: '#9a8878', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {winners.length} winners drawn
        </p>
      </div>

      {/* Draw a winner */}
      {drawableCompetitions.length > 0 && (
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#1c1a18', marginBottom: '1.25rem' }}>
            Draw a Winner
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {drawableCompetitions.map(comp => (
              <div
                key={comp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#fdf6ef',
                  border: '1px solid #e8d8cc',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1c1a18' }}>{comp.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9a8878' }}>{comp.ticketsSold} tickets sold · {comp.status}</p>
                </div>
                <AdminDrawButton competitionId={comp.id} competitionTitle={comp.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winners table */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e8d8cc' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#1c1a18' }}>
            All Winners
          </h2>
        </div>
        {winners.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Winner', 'Competition', 'Prize', 'Ticket #', 'Drawn', 'Announced', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', borderBottom: '1px solid #e8d8cc' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {winners.map(winner => (
                <tr key={winner.id}>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1c1a18' }}>{winner.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9a8878' }}>{winner.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#5c524a' }}>
                    {winner.competition.title}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#b76e79', fontWeight: 500 }}>
                    {formatCurrency(winner.prizeValue ?? winner.competition.prizeValue)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#9a8878' }}>
                    #{winner.ticketNumber || '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.8rem', color: '#9a8878' }}>
                    {formatDate(winner.drawnAt)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        backgroundColor: winner.announced ? 'rgba(183,110,121,0.1)' : '#f0e3d3',
                        color: winner.announced ? '#b76e79' : '#9a8878',
                        border: '1px solid',
                        borderColor: winner.announced ? 'rgba(183,110,121,0.2)' : '#e8d8cc',
                      }}
                    >
                      {winner.announced ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3' }}>
                    {!winner.announced && (
                      <AdminAnnounceButton winnerId={winner.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#9a8878' }}>No winners drawn yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
