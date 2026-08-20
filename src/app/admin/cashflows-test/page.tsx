import { getSetting } from '@/lib/settings'
import { cashflowsConfigured, CASHFLOWS_BASE } from '@/lib/cashflows'
import CashflowsTestButton from './CashflowsTestButton'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
const chip = (bg: string, color: string): React.CSSProperties => ({ display: 'inline-block', padding: '.2rem .6rem', borderRadius: '6px', fontSize: '.72rem', fontWeight: 700, background: bg, color })

export default async function CashflowsTestPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams
  const configured = cashflowsConfigured()
  const raw = await getSetting('cashflows_last_webhook')
  const last = raw ? JSON.parse(raw) as { time: string; paymentStatus: string; orderNumber: string | null; amount: string | null; paymentJobReference: string } : null

  const statusColor = (s?: string) =>
    s === 'Paid' ? chip('#dcfce7', '#166534')
    : s === 'Failed' ? chip('#fee2e2', '#991b1b')
    : s === 'Cancelled' ? chip('#fef3c7', '#92400e')
    : chip('#e2e8f0', '#475569')

  return (
    <div style={{ maxWidth: '760px' }}>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.25rem' }}>Cashflows — Sandbox Test</h1>
      <p style={{ color: 'var(--ink3)', fontSize: '.875rem', marginBottom: '1.5rem' }}>
        Runs an isolated test payment against the Cashflows integration gateway. Does not touch the live checkout.
      </p>

      {result && (
        <div style={{ ...card, borderColor: result === 'success' ? '#86efac' : result === 'failed' ? '#fca5a5' : '#fcd34d' }}>
          <strong>Returned from hosted page:</strong> <span style={statusColor(result === 'success' ? 'Paid' : result === 'failed' ? 'Failed' : 'Cancelled')}>{result}</span>
          <p style={{ fontSize: '.78rem', color: 'var(--ink3)', marginTop: '.5rem' }}>The webhook below is the authoritative result (re-fetched from Cashflows).</p>
        </div>
      )}

      <div style={card}>
        <p style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '.5rem' }}>Environment</p>
        <p style={{ fontSize: '.85rem', color: 'var(--ink2)' }}>
          {configured ? <span style={chip('#dcfce7', '#166534')}>Configured</span> : <span style={chip('#fee2e2', '#991b1b')}>Missing env vars</span>}
          <span style={{ marginLeft: '.6rem', color: 'var(--ink3)' }}>{CASHFLOWS_BASE}</span>
        </p>
      </div>

      <div style={card}>
        <p style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '.75rem' }}>Run a test</p>
        {configured
          ? <CashflowsTestButton />
          : <p style={{ color: '#991b1b', fontSize: '.85rem' }}>Set CASHFLOWS_CONFIGURATION_ID, CASHFLOWS_API_KEY and CASHFLOWS_ENVIRONMENT to enable.</p>}
      </div>

      <div style={card}>
        <p style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '.75rem' }}>Latest webhook result</p>
        {last ? (
          <div style={{ fontSize: '.85rem', color: 'var(--ink2)', lineHeight: 1.8 }}>
            <div>Status: <span style={statusColor(last.paymentStatus)}>{last.paymentStatus}</span></div>
            <div>Amount: £{last.amount ?? '—'}</div>
            <div>Order: {last.orderNumber ?? '—'}</div>
            <div>Job ref: {last.paymentJobReference}</div>
            <div style={{ color: 'var(--ink3)', fontSize: '.78rem' }}>Received: {new Date(last.time).toLocaleString('en-GB')}</div>
          </div>
        ) : <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No webhook received yet. Run a test, then refresh this page.</p>}
      </div>
    </div>
  )
}
