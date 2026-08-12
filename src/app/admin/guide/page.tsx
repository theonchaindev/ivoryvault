'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Section { id: string; icon: string; title: string; body: React.ReactNode }

const SECTIONS: Section[] = [
  {
    id: 'start', icon: '🚀', title: 'Getting started',
    body: (
      <>
        <p>Welcome to the Ivory Vault admin portal. This is where you run everything — competitions, members, orders and more.</p>
        <ul>
          <li><b>Navigation:</b> use the left sidebar to move between sections. <b>← Back to Site</b> (bottom) returns you to the public website.</li>
          <li><b>Everything is live:</b> changes you make here (creating a comp, adding credit, etc.) appear on the site <b>immediately</b> — no publishing step or wait.</li>
          <li><b>Your password:</b> change it any time via <b>Members → your admin account → Reset Password</b>.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'dashboard', icon: '▦', title: 'Dashboard',
    body: (
      <>
        <p>Your at-a-glance overview.</p>
        <ul>
          <li><b>Total Revenue</b> = all ticket sales <i>and</i> instant-win spins combined.</li>
          <li><b>Total Users</b>, <b>Active Competitions</b> and <b>Total Winners</b> tiles.</li>
          <li><b>Recent Orders</b> shows the latest purchases. Quick-action buttons jump you to common tasks.</li>
        </ul>
        <p className="ag-tip">💡 For penny-accurate accounting (with refunds), always use your Stripe dashboard as the source of truth — the figure here is a live estimate of sales.</p>
      </>
    ),
  },
  {
    id: 'comps', icon: '◈', title: 'Competitions',
    body: (
      <>
        <p>Create and manage all your competitions.</p>
        <p><b>To create one:</b></p>
        <ol>
          <li>Click <b>New Competition</b>.</li>
          <li>Fill in <b>Details</b> (title, subtitle, description), <b>Pricing &amp; Tickets</b> (prize value, ticket price, total tickets).</li>
          <li>Add <b>Images</b> — upload from your device, pick from the media library, or paste a URL. The <b>first image is the hero</b>; reorder with the arrows.</li>
          <li>Pick the <b>Type</b>: <b>Standard</b> (a raffle draw) or <b>Instant Win</b> (spin &amp; win — set the prize amounts + how many of each in the JSON box).</li>
          <li>Set the <b>Draw Date</b>, <b>Status</b>, <b>Sort Order</b> and whether it&rsquo;s <b>Featured</b> on the homepage.</li>
          <li>The <b>live preview</b> on the right shows the listing card as you type. Click <b>Create Competition</b>.</li>
        </ol>
        <p><b>Status controls visibility:</b></p>
        <ul>
          <li><b>Draft</b> — hidden from the public site (use this to build/stage a comp before it goes live).</li>
          <li><b>Active</b> — live and visible to everyone.</li>
          <li><b>Completed</b> — finished.</li>
        </ul>
        <p><b>Sort Order</b> controls the order comps appear (lower = earlier). <b>Featured</b> also shows it on the homepage.</p>
        <p>Click any competition to <b>edit</b> it, or delete it (deleting also removes its entries).</p>
        <p className="ag-tip">💡 To stage a comp before launch: create it as <b>Draft</b>, check it, then edit and switch it to <b>Active</b> when ready.</p>
      </>
    ),
  },
  {
    id: 'members', icon: '◕', title: 'Members',
    body: (
      <>
        <p>Every registered user, searchable by name or email.</p>
        <ul>
          <li>A yellow <b>Guest</b> tag means an un-claimed guest-checkout account (they bought without registering; the tag clears once they create their account).</li>
          <li>Click a member to open their full profile: <b>site credit, entries, spins, tier, orders and notifications</b>.</li>
        </ul>
        <p><b>On a member&rsquo;s page you can:</b></p>
        <ul>
          <li><b>Add or deduct site credit</b> (with an optional note that the member sees).</li>
          <li><b>Manage entries</b> — remove an entry (this also lowers the competition&rsquo;s ticket count) or manually add entries/spins to any competition.</li>
          <li><b>Reset their password</b>.</li>
        </ul>
        <p className="ag-tip">💡 Site credit is spendable by the member at checkout. Real-money <b>refunds</b> are done in Stripe, not here — this panel manages account credit and entries.</p>
      </>
    ),
  },
  {
    id: 'orders', icon: '◉', title: 'Orders',
    body: (
      <>
        <p>A record of every purchase — both ticket entries and instant-win spins.</p>
        <ul>
          <li>Shows the customer, competition, quantity, value and a running total revenue.</li>
          <li>Instant-spin purchases are tagged and aggregated per customer/competition.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'winners', icon: '★', title: 'Winners',
    body: (
      <>
        <p>Draw and publish winners.</p>
        <ul>
          <li>Draw a winner for a competition (selected at random from valid entries).</li>
          <li><b>Announce</b> a winner to publish them (winners are otherwise hidden until announced).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'contacts', icon: '✉', title: 'Contacts',
    body: <p>Messages submitted through the site&rsquo;s contact form. You also receive these by email, but they&rsquo;re stored here as a backup.</p>,
  },
  {
    id: 'integrations', icon: '⚙', title: 'Integrations',
    body: (
      <>
        <p>The status of every third-party service wired into the site — with secret keys masked.</p>
        <ul>
          <li><b>Stripe</b> (payments — shows live vs test mode), <b>Resend</b> (email), <b>Cloudinary</b> (images), <b>Google Analytics</b>, <b>Neon</b> (database), <b>Vercel</b> (hosting).</li>
          <li><b>Meta Pixel:</b> paste your Facebook/Instagram Pixel ID (or the full base code) and <b>Save</b> to enable ad-conversion tracking. It loads site-wide after cookie consent. Clear the box and Save to turn it off.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'emails', icon: '📧', title: 'Emails',
    body: (
      <>
        <p>The site sends these automatically (from support@ivoryvaultcompetitions.co.uk):</p>
        <ul>
          <li><b>Welcome</b> on signup · <b>Order confirmation</b> after checkout · <b>Instant-win</b> notification · <b>Password reset</b> · <b>Guest &ldquo;create your account&rdquo;</b> after a guest order.</li>
          <li>You get a <b>new-signup alert</b> whenever someone registers.</li>
        </ul>
        <p>There&rsquo;s also a <b>&ldquo;New Competition Now Active&rdquo; broadcast</b> that can be sent to all members, featuring any competition. Ask for it to be sent when you launch something new.</p>
      </>
    ),
  },
  {
    id: 'tips', icon: '💡', title: 'Common tasks & tips',
    body: (
      <>
        <ul>
          <li><b>Launch a competition:</b> New Competition → fill in → Status <b>Active</b> → Create.</li>
          <li><b>Stage before going live:</b> create as <b>Draft</b>, then edit → <b>Active</b> when ready.</li>
          <li><b>Give someone credit:</b> Members → the user → <b>Add credit</b>.</li>
          <li><b>Reorder comps:</b> lower <b>Sort Order</b> = appears earlier.</li>
          <li><b>Feature on homepage:</b> tick <b>Featured</b> on the competition.</li>
          <li><b>Refund:</b> do it in Stripe (real money), then optionally adjust the member&rsquo;s entries/credit here.</li>
        </ul>
        <p className="ag-tip">Need something the portal doesn&rsquo;t do yet? Just ask and it can be added.</p>
      </>
    ),
  },
]

export default function AdminGuidePage() {
  const [open, setOpen] = useState<string | null>('start')

  return (
    <div style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Portal Guide</h1>
        <p style={{ color: 'var(--ink3)', fontSize: '.9rem', marginTop: '.25rem' }}>A quick tour of how to run everything. Tap a section to expand it.</p>
      </div>

      <div className="ag-list">
        {SECTIONS.map(s => {
          const isOpen = open === s.id
          return (
            <div key={s.id} className={`ag-item${isOpen ? ' open' : ''}`}>
              <button className="ag-head" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
                <span className="ag-icon">{s.icon}</span>
                <span className="ag-title">{s.title}</span>
                <span className="ag-chev">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <div className="ag-body">{s.body}</div>}
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--ink3)' }}>
        Prefer to jump in? <Link href="/admin/competitions/new" style={{ color: 'var(--gold)' }}>Create a competition →</Link>
      </p>

      <style>{`
        .ag-list { display: flex; flex-direction: column; gap: .625rem; }
        .ag-item { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .ag-item.open { border-color: var(--gold); box-shadow: 0 4px 18px rgba(37,99,235,.08); }
        .ag-head { display: flex; align-items: center; gap: .875rem; width: 100%; padding: 1.1rem 1.25rem; background: none; border: none; cursor: pointer; font-family: inherit; text-align: left; }
        .ag-icon { font-size: 1.15rem; flex-shrink: 0; }
        .ag-title { flex: 1; font-size: 1.0625rem; font-weight: 700; color: var(--ink); }
        .ag-chev { font-size: 1.25rem; color: var(--ink3); font-weight: 400; }
        .ag-body { padding: 0 1.25rem 1.375rem; color: var(--ink2); font-size: .9rem; line-height: 1.65; }
        .ag-body p { margin: 0 0 .75rem; }
        .ag-body ul, .ag-body ol { margin: 0 0 .75rem; padding-left: 1.25rem; }
        .ag-body li { margin-bottom: .4rem; }
        .ag-body b { color: var(--ink); }
        .ag-tip { background: var(--gold-pale); border: 1px solid var(--gold); border-radius: 8px; padding: .7rem .9rem; font-size: .85rem; color: var(--ink2); }
      `}</style>
    </div>
  )
}
