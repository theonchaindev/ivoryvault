import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SpinWheel from '@/components/SpinWheel'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Spin to Win — Ivory Vault',
  description: 'New members get a free spin for site credit.',
}

export default async function SpinPage() {
  const session = await getSession()
  if (!session) redirect('/login?from=/spin')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { freeSpins: true, siteCredit: true },
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 80px)' }}>
      <SpinWheel freeSpins={user?.freeSpins ?? 0} startCredit={user?.siteCredit ?? 0} />
    </div>
  )
}
