import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** Admin: how many times the giveaway banner has been clicked. */
export async function GET() {
  try {
    await requireAdmin()
    const rows = await prisma.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int AS count FROM "GiveawayClick"`)
    return NextResponse.json({ clicks: rows?.[0]?.count ?? 0 })
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    }
    // Table not created yet (no clicks) — report zero.
    return NextResponse.json({ clicks: 0 })
  }
}
