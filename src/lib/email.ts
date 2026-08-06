import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Sending domain must be verified in Resend for this to deliver.
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Ivory Vault <support@ivoryvaultcompetitions.co.uk>'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@ivoryvaultcompetitions.co.uk'
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ivoryvaultcompetitions.co.uk'

// Dark brand palette (shared by every email)
const BG = '#0a0e1a'
const CARD = '#0e1526'
const CARD_BORDER = 'rgba(255,255,255,.09)'
const HEADING = '#ffffff'
const BODY = 'rgba(255,255,255,.72)'
const FOOT = 'rgba(255,255,255,.4)'
const BLUE = '#2563eb'
const BLUE_LT = '#4a86e8'
const GOLD = '#c2a24e'

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

function badgeCell(icon: string, label: string, first = false) {
  return `<td align="center" valign="middle" style="padding:4px 12px;${first ? '' : 'border-left:1px solid rgba(255,255,255,.12);'}font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.05em;color:rgba(255,255,255,.6);white-space:nowrap;"><span style="color:${BLUE_LT};font-size:12px;">${icon}</span>&nbsp; ${label}</td>`
}

/**
 * Shared dark, branded shell — used by every automated email.
 * `heading` may contain inline HTML (e.g. a coloured accent span).
 */
function shell(heading: string, bodyHtml: string, cta?: { label: string; href: string }, opts?: { badges?: boolean }) {
  const badges = opts?.badges !== false
  return `
  <div style="margin:0;padding:0;background:${BG};">
    <div style="max-width:600px;margin:0 auto;padding:36px 20px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <!-- Header -->
      <div style="text-align:center;padding-bottom:28px;">
        <img src="${SITE_URL}/logo.png" alt="Ivory Vault" width="72" height="72" style="display:inline-block;border:0;outline:none;text-decoration:none;margin-bottom:8px;" />
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:.24em;color:${HEADING};">IVORY VAULT</div>
        <div style="font-size:11px;letter-spacing:.34em;color:${GOLD};margin-top:8px;">— COMPETITIONS —</div>
      </div>

      <!-- Card -->
      <div style="background:${CARD};border:1px solid ${CARD_BORDER};border-radius:18px;padding:38px 36px;">
        <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:${HEADING};letter-spacing:-.01em;">${heading}</h1>
        <div style="font-size:16px;line-height:1.65;color:${BODY};">${bodyHtml}</div>
        ${cta ? `<div style="text-align:center;margin-top:32px;">
          <a href="${cta.href}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:16px 40px;border-radius:12px;">${cta.label}</a>
        </div>` : ''}
      </div>

      ${badges ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;"><tr>
        ${badgeCell('✓', 'UK REGULATED', true)}
        ${badgeCell('🎟', 'FREE ENTRY')}
        ${badgeCell('▶', 'LIVE DRAWS')}
        ${badgeCell('18+', 'ONLY')}
      </tr></table>` : ''}

      <!-- Footer -->
      <div style="text-align:center;padding:24px 12px 0;font-size:12px;color:${FOOT};line-height:1.7;">
        Ivory Vault Competitions Ltd &nbsp;·&nbsp; 18+ only &nbsp;·&nbsp; UK residents only &nbsp;·&nbsp; Play responsibly<br/>
        Questions? Reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BLUE_LT};text-decoration:none;">${SUPPORT_EMAIL}</a>
      </div>
    </div>
  </div>`
}

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v.toLocaleString() : v.toFixed(2)}` : `${Math.round(v * 100)}p`)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export interface FeaturedComp { title: string; image: string | null; price: number; slug: string; prizeValue?: number }

