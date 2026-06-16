'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Tier {
  name: string
  min: number
  max: number
  color: string
  perks: string[]
}

interface TicketEntry {
  id: string
  quantity: number
  purchasedAt: string
  competition: {
    id: string
    title: string
    slug: string
    status: string
    prizeValue: number
    drawDate: string | null
  }
}

interface Props {
  name: string
  email: string
  totalTickets: number
  totalEntries: number
  activeEntries: number
  tier: Tier
  nextTier: Tier | null
  progressPct: number
  tickets: TicketEntry[]
}

type View = 'overview' | 'addresses' | 'account' | 'communication' | 'safeplay'
type Filter = 'all' | 'active' | 'past'

const ease = [0.22, 1, 0.36, 1] as const

/* ── Menu icons ── */
const icons: Record<string, React.ReactNode> = {
  overview: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  addresses: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  account: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M6.5 19a6 6 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6"/></svg>,
  communication: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H7l-3 3V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  safeplay: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10 8l-4 4 4 4M6 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const MENU: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'account', label: 'Account details' },
  { id: 'communication', label: 'Communication' },
  { id: 'safeplay', label: 'Safe Play' },
]

export default function AccountClient({
  name, email, totalTickets, totalEntries, activeEntries,
  tier, nextTier, progressPct, tickets,
}: Props) {
  const [view, setView] = useState<View>('overview')
  const [filter, setFilter] = useState<Filter>('all')

  const firstName = name.trim().split(' ')[0]

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const filtered = tickets.filter(t => {
    if (filter === 'active') return t.competition.status === 'active'
    if (filter === 'past') return t.competition.status !== 'active'
    return true
  })

  return (
    <div className="acc">
      <div className="acc__shell">

        {/* ── Greeting ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <h1 className="acc__greet">
            <span className="acc__wave">👋</span> Hi {firstName}
            <button className="acc__notyou" onClick={logout}>Not {firstName}? <span>Logout</span></button>
          </h1>
          <p className="acc__credit">
            Site Credit
            <span className="acc__credit-q" title="Credit can be used towards any competition entry at checkout.">?</span>
            <strong>{formatCurrency(0)}</strong>
          </p>
        </motion.div>

        {/* ── Menu ── */}
        <motion.nav className="acc__menu" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.08 }}>
          {MENU.map(m => (
            <button key={m.id} className={`acc__menu-item${view === m.id ? ' active' : ''}`} onClick={() => setView(m.id)}>
              <span className="acc__menu-icon">{icons[m.id]}</span>
              {m.label}
            </button>
          ))}
          <button className="acc__menu-item acc__menu-item--logout" onClick={logout}>
            <span className="acc__menu-icon">{icons.logout}</span>
            Logout
          </button>
        </motion.nav>

        {/* ── View content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            {view === 'overview' && (
              <>
                {/* Stats strip */}
                <div className="acc__stats">
                  {[
                    { label: 'Total Entries', value: totalEntries },
                    { label: 'Total Tickets', value: totalTickets.toLocaleString() },
                    { label: 'Active', value: activeEntries },
                  ].map(s => (
                    <div key={s.label} className="acc__stat">
                      <p className="acc__stat-val">{s.value}</p>
                      <p className="acc__stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tier strip */}
                <div className="acc__tier" style={{ '--tier-color': tier.color } as React.CSSProperties}>
                  <div className="acc__tier-head">
                    <span className="acc__tier-name">{tier.name} Member</span>
                    <span className="acc__tier-sub">{nextTier ? `${nextTier.min - totalTickets} tickets to ${nextTier.name}` : 'Top tier reached'}</span>
                  </div>
                  <div className="acc__tier-track"><div className="acc__tier-fill" style={{ width: `${progressPct}%` }} /></div>
                </div>

                {/* Your Entries */}
                <div className="acc__entries-head">
                  <h2 className="acc__h2">Your Entries</h2>
                  <p className="acc__entries-sub">Your competition entries and their status.</p>
                </div>

                <div className="acc__filters">
                  <span className="acc__filters-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    Filters
                  </span>
                  <div className="acc__tabs">
                    {(['all', 'active', 'past'] as Filter[]).map(f => (
                      <button key={f} className={`acc__tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Past'}
                      </button>
                    ))}
                  </div>
                </div>

                {filtered.length > 0 ? (
                  <div className="acc__entries">
                    {filtered.map((ticket, i) => (
                      <motion.div
                        key={ticket.id}
                        className="acc__entry"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease, delay: i * 0.04 }}
                      >
                        <div className="acc__entry-left">
                          <Link href={`/competitions/${ticket.competition.slug}`} className="acc__entry-title">{ticket.competition.title}</Link>
                          <div className="acc__entry-meta">
                            <span>Entered {formatDate(ticket.purchasedAt)}</span>
                            {ticket.competition.drawDate && <span>Draw {formatDate(ticket.competition.drawDate)}</span>}
                          </div>
                        </div>
                        <div className="acc__entry-right">
                          <div className="acc__entry-stat">
                            <p className="acc__entry-stat-l">Tickets</p>
                            <p className="acc__entry-stat-v">{ticket.quantity}</p>
                          </div>
                          <div className="acc__entry-stat">
                            <p className="acc__entry-stat-l">Prize</p>
                            <p className="acc__entry-stat-v acc__entry-stat-v--accent">{formatCurrency(ticket.competition.prizeValue)}</p>
                          </div>
                          <span className={`acc__badge ${ticket.competition.status === 'active' ? 'acc__badge--live' : ''}`}>
                            {ticket.competition.status === 'active' ? 'Live' : ticket.competition.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="acc__empty">
                    <p className="acc__empty-title">{filter === 'all' ? 'No entries yet' : `No ${filter} entries`}</p>
                    <p className="acc__empty-sub">Browse our live competitions and enter today.</p>
                    <Link href="/competitions" className="btn-gold" style={{ marginTop: '1.5rem' }}>Browse Competitions</Link>
                  </div>
                )}
              </>
            )}

            {view === 'account' && (
              <div className="acc__panel">
                <h2 className="acc__h2">Account details</h2>
                <div className="acc__field"><span>Name</span><strong>{name}</strong></div>
                <div className="acc__field"><span>Email</span><strong>{email}</strong></div>
                <div className="acc__field"><span>Membership</span><strong>{tier.name}</strong></div>
                <p className="acc__panel-note">Need to update your details or password? Contact <Link href="/contact">support</Link>.</p>
              </div>
            )}

            {view === 'addresses' && (
              <div className="acc__panel">
                <h2 className="acc__h2">Addresses</h2>
                <p className="acc__panel-note">No delivery address saved yet. You&apos;ll be asked for one if you win a physical prize.</p>
              </div>
            )}

            {view === 'communication' && (
              <div className="acc__panel">
                <h2 className="acc__h2">Communication</h2>
                <label className="acc__toggle"><input type="checkbox" defaultChecked /> Email me about new competitions</label>
                <label className="acc__toggle"><input type="checkbox" defaultChecked /> Email me when I win</label>
                <label className="acc__toggle"><input type="checkbox" /> Marketing &amp; offers</label>
                <p className="acc__panel-note">Preferences are saved to your account.</p>
              </div>
            )}

            {view === 'safeplay' && (
              <div className="acc__panel">
                <h2 className="acc__h2">Safe Play</h2>
                <p className="acc__panel-note">We&apos;re committed to fun, fair play. Competitions are 18+. If gambling stops being fun, take a break — set personal limits or self-exclude any time by contacting <Link href="/contact">support</Link>.</p>
                <p className="acc__panel-note">Free help: <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware.org</a></p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .acc { background: var(--bg); min-height: calc(100vh - 80px); }
        .acc__shell { max-width: 760px; margin: 0 auto; padding: 2.5rem clamp(1.25rem,3vw,2rem) 5rem; }

        /* Greeting */
        .acc__greet { display: flex; align-items: center; gap: .625rem; flex-wrap: wrap; font-size: clamp(1.75rem,4vw,2.25rem); font-weight: 800; color: var(--ink); letter-spacing: -.02em; line-height: 1.1; }
        .acc__wave { font-size: 1.5rem; }
        .acc__notyou { background: none; border: none; cursor: pointer; font-family: inherit; font-size: .875rem; font-weight: 400; color: var(--ink3); }
        .acc__notyou span { color: var(--gold); text-decoration: underline; font-weight: 600; }
        .acc__credit { display: flex; align-items: center; gap: .5rem; margin-top: .875rem; font-size: 1.125rem; color: var(--ink2); }
        .acc__credit strong { color: var(--ink); font-weight: 800; }
        .acc__credit-q { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--ink3); color: var(--ink3); font-size: .6875rem; font-weight: 700; cursor: help; }

        /* Menu */
        .acc__menu { margin-top: 1.75rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-sm); }
        .acc__menu-item { display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1.125rem 1.5rem; background: none; border: none; border-bottom: 1px solid var(--border); cursor: pointer; font-family: inherit; font-size: 1.0625rem; font-weight: 600; color: var(--ink2); transition: background .15s, color .15s; text-align: left; }
        .acc__menu-item:last-child { border-bottom: none; }
        .acc__menu-item:hover { background: var(--bg); }
        .acc__menu-item.active { background: var(--gold-pale); color: var(--gold); }
        .acc__menu-item.active .acc__menu-icon { color: var(--gold); }
        .acc__menu-icon { display: inline-flex; color: var(--ink2); }
        .acc__menu-item--logout { color: #d23b3b; }
        .acc__menu-item--logout .acc__menu-icon { color: #d23b3b; }
        .acc__menu-item--logout:hover { background: #fdecea; }

        /* Stats */
        .acc__stats { margin-top: 2rem; display: grid; grid-template-columns: repeat(3,1fr); background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-sm); }
        .acc__stat { padding: 1.5rem 1rem; text-align: center; border-right: 1px solid var(--border); }
        .acc__stat:last-child { border-right: none; }
        .acc__stat-val { font-size: 2rem; font-weight: 800; color: var(--gold); line-height: 1; margin-bottom: .375rem; }
        .acc__stat-label { font-size: .55rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink3); }

        /* Tier */
        .acc__tier { margin-top: 1rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); }
        .acc__tier-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: .5rem; margin-bottom: .75rem; }
        .acc__tier-name { font-weight: 800; color: var(--ink); font-size: 1rem; }
        .acc__tier-sub { font-size: .75rem; color: var(--ink3); }
        .acc__tier-track { height: 6px; background: var(--bg2); border-radius: 999px; overflow: hidden; }
        .acc__tier-fill { height: 100%; background: var(--tier-color, var(--gold)); border-radius: 999px; }

        /* Your Entries */
        .acc__entries-head { margin-top: 2.5rem; }
        .acc__h2 { font-size: 1.5rem; font-weight: 800; color: var(--ink); letter-spacing: -.01em; }
        .acc__entries-sub { font-size: .875rem; color: var(--ink3); margin-top: .25rem; }
        .acc__filters { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.25rem 0 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .acc__filters-icon { display: inline-flex; align-items: center; gap: .5rem; font-size: .8125rem; font-weight: 600; color: var(--ink2); padding: .5rem .875rem; border: 1px solid var(--border); border-radius: 999px; }
        .acc__tabs { display: flex; gap: .5rem; }
        .acc__tab { padding: .5rem 1.125rem; border-radius: 999px; border: 1px solid var(--border); background: var(--card); font-family: inherit; font-size: .8125rem; font-weight: 600; color: var(--ink2); cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
        .acc__tab.active { background: var(--gold-pale); color: var(--gold); border-color: var(--gold); }

        /* Entries */
        .acc__entries { display: flex; flex-direction: column; gap: .75rem; }
        .acc__entry { background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; transition: border-color .2s, box-shadow .2s; }
        .acc__entry:hover { border-color: var(--gold); box-shadow: 0 4px 20px rgba(0,0,0,.06); }
        .acc__entry-left { flex: 1; min-width: 0; }
        .acc__entry-title { font-size: 1.0625rem; font-weight: 700; color: var(--ink); text-decoration: none; display: block; margin-bottom: .375rem; transition: color .2s; }
        .acc__entry-title:hover { color: var(--gold); }
        .acc__entry-meta { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .acc__entry-meta span { font-size: .75rem; color: var(--ink3); }
        .acc__entry-right { display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap; }
        .acc__entry-stat { text-align: right; }
        .acc__entry-stat-l { font-size: .5rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); margin-bottom: .125rem; }
        .acc__entry-stat-v { font-size: 1.25rem; font-weight: 800; color: var(--ink); }
        .acc__entry-stat-v--accent { color: var(--gold); }
        .acc__badge { display: inline-block; padding: .3rem .75rem; font-size: .55rem; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; background: var(--bg2); color: var(--ink3); border-radius: 999px; }
        .acc__badge--live { background: var(--gold-pale); color: var(--gold); }

        /* Empty */
        .acc__empty { text-align: center; padding: 3.5rem 2rem; border: 1px dashed var(--border); border-radius: var(--r-card); background: var(--card); }
        .acc__empty-title { font-size: 1.25rem; font-weight: 800; color: var(--ink); margin-bottom: .375rem; }
        .acc__empty-sub { font-size: .875rem; color: var(--ink3); }

        /* Side panels */
        .acc__panel { margin-top: 2rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.75rem; box-shadow: var(--shadow-sm); }
        .acc__panel .acc__h2 { margin-bottom: 1.25rem; }
        .acc__field { display: flex; justify-content: space-between; gap: 1rem; padding: .875rem 0; border-bottom: 1px solid var(--border); font-size: .9375rem; }
        .acc__field span { color: var(--ink3); }
        .acc__field strong { color: var(--ink); font-weight: 700; }
        .acc__panel-note { font-size: .8125rem; color: var(--ink3); line-height: 1.7; margin-top: 1rem; }
        .acc__panel-note a { color: var(--gold); text-decoration: underline; }
        .acc__toggle { display: flex; align-items: center; gap: .75rem; padding: .75rem 0; font-size: .9375rem; color: var(--ink2); cursor: pointer; }
        .acc__toggle input { width: 18px; height: 18px; accent-color: var(--gold); }
      `}</style>
    </div>
  )
}
