import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    redirect('/')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '▦' },
    { href: '/admin/competitions', label: 'Competitions', icon: '◈' },
    { href: '/admin/orders', label: 'Orders', icon: '◉' },
    { href: '/admin/winners', label: 'Winners', icon: '★' },
    { href: '/admin/contacts', label: 'Contacts', icon: '✉' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f2ec' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#1c1a18',
          color: '#9a8878',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #2a2826' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.1em', color: '#fdf6ef' }}>
              IVORY VAULT
            </span>
          </Link>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b76e79', marginTop: '4px' }}>
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1.5rem',
                fontSize: '0.85rem',
                color: '#9a8878',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                borderLeft: '2px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#fdf6ef'
                e.currentTarget.style.borderLeftColor = '#b76e79'
                e.currentTarget.style.backgroundColor = 'rgba(183,110,121,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#9a8878'
                e.currentTarget.style.borderLeftColor = 'transparent'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #2a2826' }}>
          <Link href="/" style={{ fontSize: '0.75rem', color: '#5c524a', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '2.5rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