/** Marketing broadcast — "new competition now active", featuring the latest comp graphic. */
function newCompetitionHtml(comp: FeaturedComp | null): string {
  const badges = `<div style="margin-top:22px;font-size:15px;color:rgba(255,255,255,.62);line-height:1.4;">
      <span style="color:${BLUE_LT};">✓</span> UK Regulated &nbsp;<span style="color:rgba(255,255,255,.25);">|</span>&nbsp; <span style="color:${BLUE_LT};">✓</span> Free Entry &nbsp;<span style="color:rgba(255,255,255,.25);">|</span>&nbsp; <span style="color:${BLUE_LT};">✓</span> Live Draws &nbsp;<span style="color:rgba(255,255,255,.25);">|</span>&nbsp; <span style="color:${BLUE_LT};">✓</span> 18+
    </div>`

  // Left column: logo + heading + text + button + badges (all left-aligned)
  const leftCol = `
    <img src="${SITE_URL}/logo.png" alt="Ivory Vault" width="80" height="80" style="display:block;border:0;outline:none;margin-bottom:10px;" />
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:.2em;color:${HEADING};">IVORY VAULT</div>
    <div style="font-size:13px;letter-spacing:.3em;color:${GOLD};margin-top:8px;">— COMPETITIONS —</div>
    <h1 style="margin:34px 0 0;font-size:52px;line-height:1.02;font-weight:800;color:${HEADING};letter-spacing:-.01em;">NEW COMPETITION <span style="color:${BLUE};">NOW ACTIVE!</span></h1>
    <p style="margin:22px 0 0;font-size:20px;line-height:1.55;color:rgba(255,255,255,.7);">A brand new competition is now live with amazing prizes up for grabs.</p>
    <a href="${SITE_URL}/competitions" style="display:block;text-align:center;background:${BLUE};color:#ffffff;text-decoration:none;font-size:17px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:20px;border-radius:14px;margin-top:30px;">Visit Our Website</a>
    ${badges}`

  // Right column: the competition's promo graphic, linked
  const rightCol = comp && comp.image ? `
    <a href="${SITE_URL}/competitions/${comp.slug}" style="text-decoration:none;">
      <img src="${comp.image}" alt="${esc(comp.title)}" width="440" style="display:block;width:100%;height:auto;border:0;border-radius:18px;" />
    </a>` : ''

  const body = comp && comp.image ? `
    <div style="text-align:center;font-size:0;padding:48px 24px 28px;">
      <!--[if mso]><table role="presentation" width="900" align="center" cellpadding="0" cellspacing="0"><tr><td width="450" valign="middle" style="padding:0 14px;"><![endif]-->
      <div style="display:inline-block;vertical-align:middle;width:100%;max-width:440px;font-size:16px;text-align:left;padding:0 14px 28px;box-sizing:border-box;">${leftCol}</div>
      <!--[if mso]></td><td width="450" valign="middle" style="padding:0 14px;"><![endif]-->
      <div style="display:inline-block;vertical-align:middle;width:100%;max-width:440px;font-size:16px;text-align:left;padding:0 14px 28px;box-sizing:border-box;">${rightCol}</div>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>` : `<div style="padding:48px 24px 28px;max-width:520px;margin:0 auto;">${leftCol}</div>`

  return `
  <div style="margin:0;padding:0;background:${BG};">
    <div style="max-width:960px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      ${body}

      <!-- Light footer -->
      <div style="background:#f2f4f7;text-align:center;padding:44px 24px;">
        <div style="font-size:34px;">🌐</div>
        <p style="margin:14px 0 0;font-size:19px;line-height:1.6;color:#3a4553;">Visit <a href="${SITE_URL}/competitions" style="color:${BLUE};text-decoration:none;font-weight:700;">${SITE_URL.replace(/^https?:\/\//, '')}</a><br/>to enter now!</p>
      </div>

      <!-- Compliance footer -->
      <div style="background:${BG};text-align:center;padding:24px 24px 36px;font-size:13px;color:${FOOT};line-height:1.7;">
        You're receiving this because you have an Ivory Vault account. 18+ only · UK residents · Play responsibly.<br/>
        <a href="mailto:${SUPPORT_EMAIL}?subject=Unsubscribe" style="color:${FOOT};text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>
  </div>`
}

const NEW_COMP_SUBJECT = '🎉 New competition now active — Ivory Vault'

export function sendNewCompetitionEmail(to: string, comp: FeaturedComp | null) {
  return send({ to, subject: NEW_COMP_SUBJECT, html: newCompetitionHtml(comp) })
}

/** Mass-send the new-competition email in batches of 100. */
export async function broadcastNewCompetition(emails: string[], comp: FeaturedComp | null): Promise<{ sent: number; failed: number }> {
  if (!resend || emails.length === 0) return { sent: 0, failed: 0 }
  const html = newCompetitionHtml(comp)
  let sent = 0, failed = 0
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100)
    try {
      const res = await resend.batch.send(chunk.map(to => ({ from: EMAIL_FROM, to, subject: NEW_COMP_SUBJECT, html })))
      if (res.error) { failed += chunk.length; console.error('[email] batch error:', res.error) }
      else sent += chunk.length
    } catch (e) { failed += chunk.length; console.error('[email] batch threw:', e) }
  }
  return { sent, failed }
}

/** Welcome email on signup. */
export function sendWelcomeEmail(to: string, name: string) {
  const body = `
    <p style="margin:0 0 18px;">Welcome to Ivory Vault, ${esc(name.split(' ')[0] || name)} — your account is ready.</p>
    <p style="margin:0 0 18px;">Browse our live competitions for a chance to win luxury watches, cash, tech and once-in-a-lifetime experiences. Every entry earns rewards, and climbing the ranks unlocks free spins and site credit.</p>
    <p style="margin:0;">Good luck!</p>`
  return send({ to, subject: 'Welcome to Ivory Vault', html: shell(`YOU'RE <span style="color:#2f6bf0;">IN!</span> 🎉`, body, { label: 'View Competitions', href: `${SITE_URL}/competitions` }) })
}

