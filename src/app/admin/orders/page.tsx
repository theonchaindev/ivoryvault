import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

async function getOrders() {
  try {
    return await prisma.ticket.findMany({
      orderBy: { purchasedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        competition: { select: { id: true, title: true, ticketPrice: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  const totalRevenue = orders.reduce((sum, o) => sum + o.competition.ticketPrice * o.quantity, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
            Orders
          </h1>
          <p style={{ color: '#9a8878', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {orders.length} orders · {formatCurrency(totalRevenue)} total revenue
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc' }}>
        {orders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Competition', 'Tickets', 'Value', 'Payment ID', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878', borderBottom: '1px solid #e8d8cc' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1c1a18' }}>{order.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9a8878' }}>{order.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#5c524a' }}>
                    {order.competition.title}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#1c1a18', fontWeight: 500 }}>
                    {order.quantity}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.875rem', color: '#b76e79', fontWeight: 500 }}>
                    {formatCurrency(order.competition.ticketPrice * order.quantity)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.75rem', color: '#9a8878', fontFamily: 'monospace' }}>
                    {order.stripePaymentId ? order.stripePaymentId.substring(0, 20) + '...' : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0e3d3', fontSize: '0.8rem', color: '#9a8878' }}>
                    {formatDate(order.purchasedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#9a8878' }}>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
