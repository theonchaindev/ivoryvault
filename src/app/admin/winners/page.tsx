import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import AdminDrawButton from './AdminDrawButton'
import AdminAnnounceButton from './AdminAnnounceButton'
import ManualWinnersManager from './ManualWinnersManager'
import { listWinners } from '@/lib/winners'
import { isCompClosed } from '@/lib/compState'
import { listAllClaims } from '@/lib/prizeClaims'

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
      select: { id: true, title: true, status: true, ticketsSold: true, drawDate: true, type: true },
    }),
  ])
  return { winners, competitions }
}

export default async function AdminWinnersPage() {
  const { winners, competitions } = await getWinnersData()
  const claims = await listAllClaims()
  // A winner can only be picked once the competition has closed (draw date passed).
  const drawableCompetitions = competitions.filter(c => c.ticketsSold > 0 && isCompClosed(c))

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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
            Winners
          </h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {winners.length + manualForClient.length} winners
          </p>
        </div>
        <a href="/admin/winner-email" className="btn-primary" style={{ padding: '0.7rem 1.4rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          ✦ Send Winner Email
        </a>
      </div>

      {/* Featured winners — add / manage (shown at the top) */}
      <ManualWinnersManager winners={manualForClient} competitions={compsForClient} />

      <div style={{ marginTop: '2.5rem' }} />

      {/* Pick a winner — only competitions that have closed */}
      {drawableCompetitions.length > 0 && (
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.35rem' }}>
            Pick a Winner
          </h2>
          <p style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Competitions below have closed and are ready for a winner to be picked.</p>
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
        {(winners.length > 0 || manualForClient.length > 0) ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Winner', 'Competition', 'Prize', 'Ticket #', 'Drawn', 'Announced', 'Delivery', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Featured (manually added) winners */}
              {manualForClient.map(mw => (
                <tr key={mw.id}>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {mw.image && <img src={mw.image} alt="" style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover' }} />}
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{mw.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink2)' }}>
                    {mw.competitionTitle}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink3)' }}>—</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink3)' }}>—</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                    {mw.drawDate ? formatDate(new Date(mw.drawDate)) : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--gold)', border: '1px solid rgba(37,99,235,0.25)' }}>
                      Featured
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>—</td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }} />
                </tr>
              ))}
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
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--ink2)', maxWidth: '220px' }}>
                    {claims[winner.id] ? (
                      <div style={{ lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{claims[winner.id].fullName}</div>
                        <div>{claims[winner.id].addressLine1}</div>
                        {claims[winner.id].addressLine2 && <div>{claims[winner.id].addressLine2}</div>}
                        <div>{claims[winner.id].city}, {claims[winner.id].postcode}</div>
                        {claims[winner.id].phone && <div style={{ color: 'var(--ink3)' }}>{claims[winner.id].phone}</div>}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ink3)' }}>Awaiting claim</span>
                    )}
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
            <p style={{ color: 'var(--ink3)' }}>No winners yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
