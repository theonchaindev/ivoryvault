import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  try {
    const [users, competitions, tickets, winners] = await Promise.all([
      prisma.user.count(),
      prisma.competition.count({ where: { status: 'active' } }),
      prisma.ticket.findMany({ include: { competition: { select: { ticketPrice: true } } } }),
      prisma.winner.count(),
    ])

    const revenue = tickets.reduce((sum, t) => sum + t.competition.ticketPrice * t.quantity, 0)

    const recentOrders = await prisma.ticket.findMany({
      orderBy: { purchasedAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        competition: { select: { title: true, ticketPrice: true } },
      },
    })

    return { users, competitions, tickets: tickets.length, revenue, winners, recentOrders }
  } catch {
    return { users: 0, competitions: 0, tickets: 0, revenue: 0, winners: 0, recentOrders: [] }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Users', value: stats.users.toLocaleString(), color: '#b76e79' },
    { label: 'Active Competitions', value: stats.competitions.toLocaleString(), color: '#b76e79' },
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), color: '#b76e79' },
    { label: 'Total Winners', value: stats.winners.toLocaleString(), color: '#b76e79' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          Dashboard
        </h1>
        <p style={{ color: '#9a8878', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Overview of Ivory Vault activity
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {statCards.map(card => (
          <div
            key={card.label}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e8d8cc',
              padding: '1.75rem',
            }}
          >
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: card.color, lineHeight: 1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9a8878', marginTop: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { href: '/admin/competitions/new', label: 'New Competition' },
          { href: '/admin/competitions', label: 'Manage Competitions' },
          { href: '/admin/winners', label: 'Draw Winners' },
          { href: '/admin/orders', label: 'View Orders' },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.75rem 1rem', textAlign: 'center' }}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#1c1a18' }}>
            Recent Orders
          </h2>
          <Link href="/admin/orders" style={{ fontSize: '0.75rem', color: '#b76e79', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {stats.recentOrders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Competition', 'Tickets', 'Value', 'Date'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#9a8878',
                      borderBottom: '1px solid #e8d8cc',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: '#1c1a18', borderBottom: '1px solid #f0e3d3' }}>
                    <div>{order.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9a8878' }}>{order.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: '#5c524a', borderBottom: '1px solid #f0e3d3' }}>
                    {order.competition.title}
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: '#1c1a18', borderBottom: '1px solid #f0e3d3' }}>
                    {order.quantity}
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: '#b76e79', borderBottom: '1px solid #f0e3d3' }}>
                    {formatCurrency(order.competition.ticketPrice * order.quantity)}
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.8rem', color: '#9a8878', borderBottom: '1px solid #f0e3d3' }}>
                    {formatDate(order.purchasedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#9a8878', fontSize: '0.875rem' }}>No orders yet.</p>
        )}
      </div>
    </div>
  )
}
