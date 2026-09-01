import InstantGameAdmin from './InstantGameAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminInstantGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Manage game</h1>
      </div>
      <InstantGameAdmin gameId={id} />
    </div>
  )
}
