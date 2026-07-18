import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Sending domain must be verified in Resend for this to deliver.
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Ivory Vault <support@ivoryvaultcompetitions.co.uk>'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@ivoryvaultcompetitions.co.uk'
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ivoryvault.vercel.app'

const INK = '#1b2432'
const BLUE = '#2563eb'

/** Low-level send. Never throws — logs and returns so it can't break a request flow. */
async function send(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', opts.subject)
    return { skipped: true }
  }
  try {
    const res = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    })
    if (res.error) console.error('[email] send error:', res.error)
    return res
  } catch (err) {
    console.error('[email] send threw:', err)
    return { error: err }
  }
}

/** Shared branded shell. */
function shell(heading: string, bodyHtml: string, cta?: { label: string; href: string }) {
  return `
  <div style="margin:0;padding:0;background:#f2f4f7;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
      <div style="text-align:center;padding-bottom:24px;">
        <div style="font-size:20px;font-weight:800;letter-spacing:.22em;color:${INK};">IVORY VAULT</div>
        <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${BLUE};margin-top:4px;">Luxury Prize Competitions</div>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e7ee;border-radius:16px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${INK};">${heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#3a4553;">${bodyHtml}</div>
        ${cta ? `<div style="text-align:center;margin-top:28px;">
          <a href="${cta.href}" style="display:inline-block;background:${BLUE};color:#fff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:14px 28px;border-radius:10px;">${cta.label}</a>
        </div>` : ''}
      </div>
      <div style="text-align:center;padding:24px 12px;font-size:12px;color:#6b7684;line-height:1.6;">
        Ivory Vault · 18+ only · UK residents · Play responsibly<br/>
        Questions? Reply to this email or contact ${SUPPORT_EMAIL}
      </div>
    </div>
  </div>`
}

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v.toLocaleString() : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Welcome email on signup. */
export function sendWelcomeEmail(to: string, name: string) {
  const body = `
    <p style="margin:0 0 12px;">Welcome to Ivory Vault, ${esc(name.split(' ')[0] || name)} — your account is ready.</p>
    <p style="margin:0 0 12px;">Browse our live competitions for a chance to win luxury watches, cash, tech and once-in-a-lifetime experiences. Every entry earns rewards, and climbing the ranks unlocks free spins and site credit.</p>
    <p style="margin:0;">Good luck!</p>`
  return send({ to, subject: 'Welcome to Ivory Vault', html: shell('You\'re in 🎉', body, { label: 'View Competitions', href: `${SITE_URL}/competitions` }) })
}

/** Order confirmation after a successful checkout. */
export function sendPurchaseConfirmation(to: string, name: string, items: { title: string; qty: number }[], total: number) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f5;font-size:14px;color:${INK};">${esc(i.title)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f5;font-size:14px;color:#6b7684;text-align:right;">× ${i.qty}</td>
    </tr>`).join('')
  const body = `
    <p style="margin:0 0 16px;">Thanks ${esc(name.split(' ')[0] || name)} — your entries are confirmed and in the draw. Good luck!</p>
    <table style="width:100%;border-collapse:collapse;">
      ${rows}
      <tr><td style="padding:14px 0 0;font-size:15px;font-weight:800;color:${INK};">Total paid</td>
      <td style="padding:14px 0 0;font-size:15px;font-weight:800;color:${BLUE};text-align:right;">${money(total)}</td></tr>
    </table>`
  return send({ to, subject: 'Your Ivory Vault entries are confirmed', html: shell('Order confirmed', body, { label: 'View My Account', href: `${SITE_URL}/account` }) })
}

/** Instant-win notification. */
export function sendInstantWinEmail(to: string, name: string, amount: number, kind: 'credit' | 'cash') {
  const body = kind === 'cash'
    ? `<p style="margin:0 0 12px;">Congratulations ${esc(name.split(' ')[0] || name)} — you won a <strong>${money(amount)} cash prize</strong> on the Instant Cash Spin!</p>
       <p style="margin:0;">Our team will be in touch shortly to arrange your payment.</p>`
    : `<p style="margin:0 0 12px;">Congratulations ${esc(name.split(' ')[0] || name)} — you won <strong>${money(amount)}</strong> on the Instant Cash Spin!</p>
       <p style="margin:0;">It's been added to your site credit and is ready to use straight away.</p>`
  return send({ to, subject: `You won ${money(amount)}${kind === 'cash' ? ' cash' : ''}! 🎉`, html: shell('Instant win!', body, { label: 'Go to My Account', href: `${SITE_URL}/account` }) })
}

/** Password reset link. */
export function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const body = `
    <p style="margin:0 0 12px;">Hi ${esc(name.split(' ')[0] || name)}, we received a request to reset your Ivory Vault password.</p>
    <p style="margin:0 0 12px;">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
    <p style="margin:0;color:#6b7684;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`
  return send({ to, subject: 'Reset your Ivory Vault password', html: shell('Password reset', body, { label: 'Reset Password', href: resetUrl }) })
}

/** Contact-form receipt — goes to support, replies route back to the sender. */
export function sendContactReceipt(data: { name: string; email: string; subject?: string | null; message: string }) {
  const body = `
    <p style="margin:0 0 8px;"><strong>From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;</p>
    <p style="margin:0 0 8px;"><strong>Subject:</strong> ${esc(data.subject || '—')}</p>
    <p style="margin:16px 0 0;white-space:pre-wrap;">${esc(data.message)}</p>`
  return send({ to: SUPPORT_EMAIL, replyTo: data.email, subject: `Contact form: ${data.subject || 'New message'}`, html: shell('New contact message', body) })
}
