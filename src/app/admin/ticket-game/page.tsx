import TicketGameAdmin from './TicketGameAdmin'

export const dynamic = 'force-dynamic'

export default function AdminTicketGamePage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
          Ticket Game
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
          Set up the instant-win ticket game — prize tiers, quantities, ticket price and pool size.
          It stays hidden from the site until you switch it on. Site-credit wins are added to the member&rsquo;s
          balance automatically; custom prize wins appear below for fulfilment.
        </p>
      </div>
      <TicketGameAdmin />
    </div>
  )
}