/** Internal alert to the team when a new member signs up. */
export function sendNewSignupAlert(name: string, email: string, phone?: string) {
  const body = `
    <p style="margin:0 0 12px;">A new member just created an account:</p>
    <p style="margin:0 0 6px;"><strong style="color:#fff;">Name:</strong> ${esc(name)}</p>
    <p style="margin:0 0 6px;"><strong style="color:#fff;">Email:</strong> ${esc(email)}</p>
    ${phone ? `<p style="margin:0 0 6px;"><strong style="color:#fff;">Mobile:</strong> ${esc(phone)}</p>` : ''}
    <p style="margin:0;color:${FOOT};font-size:13px;">${new Date().toUTCString()}</p>`
  return send({ to: SUPPORT_EMAIL, subject: `New signup — ${name}`, html: shell('New member 🎉', body, undefined, { badges: false }) })
}

/** Order confirmation after a successful checkout. */
export function sendPurchaseConfirmation(to: string, name: string, items: { title: string; qty: number }[], total: number) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:15px;color:${HEADING};">${esc(i.title)}</td>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:15px;color:${BODY};text-align:right;">× ${i.qty}</td>
    </tr>`).join('')
  const body = `
    <p style="margin:0 0 20px;">Thanks ${esc(name.split(' ')[0] || name)} — your entries are confirmed and in the draw. Good luck!</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
      <tr><td style="padding:16px 0 0;font-size:16px;font-weight:800;color:${HEADING};">Total paid</td>
      <td style="padding:16px 0 0;font-size:16px;font-weight:800;color:${BLUE_LT};text-align:right;">${money(total)}</td></tr>
    </table>`
  return send({ to, subject: 'Your Ivory Vault entries are confirmed', html: shell('Order confirmed', body, { label: 'View My Account', href: `${SITE_URL}/account` }) })
}

/** Instant-win notification. */
export function sendInstantWinEmail(to: string, name: string, amount: number, kind: 'credit' | 'cash') {
  const body = kind === 'cash'
    ? `<p style="margin:0 0 16px;">Congratulations ${esc(name.split(' ')[0] || name)} — you won a <strong style="color:#fff;">${money(amount)} cash prize</strong> on the Instant Cash Spin!</p>
       <p style="margin:0;">Our team will be in touch shortly to arrange your payment.</p>`
    : `<p style="margin:0 0 16px;">Congratulations ${esc(name.split(' ')[0] || name)} — you won <strong style="color:#fff;">${money(amount)}</strong> on the Instant Cash Spin!</p>
       <p style="margin:0;">It's been added to your site credit and is ready to use straight away.</p>`
  return send({ to, subject: `You won ${money(amount)}${kind === 'cash' ? ' cash' : ''}! 🎉`, html: shell(`Instant <span style="color:#2f6bf0;">win!</span> 🎉`, body, { label: 'Go to My Account', href: `${SITE_URL}/account` }) })
}

/** After a guest checkout — invite them to create/claim their account. */
export function sendGuestCreateAccount(to: string, name: string) {
  const body = `
    <p style="margin:0 0 16px;">Thanks ${esc(name.split(' ')[0] || name)} — your order is confirmed and your entries are in the draw. 🎉</p>
    <p style="margin:0 0 16px;">Create your free account to track your entries, reveal instant spins, and collect rewards & site credit. Use this same email address and <strong style="color:#fff;">your recent order will be there automatically</strong>.</p>`
  return send({ to, subject: 'Create your Ivory Vault account', html: shell('Create your account', body, { label: 'Create My Account', href: `${SITE_URL}/signup?email=${encodeURIComponent(to)}` }) })
}

/** Password reset link. */
export function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const body = `
    <p style="margin:0 0 16px;">Hi ${esc(name.split(' ')[0] || name)}, we received a request to reset your Ivory Vault password.</p>
    <p style="margin:0 0 16px;">Click the button below to choose a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
    <p style="margin:0;color:${FOOT};font-size:14px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`
  return send({ to, subject: 'Reset your Ivory Vault password', html: shell('Password reset', body, { label: 'Reset Password', href: resetUrl }) })
}

/** Contact-form receipt — goes to support, replies route back to the sender. No trust badges (internal). */
export function sendContactReceipt(data: { name: string; email: string; subject?: string | null; message: string }) {
  const body = `
    <p style="margin:0 0 8px;"><strong style="color:#fff;">From:</strong> ${esc(data.name)} &lt;${esc(data.email)}&gt;</p>
    <p style="margin:0 0 8px;"><strong style="color:#fff;">Subject:</strong> ${esc(data.subject || '—')}</p>
    <p style="margin:16px 0 0;white-space:pre-wrap;">${esc(data.message)}</p>`
  return send({ to: SUPPORT_EMAIL, replyTo: data.email, subject: `Contact form: ${data.subject || 'New message'}`, html: shell('New contact message', body, undefined, { badges: false }) })
}
