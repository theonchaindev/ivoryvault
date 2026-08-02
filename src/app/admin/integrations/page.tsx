import { getSetting } from '@/lib/settings'
import MetaPixelForm from './MetaPixelForm'

export const dynamic = 'force-dynamic'

const GA_ID = 'G-VY0D6ECGYP'
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ivoryvault.vercel.app'

type Status = 'live' | 'test' | 'off'

function mask(v: string | undefined, keep = 8): string {
  if (!v) return '— not set —'
  return v.slice(0, keep) + '••••••••'
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    live: { label: 'Live', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
    test: { label: 'Test mode', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
    off: { label: 'Not configured', bg: 'var(--bg2)', color: 'var(--ink3)', border: 'var(--border)' },
  }[status]
  return (
    <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: map.color, background: map.bg, border: `1px solid ${map.border}`, borderRadius: '999px', padding: '3px 10px' }}>
      {map.label}
    </span>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '.8rem' }}>
      <span style={{ color: 'var(--ink3)' }}>{k}</span>
      <span style={{ color: 'var(--ink)', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
    </div>
  )
}

export default async function AdminIntegrationsPage() {
  const metaPixelId = (await getSetting('metaPixelId')) || ''
  const sk = process.env.STRIPE_SECRET_KEY || ''
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const stripeStatus: Status = sk.startsWith('sk_live_') ? 'live' : sk.startsWith('sk_test_') ? 'test' : 'off'
  const resendStatus: Status = process.env.RESEND_API_KEY ? 'live' : 'off'
  const cloudinaryStatus: Status = process.env.CLOUDINARY_CLOUD_NAME ? 'live' : 'off'
  const dbStatus: Status = (process.env.DATABASE_URL || '').startsWith('postgres') ? 'live' : 'off'
  const dbHost = (() => { try { return new URL(process.env.DATABASE_URL || '').host } catch { return 'configured' } })()

  const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }
  const cat: React.CSSProperties = { fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', fontWeight: 700 }
  const title: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }
  const desc: React.CSSProperties = { fontSize: '.82rem', color: 'var(--ink3)', margin: '.35rem 0 1rem', lineHeight: 1.5 }
  const codeBox: React.CSSProperties = { background: '#0e1526', color: '#cbd5e1', borderRadius: '8px', padding: '1rem', fontSize: '.72rem', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre', marginTop: '.5rem' }

  const gaScript = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Integrations</h1>
        <p style={{ color: 'var(--ink3)', fontSize: '.875rem', marginTop: '.25rem' }}>Third-party services and scripts wired into the site. Secret keys are masked.</p>
      </div>

      {/* Stripe */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Payments</p><p style={title}>Stripe</p></div>
          <StatusBadge status={stripeStatus} />
        </div>
        <p style={desc}>Card checkout and the payment webhook that records purchases, creates entries/spins and sends confirmation emails.</p>
        <Row k="Mode" v={stripeStatus === 'live' ? 'Live (real charges)' : stripeStatus === 'test' ? 'Test mode' : 'Not configured'} />
        <Row k="Publishable key" v={mask(pk, 12)} mono />
        <Row k="Secret key" v={sk ? `${sk.slice(0, 8)}••••••••` : '— not set —'} mono />
        <Row k="Webhook secret" v={process.env.STRIPE_WEBHOOK_SECRET ? 'Set ✓' : '— not set —'} />
        <Row k="Webhook endpoint" v={`${SITE_URL}/api/payments/webhook`} mono />
        <Row k="Events" v="checkout.session.completed, payment_intent.succeeded" />
      </div>

      {/* Resend */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Email</p><p style={title}>Resend</p></div>
          <StatusBadge status={resendStatus} />
        </div>
        <p style={desc}>Transactional email: welcome, order confirmation, instant-win, password reset, contact receipt, and new-signup alerts.</p>
        <Row k="API key" v={mask(process.env.RESEND_API_KEY, 6)} mono />
        <Row k="From address" v={process.env.EMAIL_FROM || 'Ivory Vault <support@ivoryvaultcompetitions.co.uk>'} />
        <Row k="Sending domain" v="ivoryvaultcompetitions.co.uk (verified)" />
      </div>

      {/* Cloudinary */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Media</p><p style={title}>Cloudinary</p></div>
          <StatusBadge status={cloudinaryStatus} />
        </div>
        <p style={desc}>Hosting and delivery of competition images uploaded from the admin panel.</p>
        <Row k="Cloud name" v={process.env.CLOUDINARY_CLOUD_NAME || '— not set —'} mono />
        <Row k="API key" v={process.env.CLOUDINARY_API_KEY ? 'Set ✓' : '— not set —'} />
        <Row k="API secret" v={process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : '— not set —'} />
      </div>

      {/* Google Analytics */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Analytics</p><p style={title}>Google Analytics (GA4)</p></div>
          <StatusBadge status="live" />
        </div>
        <p style={desc}>Site analytics via gtag.js. Loads only after the visitor accepts analytics cookies (cookie consent banner).</p>
        <Row k="Measurement ID" v={GA_ID} mono />
        <Row k="Consent-gated" v="Yes — via cookie banner" />
        <div style={codeBox}>{gaScript}</div>
      </div>

      {/* Meta Pixel */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Advertising</p><p style={title}>Meta Pixel</p></div>
          <StatusBadge status={metaPixelId ? 'live' : 'off'} />
        </div>
        <p style={desc}>Facebook/Instagram ads conversion tracking. Paste your Pixel ID (or the full Meta base code) below and save — it loads site-wide, gated behind cookie consent.</p>
        <MetaPixelForm initial={metaPixelId} />
      </div>

      {/* Database */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Database</p><p style={title}>Neon (PostgreSQL)</p></div>
          <StatusBadge status={dbStatus} />
        </div>
        <p style={desc}>Primary database (via Prisma) — users, competitions, entries, spins, orders.</p>
        <Row k="Host" v={dbHost} mono />
        <Row k="Connection" v={dbStatus === 'live' ? 'Connected ✓' : '— not set —'} />
      </div>

      {/* Hosting */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div><p style={cat}>Hosting</p><p style={title}>Vercel</p></div>
          <StatusBadge status="live" />
        </div>
        <p style={desc}>Application hosting and deployment. Environment variables (keys/secrets above) are managed in the Vercel project settings.</p>
        <Row k="Live URL" v={SITE_URL} mono />
      </div>
    </div>
  )
}
