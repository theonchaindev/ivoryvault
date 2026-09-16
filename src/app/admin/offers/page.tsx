import OffersManager from './OffersManager'

export const dynamic = 'force-dynamic'

export default function AdminOffersPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Offers</h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '680px' }}>
          Run promotions on a specific competition or site-wide. <strong>Bundle</strong> deals (buy X, get Y free) grant
          the free entries on the same competition. <strong>% off</strong> offers show as a homepage popup you can switch
          on and off any time.
        </p>
      </div>
      <OffersManager />
    </div>
  )
}
