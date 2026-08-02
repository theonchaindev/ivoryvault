import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderRow {
  id: string; name: string; email: string; title: string
  quantity: number; value: number; ref: string; date: Date; kind: 'ticket' | 'spin'
}

async function getOrders(): Promise<OrderRow[]> {
  try {
    const [tickets, spins] = await Promise.all([
      prisma.ticket.findMany({
        orderBy: { purchasedAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, competition: { select: { title: true, ticketPrice: true } } },
      }),
      prisma.instantSpin.findMany({
        select: {
          userId: true, competitionId: true, createdAt: true,
          user: { select: { name: true, email: true } },
          competition: { select: { title: true, ticketPrice: true } },
        },
      }),
    ])

    const ticketRows: OrderRow[] = tickets.map(t => ({
      id: t.id, name: t.user.name, email: t.user.email, title: t.competition.title,
      quantity: t.quantity, value: t.competition.ticketPrice * t.quantity,
      ref: t.stripePaymentId ? t.stripePaymentId.substring(0, 20) + '…' : '—',
      date: t.purchasedAt, kind: 'ticket',
    }))

    // Instant spins have no per-order grouping, so aggregate per user + competition
    const spinMap = new Map<string, OrderRow>()
    spins.forEach(s => {
      const key = `${s.userId}:${s.competitionId}`
      const cur = spinMap.get(key)
      if (cur) {
        cur.quantity += 1
        cur.value += s.competition.ticketPrice
        if (s.createdAt < cur.date) cur.date = s.createdAt
      } else {
        spinMap.set(key, {
          id: `spin-${key}`, name: s.user.name, email: s.user.email, title: s.competition.title,
          quantity: 1, value: s.competition.ticketPrice, ref: 'Instant spins', date: s.createdAt, kind: 'spin',
        })
      }
    })

    return [...ticketRows, ...Array.from(spinMap.values())].sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch {
    return []
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  const totalRevenue = orders.reduce((sum, o) => sum + o.value, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
            Orders
          </h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {orders.length} orders · {formatCurrency(totalRevenue)} total revenue (incl. instant spins)
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
        {orders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Competition', 'Entries', 'Value', 'Reference', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{order.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{order.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink2)' }}>
                    {order.title}
                    {order.kind === 'spin' && <span style={{ marginLeft: '.5rem', fontSize: '.6rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '999px', padding: '1px 6px' }}>Spins</span>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
                    {order.quantity}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--gold)', fontWeight: 500 }}>
                    {formatCurrency(order.value)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--ink3)', fontFamily: 'monospace' }}>
                    {order.ref}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                    {formatDate(order.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink3)' }}>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
