'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/competitions', label: 'Competitions', icon: '◈' },
  { href: '/admin/users', label: 'Members', icon: '◕' },
  { href: '/admin/orders', label: 'Orders', icon: '◉' },
  { href: '/admin/winners', label: 'Winners', icon: '★' },
  { href: '/admin/winner-email', label: 'Winner Email', icon: '✦' },
  { href: '/admin/instant', label: 'Instant Wins', icon: '⚡' },
  { href: '/admin/instant-win', label: 'Instant Win', icon: '🎟' },
  { href: '/admin/contacts', label: 'Contacts', icon: '✉' },
  { href: '/admin/integrations', label: 'Integrations', icon: '⚙' },
  { href: '/admin/guide', label: 'Guide', icon: '❔' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span className="admin-sidebar__brand">IVORY VAULT</span>
          </Link>
          <p className="admin-sidebar__sub">Admin Panel</p>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-link${active ? ' active' : ''}`}>
                <span className="admin-nav-link__icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__back">← Back to Site</Link>
        </div>
      </aside>

      <style>{`
        .admin-sidebar {
          width: 240px; background: var(--ink); color: var(--ink3);
          display: flex; flex-direction: column; flex-shrink: 0;
          position: fixed; top: 0; left: 0; height: 100vh; overflow-y: auto;
        }
        .admin-sidebar__logo { padding: 2rem 1.5rem; border-bottom: 1px solid #2a2826; }
        .admin-sidebar__brand {
          font-family: var(--font-cormorant,serif); font-size: 1.25rem;
          font-weight: 600; letter-spacing: .1em; color: #ffffff;
        }
        .admin-sidebar__sub {
          font-size: .65rem; letter-spacing: .15em; text-transform: uppercase;
          color: var(--gold); margin-top: 4px;
        }
        .admin-sidebar__nav { padding: 1rem 0; flex: 1; }
        .admin-nav-link {
          display: flex; align-items: center; gap: .875rem;
          padding: .875rem 1.5rem; font-size: .85rem; color: var(--ink3);
          text-decoration: none; border-left: 2px solid transparent;
          transition: color .2s, background .2s, border-color .2s;
        }
        .admin-nav-link:hover, .admin-nav-link.active {
          color: #ffffff; border-left-color: var(--gold);
          background: rgba(37,99,235,.12);
        }
        .admin-nav-link__icon { font-size: 1rem; }
        .admin-sidebar__footer { padding: 1.5rem; border-top: 1px solid #2a2826; }
        .admin-sidebar__back { font-size: .75rem; color: var(--ink2); text-decoration: none; transition: color .2s; }
        .admin-sidebar__back:hover { color: var(--ink3); }
      `}</style>
    </>
  )
}
