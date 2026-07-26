import { prisma } from '@/lib/prisma'
import UsersTable from './UsersTable'

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, siteCredit: true, createdAt: true,
        _count: { select: { tickets: true, instantSpins: true } },
      },
    })
  } catch { return [] }
}

export default async function AdminUsersPage() {
  const users = await getUsers()
  const serial = users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    siteCredit: u.siteCredit, createdAt: u.createdAt.toISOString(),
    tickets: u._count.tickets, spins: u._count.instantSpins,
  }))
  return <UsersTable users={serial} />
}
