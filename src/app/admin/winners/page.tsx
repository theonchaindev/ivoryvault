import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import AdminDrawButton from './AdminDrawButton'
import AdminAnnounceButton from './AdminAnnounceButton'
import ManualWinnersManager from './ManualWinnersManager'
import { listWinners } from '@/lib/winners'

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

  // Manual (featured) winners + all competitions for the picker
  const [manualWinners, allComps] = await Promise.all([
    listWinners(),
    prisma.competition.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, drawDate: true },
    }),
  ])
  const manualForClient = manualWinners.map(w => ({
    id: w.id, name: w.name, competitionTitle: w.competitionTitle,
    drawDate: w.drawDate ? w.drawDate.toISOString() : null, image: w.image,
  }))
  const compsForClient = allComps.map(c => ({
    id: c.id, title: c.title, drawDate: c.drawDate ? c.drawDate.toISOString() : null,
  }))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
          Winners
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {winners.length} winners drawn
        </p>
      </div>

      {/* Draw a winner */}
      {drawableCompetitions.length > 0 && (
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1.25rem' }}>
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
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>{comp.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{comp.ticketsSold} tickets sold · {comp.status}</p>
                </div>
                <AdminDrawButton competitionId={comp.id} competitionTitle={comp.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winners table */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)' }}>
            All Winners
          </h2>
        </div>
        {winners.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Winner', 'Competition', 'Prize', 'Ticket #', 'Drawn', 'Announced', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {winners.map(winner => (
                <tr key={winner.id}>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{winner.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{winner.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink2)' }}>
                    {winner.competition.title}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--gold)', fontWeight: 500 }}>
                    {formatCurrency(winner.prizeValue ?? winner.competition.prizeValue)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink3)' }}>
                    #{winner.ticketNumber || '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                    {formatDate(winner.drawnAt)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        backgroundColor: winner.announced ? 'rgba(37,99,235,0.1)' : 'var(--border)',
                        color: winner.announced ? 'var(--gold)' : 'var(--ink3)',
                        border: '1px solid',
                        borderColor: winner.announced ? 'rgba(37,99,235,0.25)' : 'var(--border)',
                      }}
                    >
                      {winner.announced ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
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
            <p style={{ color: 'var(--ink3)' }}>No winners drawn yet.</p>
          </div>
        )}
      </div>

      <ManualWinnersManager winners={manualForClient} competitions={compsForClient} />
    </div>
  )
}
