import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <AdminNav />
      <main style={{ marginLeft: '240px', flex: 1, padding: '2.5rem', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
